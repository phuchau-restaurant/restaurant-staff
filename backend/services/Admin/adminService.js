// backend/services/Admin/adminService.js
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import archiver from "archiver";

const QR_SECRET = process.env.QR_SECRET || "qr-secret-key"; // TODO: Set in .env
const QR_EXPIRE_DAYS = parseInt(process.env.QR_EXPIRE_DAYS) || 365; // Mặc định 1 năm
const CUSTOMER_URL = process.env.CUSTOMER_URL || "http://localhost:5173";

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

      if (user.role?.toLowerCase() !== "admin") {
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

      // 5. Lưu thông tin QR token vào database
      const updatedTable = await this.tablesRepository.updateQRInfo(
        table.id,
        tenantId,
        {
          qrToken: qrToken,
          qrTokenCreatedAt: now.toISOString(),
        }
      );

      return {
        tableId: updatedTable.id,
        tableNumber: updatedTable.tableNumber,
        qrToken: qrToken,
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

      const customerLoginUrl = `${CUSTOMER_URL}/login?token=${jwtToken}`;

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

      const customerLoginUrl = `${CUSTOMER_URL}/login?token=${jwtToken}`;

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

    // Sanitize table number để tránh ký tự không hợp lệ trong filename
    const safeTableNumber = String(table.tableNumber).replace(
      /[^a-zA-Z0-9-_]/g,
      "-"
    );

    return {
      buffer,
      contentType: "image/png",
      filename: `qr-table-${safeTableNumber}.png`,
    };
  }

  /**
   * Private: Tạo QR PDF với thiết kế đẹp
   */
  async _generateQRPDF(table, url) {
    return new Promise(async (resolve, reject) => {
      try {
        // Tạo QR code dạng buffer để nhúng vào PDF
        const qrBuffer = await QRCode.toBuffer(url, {
          errorCorrectionLevel: "H",
          type: "png",
          margin: 2,
          scale: 10,
          width: 400,
          color: {
            dark: "#1a1a2e",
            light: "#ffffff",
          },
        });

        // Tạo PDF document
        const doc = new PDFDocument({
          size: "A4",
          margin: 0,
        });

        const buffers = [];

        // Collect PDF data vào buffer
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          const safeTableNumber = String(table.tableNumber).replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          );
          resolve({
            buffer: pdfBuffer,
            contentType: "application/pdf",
            filename: `qr-table-${safeTableNumber}.pdf`,
          });
        });

        doc.on("error", reject);

        // === Layout PDF với thiết kế đẹp ===
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const centerX = pageWidth / 2;

        // 1. Background gradient effect (simulated với rectangles)
        doc.rect(0, 0, pageWidth, pageHeight).fill("#f8fafc");
        
        // Header decorative bar
        doc.rect(0, 0, pageWidth, 120).fill("#1e40af");
        
        // Decorative accent line
        doc.rect(0, 120, pageWidth, 8).fill("#3b82f6");

        // 2. Restaurant name / Title area
        doc
          .fontSize(28)
          .font("Helvetica-Bold")
          .fillColor("#ffffff")
          .text("RESTAURANT", 0, 35, {
            align: "center",
            width: pageWidth,
          });

        doc
          .fontSize(14)
          .font("Helvetica")
          .fillColor("#93c5fd")
          .text("Scan • Order • Enjoy", 0, 70, {
            align: "center",
            width: pageWidth,
          });

        // 3. Table number badge
        const badgeWidth = 200;
        const badgeHeight = 60;
        const badgeX = centerX - badgeWidth / 2;
        const badgeY = 155;

        // Badge background
        doc
          .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 30)
          .fill("#1e40af");

        // Badge text
        doc
          .fontSize(32)
          .font("Helvetica-Bold")
          .fillColor("#ffffff")
          .text(`Table ${table.tableNumber}`, 0, badgeY + 13, {
            align: "center",
            width: pageWidth,
          });

        // 4. QR Code với frame
        const qrSize = 280;
        const qrX = centerX - qrSize / 2;
        const qrY = 250;

        // QR frame/border
        const framePadding = 20;
        doc
          .roundedRect(
            qrX - framePadding,
            qrY - framePadding,
            qrSize + framePadding * 2,
            qrSize + framePadding * 2,
            15
          )
          .fill("#ffffff");

        // QR shadow effect
        doc
          .roundedRect(
            qrX - framePadding + 4,
            qrY - framePadding + 4,
            qrSize + framePadding * 2,
            qrSize + framePadding * 2,
            15
          )
          .fill("#e2e8f0");

        // QR frame lại
        doc
          .roundedRect(
            qrX - framePadding,
            qrY - framePadding,
            qrSize + framePadding * 2,
            qrSize + framePadding * 2,
            15
          )
          .fill("#ffffff");

        // QR Code image
        doc.image(qrBuffer, qrX, qrY, {
          width: qrSize,
          height: qrSize,
        });

        // 5. Instructions section
        const instructY = qrY + qrSize + 50;

        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .fillColor("#1e293b")
          .text("Scan to Order", 0, instructY, {
            align: "center",
            width: pageWidth,
          });

        // Step by step instructions
        const stepsY = instructY + 45;
        const steps = [
          "1. Open camera on your phone",
          "2. Point at QR code",
          "3. Tap notification to open menu",
        ];

        doc.fontSize(14).font("Helvetica").fillColor("#64748b");

        steps.forEach((step, index) => {
          doc.text(step, 0, stepsY + index * 25, {
            align: "center",
            width: pageWidth,
          });
        });

        // 6. Footer với decorative elements
        const footerY = pageHeight - 80;

        // Footer line
        doc
          .moveTo(80, footerY - 20)
          .lineTo(pageWidth - 80, footerY - 20)
          .strokeColor("#e2e8f0")
          .lineWidth(2)
          .stroke();

        // Footer text
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#94a3b8")
          .text("Thank you for dining with us!", 0, footerY, {
            align: "center",
            width: pageWidth,
          });

        doc
          .fontSize(10)
          .fillColor("#cbd5e1")
          .text("Need help? Ask our friendly staff", 0, footerY + 20, {
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

        const customerLoginUrl = `${CUSTOMER_URL}/login?token=${jwtToken}`;

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
