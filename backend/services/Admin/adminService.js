// backend/services/Admin/adminService.js
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import archiver from "archiver";

const QR_SECRET = process.env.QR_SECRET || "qr-secret-key"; // TODO: Set in .env
const QR_EXPIRE_DAYS = parseInt(process.env.QR_EXPIRE_DAYS) || 365; // Mặc định 1 năm
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export default class AdminService {
  constructor(tablesRepository, usersRepository) {
    this.tablesRepository = tablesRepository;
    this.usersRepository = usersRepository;
  }

  /**
   * Tạo QR code cho bàn
   * @param {string} tableId - ID của bàn
   * @param {string} tenantId - ID của tenant
   * @param {string} userId - ID của user (admin)
   * @returns {Object} - Thông tin QR code và bàn
   */
  async generateTableQR(tableId, tenantId, userId) {
    try {
      // 1. Kiểm tra quyền admin
      const user = await this.usersRepository.getById(userId);

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      if (user.role !== "admin") {
        const error = new Error("Only admins can generate QR codes");
        error.statusCode = 403;
        throw error;
      }

      // 2. Kiểm tra bàn có tồn tại và thuộc tenant không
      const table = await this.tablesRepository.getByIdAndTenant(
        tableId,
        tenantId
      );

      if (!table) {
        const error = new Error(
          "Table not found or does not belong to this tenant"
        );
        error.statusCode = 404;
        throw error;
      }

      // 3. Tạo JWT token với thông tin bàn
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + QR_EXPIRE_DAYS);

      const qrToken = uuidv4(); // Unique token cho mỗi QR

      const tokenPayload = {
        tableId: table.id,
        tenantId: tenantId,
        qrToken: qrToken,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const jwtToken = jwt.sign(tokenPayload, QR_SECRET, {
        expiresIn: `${QR_EXPIRE_DAYS}d`,
      });

      // 4. Tạo URL cho customer login với token
      const customerLoginUrl = `${FRONTEND_URL}/customer/login?token=${jwtToken}`;

      // 5. Lưu thông tin QR token vào database
      const updatedTable = await this.tablesRepository.updateQRInfo(
        table.id,
        tenantId,
        {
          qrToken: qrToken,
          qrTokenCreatedAt: now.toISOString(),
        }
      );

      // 6. Tạo QR code từ URL (generate on-demand)
      const qrCodeDataURL = await QRCode.toDataURL(customerLoginUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      });

      return {
        tableId: updatedTable.id,
        tableNumber: updatedTable.tableNumber,
        qrCode: qrCodeDataURL,
        qrToken: qrToken,
        customerLoginUrl: customerLoginUrl,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      throw error;
    }
  }

  /**
   * View/Preview QR code cho bàn (không tạo mới)
   * @param {string} tableId - ID của bàn
   * @param {string} tenantId - ID của tenant
   * @returns {Object} - Thông tin QR code và bàn
   */
  async viewTableQR(tableId, tenantId) {
    try {
      // 1. Lấy bàn + qrToken
      const table = await this.tablesRepository.getByIdAndTenant(
        tableId,
        tenantId
      );

      if (!table) {
        const error = new Error(
          "Table not found or does not belong to this tenant"
        );
        error.statusCode = 404;
        throw error;
      }

      if (!table.qrToken) {
        const error = new Error(
          "QR code not generated for this table yet. Please generate first."
        );
        error.statusCode = 404;
        throw error;
      }

      // 2. Ký lại JWT từ qrToken đã có
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + QR_EXPIRE_DAYS);

      const tokenPayload = {
        tableId: table.id,
        tenantId: tenantId,
        qrToken: table.qrToken, // Sử dụng token đã có
        createdAt: table.qrTokenCreatedAt || now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const jwtToken = jwt.sign(tokenPayload, QR_SECRET, {
        expiresIn: `${QR_EXPIRE_DAYS}d`,
      });

      // 3. Tạo URL cho customer login
      const customerLoginUrl = `${FRONTEND_URL}/customer/login?token=${jwtToken}`;

      // 4. Generate QR image
      const qrCodeDataURL = await QRCode.toDataURL(customerLoginUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      });

      // 5. Trả về thông tin
      return {
        tableId: table.id,
        tableNumber: table.tableNumber,
        qrCode: qrCodeDataURL,
        customerLoginUrl: customerLoginUrl,
        qrTokenCreatedAt: table.qrTokenCreatedAt,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Xác thực QR token khi khách hàng scan
   * @param {string} token - JWT token từ QR code
   * @returns {Object} - Thông tin bàn và tenant
   */
  async verifyQRToken(token) {
    try {
      // Xác minh JWT token (JWT tự động kiểm tra expiration bằng 'exp' claim)
      const decoded = jwt.verify(token, QR_SECRET);

      // Kiểm tra bàn và token còn hợp lệ
      const table = await this.tablesRepository.getByIdAndTenant(
        decoded.tableId,
        decoded.tenantId
      );

      if (!table) {
        const error = new Error("Table not found");
        error.statusCode = 404;
        throw error;
      }

      if (table.qrToken !== decoded.qrToken) {
        const error = new Error("QR code is no longer valid");
        error.statusCode = 401;
        throw error;
      }

      return {
        tableId: table.id,
        tableNumber: table.tableNumber,
        tenantId: decoded.tenantId,
        isValid: true,
      };
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        error.statusCode = 401;
        error.message = "Invalid or expired QR code";
      }
      if (!error.statusCode) error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Download QR code cho bàn (PNG hoặc PDF)
   * @param {string} tableId - ID của bàn
   * @param {string} tenantId - ID của tenant
   * @param {string} format - Định dạng file: 'png' hoặc 'pdf'
   * @returns {Object} - Buffer và metadata để download
   */
  async downloadTableQR(tableId, tenantId, format = "png") {
    try {
      // 1. Kiểm tra bàn có tồn tại và thuộc tenant không
      const table = await this.tablesRepository.getByIdAndTenant(
        tableId,
        tenantId
      );

      if (!table) {
        const error = new Error(
          "Table not found or does not belong to this tenant"
        );
        error.statusCode = 404;
        throw error;
      }

      // 2. Kiểm tra bàn đã có qr_token chưa
      if (!table.qrToken) {
        const error = new Error(
          "Table does not have a QR code. Please generate one first."
        );
        error.statusCode = 400;
        throw error;
      }

      // 3. Tạo URL từ qr_token
      const tokenPayload = {
        tableId: table.id,
        tenantId: tenantId,
        qrToken: table.qrToken,
        createdAt: table.qrTokenCreatedAt,
      };

      const jwtToken = jwt.sign(tokenPayload, QR_SECRET, {
        expiresIn: `${QR_EXPIRE_DAYS}d`,
      });

      const customerLoginUrl = `${FRONTEND_URL}/customer/login?token=${jwtToken}`;

      // 4. Generate QR code theo format
      if (format === "pdf") {
        return await this._generateQRPDF(table, customerLoginUrl);
      } else {
        return await this._generateQRPNG(table, customerLoginUrl);
      }
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Private: Tạo QR PNG
   */
  async _generateQRPNG(table, url) {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 2,
      scale: 10,
      width: 500,
    });

    return {
      buffer,
      contentType: "image/png",
      filename: `qr-table-${table.tableNumber}.png`,
    };
  }

  /**
   * Private: Tạo QR PDF
   */
  async _generateQRPDF(table, url) {
    return new Promise(async (resolve, reject) => {
      try {
        // Tạo QR code dạng buffer để nhúng vào PDF
        const qrBuffer = await QRCode.toBuffer(url, {
          errorCorrectionLevel: "H",
          type: "png",
          margin: 1,
          scale: 10,
          width: 400,
        });

        // Tạo PDF document
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
        });

        const buffers = [];

        // Collect PDF data vào buffer
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({
            buffer: pdfBuffer,
            contentType: "application/pdf",
            filename: `qr-table-${table.tableNumber}.pdf`,
          });
        });

        doc.on("error", reject);

        // === Layout PDF ===
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // 1. Logo placeholder (nếu có)
        // doc.image('path/to/logo.png', 50, 50, { width: 100 });

        // 2. Tiêu đề lớn
        doc
          .fontSize(36)
          .font("Helvetica-Bold")
          .text(`Table ${table.tableNumber}`, 0, 100, {
            align: "center",
            width: pageWidth,
          });

        // 3. QR Code - căn giữa
        const qrSize = 350;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = 200;

        doc.image(qrBuffer, qrX, qrY, {
          width: qrSize,
          height: qrSize,
        });

        // 4. Hướng dẫn
        doc
          .fontSize(24)
          .font("Helvetica")
          .text("Scan to Order", 0, qrY + qrSize + 40, {
            align: "center",
            width: pageWidth,
          });

        // 5. Optional: WiFi info
        doc
          .fontSize(12)
          .font("Helvetica")
          .text("WiFi: Restaurant-Guest", 0, pageHeight - 100, {
            align: "center",
            width: pageWidth,
          })
          .text("Password: welcome123", 0, pageHeight - 80, {
            align: "center",
            width: pageWidth,
          });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download tất cả QR code của tất cả bàn trong 1 ZIP
   * @param {string} tenantId - ID của tenant
   * @param {string} format - 'png', 'pdf', hoặc 'all'
   * @returns {Object} - Stream và metadata để download
   */
  async downloadAllTableQR(tenantId, format = "all") {
    try {
      // 1. Lấy tất cả bàn có qr_token của tenant
      const tables = await this.tablesRepository.getAllByTenantWithQR(tenantId);

      if (!tables || tables.length === 0) {
        const error = new Error(
          "No tables with QR codes found. Please generate QR codes first."
        );
        error.statusCode = 404;
        throw error;
      }

      // 2. Generate tất cả QR codes trước
      const qrFiles = [];

      for (const table of tables) {
        // Tạo URL từ qr_token
        const tokenPayload = {
          tableId: table.id,
          tenantId: tenantId,
          qrToken: table.qrToken,
          createdAt: table.qrTokenCreatedAt,
        };

        const jwtToken = jwt.sign(tokenPayload, QR_SECRET, {
          expiresIn: `${QR_EXPIRE_DAYS}d`,
        });

        const customerLoginUrl = `${FRONTEND_URL}/customer/login?token=${jwtToken}`;

        // Generate theo format
        if (format === "png" || format === "all") {
          const pngResult = await this._generateQRPNG(table, customerLoginUrl);
          qrFiles.push(pngResult);
        }

        if (format === "pdf" || format === "all") {
          const pdfResult = await this._generateQRPDF(table, customerLoginUrl);
          qrFiles.push(pdfResult);
        }
      }

      // 3. Tạo archive và add tất cả files
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Compression level
      });

      // Add all files to archive
      qrFiles.forEach((file) => {
        archive.append(file.buffer, { name: file.filename });
      });

      // Tạo filename phù hợp
      let filename = "qr-codes-all-tables";
      if (format === "png") filename += "-png";
      else if (format === "pdf") filename += "-pdf";
      filename += ".zip";

      return {
        archive,
        filename,
      };
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      throw error;
    }
  }
}
