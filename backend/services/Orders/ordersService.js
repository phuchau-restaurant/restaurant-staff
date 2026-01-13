//backend/services/Orders/ordersService.js
import OrdersStatus from "../../constants/orderStatus.js";
import OrderDetailStatus from "../../constants/orderdetailStatus.js";
class OrdersService {
  // Inject 6 Repo: Orders, OrderDetails, Menus, OrderItemModifiers, ModifierOptions, Tables
  constructor(ordersRepo, orderDetailsRepo, menusRepo, orderItemModifiersRepo, modifierOptionsRepo, tablesRepo) {
    this.ordersRepo = ordersRepo;
    this.orderDetailsRepo = orderDetailsRepo;
    this.menusRepo = menusRepo;
    this.orderItemModifiersRepo = orderItemModifiersRepo;
    this.modifierOptionsRepo = modifierOptionsRepo;
    this.tablesRepo = tablesRepo;
  }

  async createOrder({ tenantId, tableId, dishes }) {
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!tableId) throw new Error("Table ID is required");
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      throw new Error("Order must have at least one dish");
    }

    // 1. Tính toán & Chuẩn bị data chi tiết
    let calculatedTotalAmount = 0;
    let totalPrepTime = 0; // Tổng thời gian chuẩn bị
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

      // Cộng dồn thời gian chuẩn bị của từng món
      if (menuItem.prepTimeMinutes) {
        totalPrepTime += menuItem.prepTimeMinutes * quantity;
      }

      // Xử lý modifiers: Lấy giá từ DB để đảm bảo chính xác
      let modifierTotal = 0;
      let validModifiers = [];

      if (modifiers && Array.isArray(modifiers) && modifiers.length > 0) {
        // Collect option IDs
        const modifierIds = modifiers.map(m => m.optionId);

        // Fetch modifier options from DB
        // Sử dụng Promise.all kèm map để lấy thông tin option
        const modifierOptions = await Promise.all(
          modifierIds.map(id => this.modifierOptionsRepo.getById(id))
        );

        // Calculate total and filter valid modifiers
        modifiers.forEach(mod => {
          const dbOption = modifierOptions.find(opt => opt && opt.id === mod.optionId);
          if (dbOption) {
            const price = (dbOption.priceAdjustment ?? dbOption.price) || 0; // Sử dụng priceAdjustment từ DB
            modifierTotal += parseFloat(price);
            validModifiers.push({
              ...mod,
              optionName: dbOption.name, // Cập nhật tên từ DB luôn cho chắc chắn
              price: parseFloat(price)
            });
          }
        });
      }

      const subTotal = (parseFloat(unitPrice) + modifierTotal) * quantity;
      calculatedTotalAmount += subTotal;

      orderDetailsToCreate.push({
        tenantId,
        dishId: dishId,
        quantity,
        unitPrice,
        note: description,
        status: null,
        modifiers: validModifiers, // Sử dụng danh sách modifiers đã validate và có giá
      });
    }

    // 2. Tạo Order Header
    const newOrder = await this.ordersRepo.create({
      tenantId,
      tableId,
      status: OrdersStatus.UNSUBMIT, // Mặc định khi tạo là 'Unsubmit'
      totalAmount: calculatedTotalAmount,
      prepTimeOrder: totalPrepTime, // Tổng thời gian chuẩn bị đơn hàng
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

    // Lấy tên bàn
    let tableNumber = order.tableId;
    if (order.tableId && this.tablesRepo) {
      const tableInfo = await this.tablesRepo.getById(order.tableId);
      if (tableInfo) {
        tableNumber = tableInfo.tableNumber;
      }
    }
    // Enrich order với tableNumber
    const enrichedOrder = { ...order, tableNumber };

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
    // Group modifiers by order_detail_id và gắn vào details
    // Đồng thời fetch thông tin giá từ bảng modifier_options nếu cần
    const modifierOptionIds = allModifiers.map(m => m.modifierOptionId);

    // Fetch full modifier options info (để lấy giá)
    let modifierOptionsDetails = [];
    if (modifierOptionIds.length > 0 && this.modifierOptionsRepo) {
      // Giả sử có hàm getByIds. Nếu không có thì dùng Promise.all hoặc sửa Repo
      // Ở đây ta dùng Promise.all tạm thời nếu repo chưa support getByIds
      modifierOptionsDetails = await Promise.all(
        modifierOptionIds.map(id => this.modifierOptionsRepo.getById(id))
      );
    }

    const enrichedDetailsWithModifiers = enrichedDetails.map((detail) => ({
      ...detail,
      modifiers: allModifiers
        .filter((mod) => mod.orderDetailId === detail.id)
        .map((mod) => {
          const fullOption = modifierOptionsDetails.find(opt => opt && opt.id === mod.modifierOptionId);
          return {
            ...mod.toResponse(),
            price: fullOption ? fullOption.price : 0
          };
        }),
    }));

    return { order: enrichedOrder, details: enrichedDetailsWithModifiers };
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

      // 4. Tính toán totalAmount và prepTimeOrder từ dishes mới
      let calculatedTotalAmount = 0;
      let totalPrepTime = 0; // Tổng thời gian chuẩn bị
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

        // Cộng dồn thời gian chuẩn bị của từng món
        if (menuItem.prepTimeMinutes) {
          totalPrepTime += menuItem.prepTimeMinutes * quantity;
        }

        // Tính giá modifiers từ DB
        let modifierTotal = 0;
        let validModifiers = [];

        if (modifiers && Array.isArray(modifiers) && modifiers.length > 0) {
          const modifierIds = modifiers.map(m => m.optionId);
          const modifierOptions = await Promise.all(
            modifierIds.map(id => this.modifierOptionsRepo.getById(id))
          );

          modifiers.forEach(mod => {
            const dbOption = modifierOptions.find(opt => opt && opt.id === mod.optionId);
            if (dbOption) {
              const price = (dbOption.priceAdjustment ?? dbOption.price) || 0;
              modifierTotal += parseFloat(price);
              validModifiers.push({
                ...mod,
                optionName: dbOption.name,
                price: parseFloat(price)
              });
            }
          });
        }

        const subTotal = (parseFloat(unitPrice) + modifierTotal) * quantity;
        calculatedTotalAmount += subTotal;

        orderDetailsToCreate.push({
          tenantId,
          orderId: id,
          dishId,
          quantity,
          unitPrice,
          note: description || "",
          status: OrderDetailStatus.PENDING,
          modifiers: validModifiers, // Lưu modifiers đã validate
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

      // 7. Update totalAmount và prepTimeOrder
      updates.totalAmount = calculatedTotalAmount;
      updates.prepTimeOrder = totalPrepTime;
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
      // Tự động chuyển các OrderDetail có status Pending/Preparing thành Ready
      const allDetails = currentOrder.details;
      const pendingOrPreparingItems = allDetails.filter(
        (item) => item.status === OrderDetailStatus.PENDING || item.status === OrderDetailStatus.PREPARING
      );

      // Update các items chưa hoàn thành thành Ready
      if (pendingOrPreparingItems.length > 0) {
        for (const item of pendingOrPreparingItems) {
          await this.orderDetailsRepo.update(item.id, {
            status: OrderDetailStatus.READY,
          });
        }
      }

      updates.completedAt = new Date();
    }

    // IF OrderStatus == Served -> Tự động chuyển các items thành Served
    else if (
      updates.status === OrdersStatus.SERVED &&
      currentOrder.order.status !== OrdersStatus.SERVED
    ) {
      // Chuyển tất cả items còn Ready thành Served
      const allDetails = currentOrder.details;
      const readyItems = allDetails.filter(
        (item) => item.status === OrderDetailStatus.READY ||
          item.status === OrderDetailStatus.PENDING ||
          item.status === OrderDetailStatus.PREPARING
      );

      if (readyItems.length > 0) {
        for (const item of readyItems) {
          await this.orderDetailsRepo.update(item.id, {
            status: OrderDetailStatus.SERVED,
          });
        }
      }
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
    // Lấy tất cả đơn TRỪ Unsubmit (Kitchen chỉ thấy đơn đã được waiter xác nhận)
    let orders = await this.ordersRepo.getAll({
      tenant_id: tenantId,
      status: orderStatus, //filter order by status
    });

    // Kitchen LUÔN lọc bỏ đơn Unsubmit (không giống waiter)
    // Bếp chỉ thấy đơn đã được waiter xác nhận gửi
    orders = orders.filter(o => o.status !== OrdersStatus.UNSUBMIT);

    if (!orders || orders.length === 0) return [];

    //  Lấy danh sách các order_id
    const orderIds = orders.map((o) => o.id);

    // --- LẤY TÊN BÀN ---
    // Lấy danh sách table_id duy nhất
    const tableIds = [...new Set(orders.map(o => o.tableId))];
    const tablesInfo = await this.tablesRepo.getByIds(tableIds);
    // Tạo map để tra cứu nhanh: tableId -> tableName
    const tableMap = {};
    tablesInfo.forEach(table => {
      tableMap[table.id] = table.tableNumber;
    });

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
          tableId: tableMap[order.tableId] || order.tableId, // Trả về tên bàn, fallback về ID nếu không tìm thấy
          orderStatus: order.status, // Trạng thái đơn (Approved, Pending, etc) cho Kitchen button
          note: order.note || "...",
          createdAt: order.createdAt,
          prepTimeOrder: order.prepTimeOrder, // Thời gian chuẩn bị đơn hàng (phút)
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
        // Tự động update trạng thái đơn hàng cha thành 'Served' (Đã phục vụ)
        await this.ordersRepo.update(orderId, {
          status: OrdersStatus.SERVED,
          completedAt: new Date(),
        });
      }
    }

    return updatedItem;
  }

  // === WAITER ORDER METHODS ===

  /**
   * Nhận đơn - Gán waiter_id vào đơn hàng và chuyển trạng thái sang Pending
   * @param {number} orderId - ID đơn hàng
   * @param {string} waiterId - ID nhân viên phục vụ
   * @param {string} tenantId - ID tenant
   * @param {boolean} confirmUnconfirmed - Xác nhận cập nhật món null sang Pending
   */
  async claimOrder(orderId, waiterId, tenantId, confirmUnconfirmed = false) {
    // 1. Kiểm tra đơn hàng tồn tại và thuộc tenant
    const { order, details } = await this.getOrderById(orderId, tenantId);

    // 2. Kiểm tra đơn chưa được nhận
    if (order.waiterId) {
      throw new Error("Order already claimed by another waiter");
    }

    // 3. Kiểm tra và đếm các món chưa xác nhận (status null hoặc không phải Pending/Ready/Served/Cancelled)
    const unconfirmedItems = details.filter(item =>
      !item.status ||
      (item.status !== OrderDetailStatus.PENDING &&
        item.status !== OrderDetailStatus.READY &&
        item.status !== OrderDetailStatus.SERVED &&
        item.status !== OrderDetailStatus.CANCELLED)
    );

    // 3.1. Nếu có món chưa xác nhận và người dùng chưa confirm -> trả về thông tin để frontend xử lý
    if (unconfirmedItems.length > 0 && !confirmUnconfirmed) {
      return {
        needsConfirmation: true,
        unconfirmedItems: unconfirmedItems.map(item => ({
          id: item.id,
          dishId: item.dishId,
          name: item.name,
          quantity: item.quantity,
          status: item.status
        })),
        order: order,
        details: details
      };
    }

    // 4. Gán waiter_id và chuyển trạng thái ĐƠN sang Approved
    const updatedOrder = await this.ordersRepo.update(orderId, {
      waiterId: waiterId,
      status: OrdersStatus.APPROVED,
    });

    // 5. Chuyển các món chưa xác nhận sang Pending (nếu có và đã được confirm)
    for (const item of unconfirmedItems) {
      await this.orderDetailsRepo.update(item.id, {
        status: OrderDetailStatus.PENDING,
      });
    }

    // 6. Trả về order đầy đủ với details và thông tin về số món đã cập nhật
    const result = await this.getOrderById(orderId, tenantId);
    return {
      needsConfirmation: false,
      ...result,
      itemsUpdatedToPending: unconfirmedItems.length
    };
  }

  /**
   * Lấy đơn hàng của nhân viên phục vụ (đơn của tôi)
   * @param {string} waiterId - ID nhân viên
   * @param {string} tenantId - ID tenant
   */
  async getMyOrders(waiterId, tenantId) {
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!waiterId) throw new Error("Waiter ID is required");

    console.log(`📋 getMyOrders: waiterId=${waiterId}, tenantId=${tenantId}`);
    const orders = await this.ordersRepo.getByWaiterId(waiterId, tenantId);
    console.log(`📋 getMyOrders: Found ${orders.length} orders, statuses:`, orders.map(o => o.status));

    // Enrich with table names
    if (orders && orders.length > 0) {
      const tableIds = [...new Set(orders.map(o => o.tableId))];
      const tablesInfo = await this.tablesRepo.getByIds(tableIds);
      const tableMap = {};
      tablesInfo.forEach(table => {
        tableMap[table.id] = table.tableNumber;
      });

      // Map table names to orders
      return orders.map(order => ({
        ...order,
        tableNumber: tableMap[order.tableId] || order.tableId
      }));
    }

    return orders;
  }

  /**
   * Lấy đơn hàng chưa có người nhận
   * @param {string} tenantId - ID tenant
   */
  async getUnassignedOrders(tenantId) {
    if (!tenantId) throw new Error("Tenant ID is required");

    const orders = await this.ordersRepo.getUnassignedOrders(tenantId);

    // Enrich with table names
    if (orders && orders.length > 0) {
      const tableIds = [...new Set(orders.map(o => o.tableId))];
      const tablesInfo = await this.tablesRepo.getByIds(tableIds);
      const tableMap = {};
      tablesInfo.forEach(table => {
        tableMap[table.id] = table.tableNumber;
      });

      // Map table names to orders
      return orders.map(order => ({
        ...order,
        tableNumber: tableMap[order.tableId] || order.tableId
      }));
    }

    return orders;
  }
}

export default OrdersService;
