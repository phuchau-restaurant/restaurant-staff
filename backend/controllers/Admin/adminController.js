// backend/controllers/Admin/adminController.js
import { emitQRGenerated } from "../../utils/qrSocketEmitters.js";

export default class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  /**
   * Generate QR code cho bàn
   * POST /admin/tables/:id/qr/generate
   */
  generateTableQR = async (req, res, next) => {
    try {
      const tableId = req.params.id;
      const tenantId = req.tenantId; // Từ tenantMiddleware
      const userId = req.userId; // Từ authMiddleware

      // Gọi service để tạo QR
      const result = await this.adminService.generateTableQR(
        tableId,
        tenantId,
        userId
      );

      // Emit socket event for real-time updates
      emitQRGenerated(tenantId, { 
        tableId, 
        tableNumber: result.tableNumber,
        qrToken: result.qrToken,
        qrTokenCreatedAt: result.qrTokenCreatedAt 
      });

      res.status(200).json({
        message: "QR code generated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xác thực QR token (dùng cho customer)
   * POST /admin/qr/verify
   */
  verifyQRToken = async (req, res, next) => {
    try {
      const { token } = req.body;

      if (!token) {
        const error = new Error("Token is required");
        error.statusCode = 400;
        throw error;
      }

      const result = await this.adminService.verifyQRToken(token);

      res.status(200).json({
        message: "QR code verified successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * View/Preview QR code cho bàn
   * GET /admin/tables/:id/qr/view
   */
  viewTableQR = async (req, res, next) => {
    try {
      const tableId = req.params.id;
      const tenantId = req.tenantId; // Từ tenantMiddleware

      // Gọi service để lấy QR code
      const result = await this.adminService.viewTableQR(tableId, tenantId);

      res.status(200).json({
        message: "QR code retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download QR code
   * GET /admin/tables/:id/qr/download?format=png|pdf
   */
  downloadTableQR = async (req, res, next) => {
    try {
      const tableId = req.params.id;
      const tenantId = req.tenantId; // Từ tenantMiddleware
      const format = req.query.format || "png"; // Mặc định PNG

      // Validate format
      if (!["png", "pdf"].includes(format.toLowerCase())) {
        const error = new Error("Invalid format. Use 'png' or 'pdf'");
        error.statusCode = 400;
        throw error;
      }

      // Gọi service để tạo QR file
      const result = await this.adminService.downloadTableQR(
        tableId,
        tenantId,
        format.toLowerCase()
      );

      // Set headers và trả file
      res.setHeader("Content-Type", result.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`
      );
      res.setHeader("Content-Length", result.buffer.length);

      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download tất cả QR codes (ZIP)
   * GET /admin/tables/qr/download-all?format=png|pdf|all
   */
  downloadAllTableQR = async (req, res, next) => {
    try {
      const tenantId = req.tenantId; // Từ tenantMiddleware
      const format = req.query.format || "all"; // Mặc định cả PNG và PDF

      // Validate format
      if (!["png", "pdf", "all"].includes(format.toLowerCase())) {
        const error = new Error("Invalid format. Use 'png', 'pdf', or 'all'");
        error.statusCode = 400;
        throw error;
      }

      // Gọi service để tạo ZIP
      const result = await this.adminService.downloadAllTableQR(
        tenantId,
        format.toLowerCase()
      );

      // Set headers
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`
      );

      // Handle archive events
      result.archive.on("error", (err) => {
        next(err);
      });

      // Pipe archive data to response
      result.archive.pipe(res);

      // Finalize the archive
      result.archive.finalize();
    } catch (error) {
      next(error);
    }
  };
}
