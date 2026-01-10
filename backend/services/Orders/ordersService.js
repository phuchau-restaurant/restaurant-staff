//backend/services/Orders/ordersService.js
import OrdersStatus from "../../constants/orderStatus.js";
import OrderDetailStatus from "../../constants/orderdetailStatus.js";
class OrdersService {
  // Inject 4 Repo: Orders, OrderDetails, Menus và OrderItemModifiers
  constructor(ordersRepo, orderDetailsRepo, menusRepo, orderItemModifiersRepo) {
    this.ordersRepo = ordersRepo;
    this.orderDetailsRepo = orderDetailsRepo;
    this.menusRepo = menusRepo;
    this.orderItemModifiersRepo = orderItemModifiersRepo;
  }

  async createOrder({ tenantId, tableId, dishes }) {
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!tableId) throw new Error("Table ID is required");
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      throw new Error("Order must have at least one dish");
    }

    // 1. Tính toán & Chuẩn bị data chi tiết
    let calculatedTotalAmount = 0;
    const orderDetailsToCreate = [];

    for (const dish of dishes) {
      // API gửi dishId, quantity, description, modifiers
      const { dishId, quantity, description, modifiers } = dish;

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

      // Tính giá modifiers
      let modifierTotal = 0;
      if (modifiers && Array.isArray(modifiers)) {
        modifierTotal = modifiers.reduce(
          (sum, mod) => sum + (mod.price || 0),
          0
        );
      }

      const subTotal = (unitPrice + modifierTotal) * quantity;
      calculatedTotalAmount += subTotal;

      orderDetailsToCreate.push({
        tenantId,
        dishId: dishId,
        quantity,
        unitPrice,
        note: description,
        status: null,
        modifiers, // Lưu modifiers tạm để xử lý sau
      });
    }

    // 2. Tạo Order Header
    const newOrder = await this.ordersRepo.create({
      tenantId,
      tableId,
      status: OrdersStatus.UNSUBMIT, // Mặc định khi tạo là 'Unsubmit'
      totalAmount: calculatedTotalAmount,
      // Tạo mã đơn hiển thị (ví dụ đơn giản)
      displayOrder: `ORD-${Date.now().toString().slice(-6)}`,
    });

    if (!newOrder) throw new Error("Failed to create order");

    // 3. Gắn OrderID vào các chi tiết và Lưu hàng loạt
    const finalDetailsPayload = orderDetailsToCreate.map((detail) => {
      const { modifiers, ...rest } = detail; // Tách modifiers ra
      return {
        ...rest,
        orderId: newOrder.id,
      };
    });

    const createdDetails = await this.orderDetailsRepo.createMany(
      finalDetailsPayload
    );

    // 4. Lưu modifiers vào bảng order_item_modifiers
    const modifiersToCreate = [];
    createdDetails.forEach((detail, index) => {
      const originalDish = orderDetailsToCreate[index];
      if (originalDish.modifiers && Array.isArray(originalDish.modifiers)) {
        originalDish.modifiers.forEach((mod) => {
          modifiersToCreate.push({
            orderDetailId: detail.id,
            modifierOptionId: mod.optionId,
            optionName: mod.optionName,
          });
        });
      }
    });

    if (modifiersToCreate.length > 0) {
      await this.orderItemModifiersRepo.createMany(modifiersToCreate);
    }

    // 5. Trả về kết quả gộp
    return {
      order: newOrder,
      details: createdDetails,
    };
  }

  async getOrderById(id, tenantId) {
    const order = await this.ordersRepo.getById(id);
    if (!order) throw new Error("Order not found");

    // Check Security Tenant
    if (tenantId && order.tenantId !== tenantId)
      throw new Error("Access denied: Order belongs to another tenant");

    // Lấy thêm chi tiết món
    const details = await this.orderDetailsRepo.getByOrderId(id);

    // Resolve dishName từ dishId bằng cách fetch menu items
    const dishIds = details.map((d) => d.dishId);
    const dishesInfo = await this.menusRepo.getByIds(dishIds);

    // Map dishName và thông tin menu đầy đủ vào details
    const enrichedDetails = details.map((detail) => {
      const dishInfo = dishesInfo.find((d) => d.id === detail.dishId);
      return {
        ...detail,
        dishName: dishInfo?.name || "Unknown Dish",
        menu: dishInfo
          ? {
              id: dishInfo.id,
              name: dishInfo.name,
              categoryId: dishInfo.categoryId,
              image: dishInfo.image,
              price: dishInfo.price,
            }
          : null,
      };
    });

    // Fetch modifiers cho các order details
    const detailIds = details.map((d) => d.id);
    const allModifiers = await this.orderItemModifiersRepo.getByOrderDetailIds(
      detailIds
    );

    // Group modifiers by order_detail_id và gắn vào details
    const enrichedDetailsWithModifiers = enrichedDetails.map((detail) => ({
      ...detail,
      modifiers: allModifiers
        .filter((mod) => mod.orderDetailId === detail.id)
        .map((mod) => mod.toResponse()),
    }));

    return { order, details: enrichedDetailsWithModifiers };
  }
  async updateOrder(id, tenantId, updates) {
    const currentOrder = await this.getOrderById(id, tenantId);

    // Nếu request gửi dishes mới, cần xóa old details và tạo new details
    if (updates.dishes && Array.isArray(updates.dishes)) {
      const dishes = updates.dishes;

      // 1. Lấy danh sách order detail IDs hiện tại
      const currentDetails = await this.orderDetailsRepo.getByOrderId(id);
      const currentDetailIds = currentDetails.map((d) => d.id);

      // 2. Xóa modifiers cũ trước
      if (currentDetailIds.length > 0) {
        await this.orderItemModifiersRepo.deleteByOrderDetailIds(
          currentDetailIds
        );
      }

      // 3. Xóa order details cũ
      await this.orderDetailsRepo.deleteByOrderId(id);

      // 4. Tính toán totalAmount từ dishes mới
      let calculatedTotalAmount = 0;
      const orderDetailsToCreate = [];

      for (const dish of dishes) {
        const { dishId, quantity, description, modifiers } = dish;

        if (!dishId || quantity <= 0) continue;

        // Lấy thông tin món từ DB để lấy giá chính xác
        const menuItem = await this.menusRepo.getById(dishId);
        if (!menuItem) {
          throw new Error(`Dish with ID ${dishId} not found`);
        }

        const unitPrice = menuItem.price;

        // Tính giá modifiers
        let modifierTotal = 0;
        if (modifiers && Array.isArray(modifiers)) {
          modifierTotal = modifiers.reduce(
            (sum, mod) => sum + (mod.price || 0),
            0
          );
        }

        const subTotal = (unitPrice + modifierTotal) * quantity;
        calculatedTotalAmount += subTotal;

        orderDetailsToCreate.push({
          tenantId,
          orderId: id,
          dishId,
          quantity,
          unitPrice,
          note: description || "",
          status: OrderDetailStatus.PENDING,
          modifiers, // Lưu tạm
        });
      }

      // 5. Tạo new order details
      if (orderDetailsToCreate.length > 0) {
        const finalDetailsPayload = orderDetailsToCreate.map((detail) => {
          const { modifiers, ...rest } = detail;
          return rest;
        });

        const createdDetails = await this.orderDetailsRepo.createMany(
          finalDetailsPayload
        );

        // 6. Lưu modifiers mới
        const modifiersToCreate = [];
        createdDetails.forEach((detail, index) => {
          const originalDish = orderDetailsToCreate[index];
          if (originalDish.modifiers && Array.isArray(originalDish.modifiers)) {
            originalDish.modifiers.forEach((mod) => {
              modifiersToCreate.push({
                orderDetailId: detail.id,
                modifierOptionId: mod.optionId,
                optionName: mod.optionName,
              });
            });
          }
        });

        if (modifiersToCreate.length > 0) {
          await this.orderItemModifiersRepo.createMany(modifiersToCreate);
        }
      }

      // 7. Update totalAmount
      updates.totalAmount = calculatedTotalAmount;
      // Bỏ dishes khỏi updates vì đã xử lý riêng
      delete updates.dishes;
    }

    // Kiểm tra logic nghiệp vụ status

    // IF OrderStatus == Pending -> All OrderDetail status = Pending
    if (
      updates.status === OrdersStatus.PENDING &&
      currentOrder.order.status !== OrdersStatus.PENDING
    ) {
      await this.orderDetailsRepo.updateByOrderId(id, {
        status: OrderDetailStatus.PENDING,
      });
    }

    // IF OrderStatus == Completed
    else if (
      updates.status === OrdersStatus.COMPLETED &&
      currentOrder.order.status !== OrdersStatus.COMPLETED
    ) {
      // All OrderDetail.Status != ORDER_DETAIL_STATUS.PENDING
      const allDetails = currentOrder.details;
      const allServed = allDetails.every(
        (item) => item.status !== OrderDetailStatus.PENDING // Ready, Served, Cancelled
      );
      if (!allServed) {
        throw new Error(
          "Cannot complete order: there are still pending dishes"
        );
      }
      updates.completedAt = new Date();
    }

    // IF OrderStatus == Cancelled -> All OrderDetail = Cancelled
    else if (
      updates.status === OrdersStatus.CANCELLED &&
      currentOrder.order.status !== OrdersStatus.CANCELLED
    ) {
      await this.orderDetailsRepo.updateByOrderId(id, {
        status: OrderDetailStatus.CANCELLED,
      });
    }

    // 3. Gọi Repo update order header
    return await this.ordersRepo.update(id, updates);
  }

  async deleteOrder(id, tenantId) {
    await this.getOrderById(id, tenantId);

    // 1. Lấy order detail IDs
    const details = await this.orderDetailsRepo.getByOrderId(id);
    const detailIds = details.map((d) => d.id);

    // 2. Xóa modifiers trước (nếu có)
    if (detailIds.length > 0) {
      await this.orderItemModifiersRepo.deleteByOrderDetailIds(detailIds);
    }

    // 3. Xóa order details
    await this.orderDetailsRepo.deleteByOrderId(id);

    // 4. Xóa order
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
  async getKitchenOrders(
    tenantId,
    orderStatus,
    categoryId = null,
    itemStatus = null
  ) {
    const orders = await this.ordersRepo.getAll({
      tenant_id: tenantId,
      status: orderStatus, //filter order by status
    });

    if (!orders || orders.length === 0) return [];

    //  Lấy danh sách các order_id
    const orderIds = orders.map((o) => o.id);

    // Lấy toàn bộ OrderDetails của các đơn này
    // và lọc theo itemStatus nếu có
    const allDetails = await this.orderDetailsRepo.getByOrderIds(
      orderIds,
      itemStatus
    );

    // Lấy thông tin Tên món ăn (Dishes/Menus)
    // Lấy ra tất cả dishId từ list chi tiết -> theo api contact
    const dishIds = allDetails.map((d) => d.dishId);
    const dishesInfo = await this.menusRepo.getByIds(dishIds);

    // --- LẤY MODIFIERS ---
    const detailIds = allDetails.map((d) => d.id);
    const allModifiers = await this.orderItemModifiersRepo.getByOrderDetailIds(
      detailIds
    );

    // Ghép dữ liệu lại theo cấu trúc yêu cầu
    const result = orders
      .map((order) => {
        // Lọc ra các món (order items) thuộc đơn hàng này
        const myItems = allDetails.filter((d) => d.orderId === order.id);

        // Map sang format hiển thị và lọc Category
        const visibleDishes = myItems
          .map((item) => {
            const dish = dishesInfo.find((d) => d.id === item.dishId);

            // --- LỌC CATEGORY ---
            // Nếu có yêu cầu categoryId nhưng món này không khớp -> Bỏ qua
            if (
              categoryId &&
              dish &&
              String(dish.categoryId) !== String(categoryId)
            ) {
              return null; // comment dòng này để trả về tất cả các món
            }

            // Lọc modifiers cho item này
            const itemModifiers = allModifiers
              .filter((m) => m.orderDetailId === item.id)
              .map((m) => ({
                id: m.id,
                optionName: m.optionName,
                price: m.price,
              }));

            return {
              order_detail_id: item.id,
              dishId: item.dishId,
              name: dish ? dish.name : "Unknown Dish",
              quantity: item.quantity,
              note: item.note,
              status: item.status,
              modifiers: itemModifiers, // Thêm modifiers vào response
              // Trả về categoryId để frontend tiện debug nếu cần
              categoryId: dish ? dish.categoryId : null,
              image: dish ? dish.imgUrl : null,
            };
          })
          .filter((d) => d !== null); // Loại bỏ các món bị null (do không khớp category)

        // --- KIỂM TRA RỖNG ---
        // 1. Nếu lọc itemStatus mà không còn món nào -> Bỏ qua đơn
        // 2. HOẶC: Nếu lọc categoryId mà đơn này không có món nào thuộc category đó -> Bỏ qua đơn
        if (visibleDishes.length === 0) return null;

        return {
          orderId: order.id,
          tableId: order.tableId,
          note: order.note || "...",
          createdAt: order.createdAt,
          dishes: visibleDishes, // Chỉ trả về các món đã lọc
        };
      })
      .filter((item) => item !== null); // Loại bỏ các đơn rỗng

    return result;
  }

  async updateDishStatus(tenantId, orderId, orderDetailId, newStatus) {
    // 1. Kiểm tra đơn hàng cha có tồn tại và thuộc tenant không
    // (Bước này quan trọng để bảo mật, tránh hacker đoán ID)
    await this.getOrderById(orderId, tenantId);

    // 2. Cập nhật trạng thái món ăn (Gọi OrderDetailsRepository)
    // Lưu ý: Repository của bạn cần có hàm update (như bài trước chúng ta đã làm)
    const updatedItem = await this.orderDetailsRepo.update(orderDetailId, {
      status: newStatus,
    });

    if (!updatedItem) {
      throw new Error("Order detail not found or update failed");
    }

    // --- LOGIC MỞ RỘNG (OPTIONAL) ---
    // Ví dụ: Nếu trạng thái là 'served' (đã phục vụ), kiểm tra xem cả đơn đã xong chưa?

    if (newStatus === OrderDetailStatus.SERVED) {
      const allItems = await this.orderDetailsRepo.getByOrderId(orderId);
      const allServed = allItems.every(
        (item) =>
          item.status === OrderDetailStatus.SERVED ||
          item.status === OrderDetailStatus.CANCELLED
      );

      if (allServed) {
        // Tự động update trạng thái đơn hàng cha thành 'completed'
        await this.ordersRepo.update(orderId, {
          status: OrdersStatus.COMPLETED,
          completedAt: new Date(),
        });
      }
    }

    return updatedItem;
  }
}

export default OrdersService;
