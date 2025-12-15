// backend/middlewares/qrTokenMiddleware.js
import jwt from "jsonwebtoken";
import { TablesRepository } from "../repositories/implementation/TablesRepository.js";

const QR_SECRET = process.env.QR_SECRET || "qr-secret-key";
const tablesRepo = new TablesRepository();

/**
 * Middleware xác thực QR token cho customer
 * Kiểm tra token hợp lệ và bàn có thể sử dụng
 */
export const verifyQRTokenMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Kiểm tra token có tồn tại không
    const token = req.query.token;
    const tableIdQuery = req.query.table;

    if (!token) {
      const error = new Error("QR token is required. Please scan the QR code.");
      error.statusCode = 400;
      throw error;
    }

    // 2️⃣ Xác minh token về mặt chữ ký (JWT verify)
    let decoded;
    try {
      decoded = jwt.verify(token, QR_SECRET);
    } catch (err) {
      const error = new Error("Invalid or tampered QR code.");
      error.statusCode = 401;
      throw error;
    }

    // 3️⃣ Kiểm tra tableId trong token có khớp với query không (nếu có)
    if (
      tableIdQuery &&
      decoded.tableId.toString() !== tableIdQuery.toString()
    ) {
      const error = new Error("Token does not match the requested table.");
      error.statusCode = 403;
      throw error;
    }

    // 4️⃣ Kiểm tra token có hết hạn không
    const now = new Date();
    const expiresAt = new Date(decoded.expiresAt);

    if (now > expiresAt) {
      const error = new Error("QR code has expired. Please request a new one.");
      error.statusCode = 401;
      throw error;
    }

    // 5️⃣ Kiểm tra bàn có tồn tại và token có bị vô hiệu hóa không
    const table = await tablesRepo.getByIdAndTenant(
      decoded.tableId,
      decoded.tenantId
    );

    if (!table) {
      const error = new Error("Table not found.");
      error.statusCode = 404;
      throw error;
    }

    // 6️⃣ Kiểm tra token có bị regenerate (vô hiệu hóa) chưa
    if (table.qrToken !== decoded.qrToken) {
      const error = new Error(
        "QR code is no longer valid. It has been regenerated."
      );
      error.statusCode = 401;
      throw error;
    }

    // 7️⃣ Kiểm tra bàn có đang active không
    if (!table.isActive) {
      const error = new Error("This table is currently inactive.");
      error.statusCode = 403;
      throw error;
    }

    // ✅ Token hợp lệ - Gắn thông tin vào request
    req.qrToken = {
      tableId: table.id,
      tableNumber: table.tableNumber,
      tenantId: decoded.tenantId,
      qrToken: decoded.qrToken,
    };

    // Override tenantId từ token (để đảm bảo đúng tenant)
    req.tenantId = decoded.tenantId;

    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
