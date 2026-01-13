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
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { status } = req.query; // Lọc theo trạng thái đơn hàng nếu có
      const filters = {};
      if (status) filters.status = status;
      const orders = await this.ordersService.getAllOrders(tenantId, filters);
      //clean response
      const responseData = orders.map((order) => {
        const { /*id: _oid,*/ tenantId: _tid, ...rest } = order;
        return rest;
      });
      return res.status(200).json({
        success: true,
        message: "Get all orders successfully",
        total: orders.length,
        data: responseData, //TODO: tạm thời trả về order id
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 400;
      next(error);
    }
  };
  // [GET] /api/kitchen/orders?status= <orderStatus> & categoryId = <Id> & itemStatus = <itemStatus>
  getForKitchen = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { status, categoryId, itemStatus } = req.query; // Lấy query param

      const orderStatus = status; //|| OrderStatus.PENDING;
      if (status && !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status: ${status}`,
        });
      }

      const data = await this.ordersService.getKitchenOrders(
        tenantId,
        orderStatus,
        categoryId,
        itemStatus
      );
      // Clean Response
      // const cleanedData = data.map(order => {
      //     const { id: _oid, tenantId: _tid, ...orderInfo } = order;
      // });
      const isOrderStatus = orderStatus ? ` with status ${orderStatus}` : "";
      const isItemStatus = itemStatus ? ` and item status ${itemStatus}` : "";
      const categoryInfo = categoryId ? ` in category Id = ${categoryId}` : "";
      const message = `Get orders${isOrderStatus}${categoryInfo}${isItemStatus} successfully`;
      return res.status(200).json({
        success: true,
        message: message,
        total: data.length,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  };

  // === WAITER ORDER ENDPOINTS ===

  // [PUT] /api/orders/:id/claim - Nhận đơn
  claimOrder = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const { waiterId, confirmUnconfirmed } = req.body;

      if (!waiterId) {
        return res.status(400).json({
          success: false,
          message: "Waiter ID is required",
        });
      }

      const result = await this.ordersService.claimOrder(
        id,
        waiterId,
        tenantId,
        confirmUnconfirmed
      );

      // Nếu cần xác nhận món null
      if (result.needsConfirmation) {
        return res.status(200).json({
          success: true,
          needsConfirmation: true,
          message: `Đơn hàng có ${result.unconfirmedItems.length} món chưa được xác nhận`,
          data: {
            unconfirmedItems: result.unconfirmedItems,
            orderId: result.order.id,
            tableNumber: result.order.tableNumber
          }
        });
      }

      // Clean Response - result now contains { order, details }
      const { tenantId: _tid, ...orderData } = result.order;
      const detailsData = result.details.map((d) => {
        const { tenantId, orderId, ...rest } = d;
        return rest;
      });

      // ✅ Emit socket event để Kitchen nhận thông báo đơn mới (Approved)
      emitOrderUpdated(tenantId, {
        orderId: result.order.id,
        tableId: result.order.tableId,
        tableNumber: result.order.tableNumber,
        status: result.order.status, // "Approved"
        waiterId: result.order.waiterId,
      });

      return res.status(200).json({
        success: true,
        message: "Order claimed successfully",
        data: {
          ...orderData,
          orderDetails: detailsData,
        },
      });
    } catch (error) {
      if (error.message.includes("already claimed")) {
        error.statusCode = 409; // Conflict
      } else if (error.message.includes("not found")) {
        error.statusCode = 404;
      }
      next(error);
    }
  };

  // [GET] /api/orders/my-orders?waiterId=xxx - Đơn của tôi
  getMyOrders = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { waiterId } = req.query;

      if (!waiterId) {
        return res.status(400).json({
          success: false,
          message: "Waiter ID is required in query params",
        });
      }

      const orders = await this.ordersService.getMyOrders(waiterId, tenantId);

      // Clean response
      const responseData = orders.map((order) => {
        const { tenantId: _tid, ...rest } = order;
        return rest;
      });

      return res.status(200).json({
        success: true,
        message: "Get my orders successfully",
        total: orders.length,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  };

  // [GET] /api/orders/unassigned - Đơn chưa có người nhận
  getUnassignedOrders = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;

      const orders = await this.ordersService.getUnassignedOrders(tenantId);

      // Clean response
      const responseData = orders.map((order) => {
        const { tenantId: _tid, ...rest } = order;
        return rest;
      });

      return res.status(200).json({
        success: true,
        message: "Get unassigned orders successfully",
        total: orders.length,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default OrdersController;
