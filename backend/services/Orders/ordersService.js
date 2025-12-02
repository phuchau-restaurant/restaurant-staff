class OrdersService {
  // Inject 3 Repo: Orders, OrderDetails và Menus (để check giá món)
  constructor(ordersRepo, orderDetailsRepo, menusRepo) {
    this.ordersRepo = ordersRepo;
    this.orderDetailsRepo = orderDetailsRepo;
    this.menusRepo = menusRepo;
  }

  async createOrder({ tenantId, tableId, customerId, dishes }) {
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!tableId) throw new Error("Table ID is required");
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      throw new Error("Order must have at least one dish");
    }

    // 1. Tính toán & Chuẩn bị data chi tiết
    let calculatedTotalAmount = 0;
    const orderDetailsToCreate = [];

    for (const dish of dishes) {
      // API gửi dishId, quantity, description
      const { dishId, quantity, description } = dish;

      if (!dishId || quantity <= 0) continue;

      // Lấy thông tin món từ DB (Bảng dishes) để lấy giá chính xác
      const menuItem = await this.menusRepo.getById(dishId);
      
      if (!menuItem) {
        throw new Error(`Dish with ID ${dishId} not found`);
      }
      if (menuItem.tenantId !== tenantId) {
        throw new Error(`Dish ${dishId} does not belong to this tenant`);
      }

      const unitPrice = menuItem.price;
      const subTotal = unitPrice * quantity;
      calculatedTotalAmount += subTotal;

      orderDetailsToCreate.push({
        tenantId,
        dishId: dishId,   // Model OrderDetails dùng dishId
        quantity,
        unitPrice,
        note: description, // Map description từ API vào note
        status: 'pending'
      });
    }

    // 2. Tạo Order Header
    const newOrder = await this.ordersRepo.create({
      tenantId,
      tableId,
      customerId,
      status: 'pending',
      totalAmount: calculatedTotalAmount,
      // Tạo mã đơn hiển thị (ví dụ đơn giản)
      displayOrder: `ORD-${Date.now().toString().slice(-6)}` 
    });

    if (!newOrder) throw new Error("Failed to create order");

    // 3. Gắn OrderID vào các chi tiết và Lưu hàng loạt
    const finalDetailsPayload = orderDetailsToCreate.map(detail => ({
      ...detail,
      orderId: newOrder.id
    }));

    const createdDetails = await this.orderDetailsRepo.createMany(finalDetailsPayload);

    // 4. Trả về kết quả gộp
    return {
      order: newOrder,
      details: createdDetails
    };
  }

  async getOrderById(id, tenantId) {
      const order = await this.ordersRepo.getById(id);
      if(!order) throw new Error("Order not found");
      
      // Check Security Tenant
      if(tenantId && order.tenantId !== tenantId) throw new Error("Access denied: Order belongs to another tenant");
      
      // Lấy thêm chi tiết món
      const details = await this.orderDetailsRepo.getByOrderId(id);
      
      return { order, details };
  }
  async updateOrder(id, tenantId, updates) {
    const currentOrder = await this.getOrderById(id, tenantId);

    if (updates.status === 'completed' && currentOrder.order.status !== 'completed') {
        updates.completedAt = new Date(); // TODO: Date hay Date utc ?
    }

    // 3. Gọi Repo update
    return await this.ordersRepo.update(id, updates);
  }

  async deleteOrder(id, tenantId) {
    await this.getOrderById(id, tenantId);

    // 2. Xóa dữ liệu con trước (OrderDetails)
    // Để tránh lỗi Foreign Key Constraint nếu DB không có Cascade Delete
    await this.orderDetailsRepo.deleteByOrderId(id);

    // 3. Xóa dữ liệu cha (Order)
    return await this.ordersRepo.delete(id);
  }


  //GET all orders for kitchen view
  async getAllOrders(tenantId, filters = {}) {
    //check tenantId
    if (!tenantId) throw new Error("Tenant ID is required");

    // Thêm filter tenantId vào filters
    filters.tenant_id = tenantId;
    return await this.ordersRepo.getAll(filters);
  }


  /**
   * API cho Bếp/Bar
   * @param {string} tenantId 
   * @param {string} orderStatus - Trạng thái đơn (VD: pending)
   * @param {string} itemStatus - (Optional) Trạng thái món (VD: pending, ready)
   */
  async getKitchenOrders(tenantId, orderStatus, itemStatus = null) {

    const orders = await this.ordersRepo.getAll({ 
        tenant_id: tenantId, 
        status: orderStatus //filter order by status
    });

    if (!orders || orders.length === 0) return [];

    //  Lấy danh sách các order_id
    const orderIds = orders.map(o => o.id);

    // Lấy toàn bộ OrderDetails của các đơn này
    // và lọc theo itemStatus nếu có
    const allDetails = await this.orderDetailsRepo.getByOrderIds(orderIds, itemStatus);

    // Lấy thông tin Tên món ăn (Dishes/Menus)
    // Lấy ra tất cả dishId từ list chi tiết -> theo api contact
    const dishIds = allDetails.map(d => d.dishId);
    const dishesInfo = await this.menusRepo.getByIds(dishIds);

    // Ghép dữ liệu lại theo cấu trúc yêu cầu
    const result = orders.map(order => {
        // Lọc ra các món (order items) thuộc đơn hàng này
        const myItems = allDetails.filter(d => d.orderId === order.id);

        // Nếu lọc itemStatus (ví dụ lấy món 'pending') mà đơn này không còn món nào pending
        // thì bỏ qua đơn này (return null để filter sau)
        if (myItems.length === 0 && itemStatus) return null;

        return {
            orderId: order.id,
            tableId: order.tableId,
            //displayOrder: order.displayOrder, // Thêm cái này cho bếp dễ đọc mã đơn
            note: order.note ? order.note : "...", // Có thể thêm note chung của order nếu có
            created_at: order.createdAt,
            dishes: myItems.map(item => {
                // Tìm tên món ăn
                const dish = dishesInfo.find(d => d.id === item.dishId);
                return {
                    dishId: item.dishId,
                    name: dish ? dish.name : "Unknown Dish", // Map tên
                    quantity: item.quantity,
                    note: item.note, // Note riêng của món (ít hành...)
                    status: item.status // Trạng thái của món (pending/served)
                };
            })
        };
    }).filter(item => item !== null); // Loại bỏ các đơn rỗng (do lọc itemStatus)

    return result;
  }
}

export default OrdersService;