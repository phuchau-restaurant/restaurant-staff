import express from 'express';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';
import { emitCustomerCallStaff } from '../utils/customerSocketEmitters.js';

const router = express.Router();

// Bắt buộc có TenantID
router.use(tenantMiddleware);

/**
 * POST /api/customer/call-staff
 * Customer requests staff assistance (payment, service, help)
 * 
 * Body:
 * {
 *   "tableNumber": "A1",
 *   "tableId": 1,
 *   "orderId": 123,
 *   "requestType": "payment" | "service" | "help",
 *   "message": "Optional custom message"
 * }
 */
router.post('/call-staff', async (req, res) => {
  try {
    const { tableNumber, tableId, orderId, requestType, message } = req.body;
    const tenantId = req.tenantId;

    // Validate required fields
    if (!tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Số bàn là bắt buộc'
      });
    }

    // Emit socket event to notify staff
    emitCustomerCallStaff(tenantId, {
      tableNumber,
      tableId,
      orderId,
      requestType: requestType || 'payment',
      message: message || `Bàn ${tableNumber} cần hỗ trợ ${requestType === 'service' ? 'phục vụ' : 'thanh toán'}!`
    });

    res.status(200).json({
      success: true,
      message: 'Đã gọi nhân viên thành công'
    });
  } catch (error) {
    console.error('Error in call-staff endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gọi nhân viên'
    });
  }
});

export default router;
