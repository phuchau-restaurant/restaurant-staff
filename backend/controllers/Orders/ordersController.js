class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  // [POST] /api/orders
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      // Body nhận: tableId, customerId, dishes: [{ dishId, quantity, description }]
      const { tableId, customerId, dishes } = req.body;

      const result = await this.ordersService.createOrder({
        tenantId,
        tableId,
        customerId,
        dishes
      });

      // --- CLEAN RESPONSE (Lọc bỏ id, tenantId) ---
      
      // 1. Clean Order Info
      const { id: _oid, tenantId: _tid, ...orderData } = result.order;
      
      // 2. Clean Details Info (Map qua từng item)
      const detailsData = result.details.map(d => {
         const { id, tenantId, orderId, ...rest } = d;
         return rest;
      });

      return res.status(201).json({
        success: true,
        message: "Create order successfully",
        total: 1,
        data: {
            ...orderData,
            items: detailsData
        }
      });
    } catch (error) {
      // Lỗi validation hoặc logic
      error.statusCode = 400;
      next(error);
    }
  }
  // [PUT] /api/orders/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      // req.body chứa các trường muốn sửa: { status: 'completed', tableId: 5 ... }
      const updatedOrder = await this.ordersService.updateOrder(id, tenantId, req.body);

      // Clean Response (Destructuring)
      const { id: _oid, tenantId: _tid, ...returnData } = updatedOrder;

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }


  // [GET] /api/orders/:id
  getById = async (req, res, next) => {
      try {
          const tenantId = req.tenantId;
          const { id } = req.params;
          
          const result = await this.ordersService.getOrderById(id, tenantId);
          
          // Clean Response
          const { id: _oid, tenantId: _tid, ...orderData } = result.order;
          const detailsData = result.details.map(d => {
             const { id, tenantId, orderId, ...rest } = d;
             return rest;
          });

          return res.status(200).json({
              success: true,
              message: "Order fetched successfully",
              data: {
                ...orderData,
                items: detailsData
              }
          })
      } catch (error) {
          if (error.message.includes("not found")) error.statusCode = 404;
          else if (error.message.includes("Access denied")) error.statusCode = 403;
          next(error);
      }
  }
  // [DELETE] /api/orders/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.ordersService.deleteOrder(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Order and details deleted successfully"
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
  // [GET] /api/orders
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { status } = req.query; // Lọc theo trạng thái đơn hàng nếu có
      const filters = {};
      if (status) filters.status = status;
      const orders = await this.ordersService.getAllOrders(tenantId, filters);
      //clean response 
      const responseData = orders.map(order => {
          const { /*id: _oid,*/ tenantId: _tid, ...rest } = order;
          return rest;
      });
      return res.status(200).json({
        success: true,
        message: "Get all orders successfully",
        total: orders.length,
        data: responseData //TODO: tạm thời trả về order id
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 400;
      next(error);
    }
  }
  // [GET] /api/kitchen/orders?status= <orderStatus> &item_status= <itemStatus>
  getForKitchen = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { status, item_status } = req.query; // Lấy query param

      // Mặc định nếu không truyền status thì lấy 'pending'
      const orderStatus = status || 'pending';
      const itemStatus = item_status || null; // Nếu null thì lấy hết món

      const data = await this.ordersService.getKitchenOrders(tenantId, orderStatus, itemStatus);

      return res.status(200).json({
        success: true,
        message: `Get ${orderStatus} orders successfully`,
        total: data.length,
        data: data
      });

    } catch (error) {
      next(error);
    }
  }

}


export default OrdersController;