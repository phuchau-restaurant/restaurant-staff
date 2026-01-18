// backend/controllers/Orders/ordersController.js
import OrderStatus from "../../constants/orderStatus.js";
import OrderDetailStatus from "../../constants/orderdetailStatus.js";
import {
  emitOrderCreated,
  emitOrderUpdated,
  emitOrderDetailUpdated,
  emitOrderDeleted,
} from "../../utils/orderSocketEmitters.js";

class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  // [POST] /api/orders
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      // Body nhận: tableId, dishes: [{ dishId, quantity, description }]
      const { tableId, dishes } = req.body;

      const result = await this.ordersService.createOrder({
        tenantId,
        tableId,
        dishes,
      });

      // 1. Clean Order Info
      const { tenantId: _tid, ...orderData } = result.order;

      const detailsData = result.details.map((d) => {
        const { id, tenantId, orderId, ...rest } = d;
        return rest;
      });

      // Emit socket event for new order
      emitOrderCreated(tenantId, {
        orderId: result.order.id,
        tableId: result.order.tableId,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        displayOrder: result.order.displayOrder,
        items: detailsData,
      });

      return res.status(201).json({
        success: true,
        message: "Create order successfully",
        total: 1,
        data: {
          ...orderData,
          items: detailsData,
        },
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
  // [PUT] /api/orders/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const { status } = req.body;
      // Validate status nếu có
      if (status && !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status value: ${status}`,
        });
      }

      // req.body chứa các trường muốn sửa: { status: 'completed', tableId: 5, dishes: [...] }
      const updatedOrder = await this.ordersService.updateOrder(
        id,
        tenantId,
        req.body
      );

      // Clean Response - giữ lại id để frontend dùng
      const { tenantId: _tid, ...returnData } = updatedOrder;
      const mess = status
        ? `Order status updated to ${status}`
        : `Order updated successfully`;

      // Emit socket event for order update
      emitOrderUpdated(tenantId, {
        orderId: updatedOrder.id,
        ...returnData,
      });

      return res.status(200).json({
        message: mess,
        success: true,
        data: returnData,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [PUT] /api/kitchen/orders/:orderId/:orderDetailId
  // Cập nhật trạng thái một món ăn cụ thể
  updateOrderDetailStatus = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { orderId, orderDetailId } = req.params;
      const { status } = req.body; // Ví dụ: 'Ready', 'Served', 'Cancelled' hoặc OrderStatus.READY, .SERVED, .CANCELLED
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required in request body",
        });
      }
      if (!Object.values(OrderDetailStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status value: ${status}`,
        });
      }

      // Gọi Service (Hàm mới)
      const updatedDetail = await this.ordersService.updateDishStatus(
        tenantId,
        orderId,
        orderDetailId,
        status
      );
      // Clean Response
      const cleanedDetail = (({ tenantId, ...rest }) => rest)(updatedDetail);

      // Emit socket event for order detail update
      emitOrderDetailUpdated(tenantId, {
        orderId: parseInt(orderId),
        orderDetailId: updatedDetail.id,
        dishId: updatedDetail.dishId,
        status: updatedDetail.status,
        quantity: updatedDetail.quantity,
        unitPrice: updatedDetail.unitPrice,
      });

      return res.status(200).json({
        success: true,
        message: `Order detail status ${status} updated successfully`,
        data: cleanedDetail,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [GET] /api/orders/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      // Load đầy đủ với dishName khi xem chi tiết đơn hàng
      const result = await this.ordersService.getOrderById(id, tenantId);

      // Clean Response - giữ lại id để frontend có thể dùng
      const { tenantId: _tid, ...orderData } = result.order;
      const detailsData = result.details.map((d) => {
        const { tenantId, orderId, ...rest } = d;
        return rest;
      });

      return res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        data: {
          ...orderData,
          orderDetails: detailsData, // Đổi từ 'items' thành 'orderDetails' để consistent
        },
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  };
  // [DELETE] /api/orders/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.ordersService.deleteOrder(id, tenantId);

      // Emit socket event for order deletion
      emitOrderDeleted(tenantId, parseInt(id));

      return res.status(200).json({
        success: true,
        message: "Order and details deleted successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
  // [GET] /api/orders
  // Query params: status, waiterId, pageNumber, pageSize
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { status, waiterId, pageNumber, pageSize, hours } = req.query;

      // Xây dựng filters (bao gồm cả pagination nếu có)
      const filters = {};
      if (status) filters.status = status;
      if (waiterId) filters.waiterId = waiterId;
      if (pageNumber) filters.pageNumber = pageNumber;
      if (pageSize) filters.pageSize = pageSize;
      // Lọc theo số giờ gần nhất (VD: 24 giờ)
      if (hours) filters.hours = parseInt(hours);

      // Gọi service (tự xử lý pagination nếu có)
      const result = await this.ordersService.getAllOrders(tenantId, filters);

      // Kiểm tra có pagination hay không
      const usePagination = pageNumber && pageSize;

      // Build message
      let message = "Get orders";
      if (waiterId) message += ` for waiter ${waiterId}`;
      if (status) message += ` with status ${status}`;
      message += " successfully";

      if (usePagination) {
        // Response có pagination
        const responseData = result.data.map((order) => {
          const { tenantId: _tid, ...rest } = order;
          return rest;
        });

        return res.status(200).json({
          success: true,
          message: message,
          total: result.pagination.totalCount,
          data: responseData,
          pagination: result.pagination,
        });
      } else {
        // Response không có pagination
        const responseData = result.map((order) => {
          const { tenantId: _tid, ...rest } = order;
          return rest;
        });

        return res.status(200).json({
          success: true,
          message: message,
          total: result.length,
          data: responseData,
        });
      }
    } catch (error) {
      if (!error.statusCode) error.statusCode = 400;
      next(error);
    }
  };

  // [GET] /api/kitchen/orders?status=<orderStatus>&categoryId=<Id>&itemStatus=<itemStatus>&pageNumber=<page>&pageSize=<size>
  getForKitchen = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { status, categoryId, itemStatus, pageNumber, pageSize, hours } = req.query;

      const orderStatus = status;
      if (status && !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status: ${status}`,
        });
      }

      // Xây dựng pagination object nếu có
      const pagination = (pageNumber && pageSize)
        ? { pageNumber, pageSize }
        : null;

      // Parse hours parameter (VD: 24 giờ)
      const hoursFilter = hours ? parseInt(hours) : null;

      // Gọi service (tự xử lý pagination và hours filter nếu có)
      const result = await this.ordersService.getKitchenOrders(
        tenantId,
        orderStatus,
        categoryId,
        itemStatus,
        pagination,
        hoursFilter
      );

      // Build message
      const isOrderStatus = orderStatus ? ` with status ${orderStatus}` : "";
      const isItemStatus = itemStatus ? ` and item status ${itemStatus}` : "";
      const categoryInfo = categoryId ? ` in category Id = ${categoryId}` : "";
      const message = `Get orders${isOrderStatus}${categoryInfo}${isItemStatus} successfully`;

      // Kiểm tra có pagination hay không
      if (pagination) {
        return res.status(200).json({
          success: true,
          message: message,
          total: result.pagination.totalCount,
          data: result.data,
          pagination: result.pagination,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: message,
          total: result.length,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  };

}


export default OrdersController;
