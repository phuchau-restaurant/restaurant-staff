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

    // === CLAIM ORDER LOGIC ===
    // Nếu đang gán waiterId lần đầu (từ null) -> Đây là hành động "nhận đơn"
    if (updates.waiterId && !currentOrder.order.waiterId) {
      // Kiểm tra nếu đơn đã có waiter khác (phòng trường hợp race condition)
      const freshOrder = await this.ordersRepo.getById(id);
      if (freshOrder.waiterId) {
        throw new Error("Order already claimed by another waiter");
      }

      // Tự động chuyển status sang Approved
      updates.status = OrdersStatus.APPROVED;

      // Cập nhật các món chưa xác nhận (status null) -> Pending
      const unconfirmedItemIds = currentOrder.details
        .filter(item => !item.status || item.status === null)
        .map(item => item.id);

      if (unconfirmedItemIds.length > 0) {
        await this.orderDetailsRepo.updateByIds(unconfirmedItemIds, {
          status: OrderDetailStatus.PENDING,
        });
      }
    }

    // Kiểm tra nếu gán waiterId cho đơn đã có waiter khác
    if (updates.waiterId && currentOrder.order.waiterId &&
      updates.waiterId !== currentOrder.order.waiterId) {
      throw new Error("Cannot reassign order to different waiter");
    }

    // === STATUS TRANSITION LOGIC ===

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
      // Tự động chuyển các OrderDetail có status Pending thành Ready
      const allDetails = currentOrder.details;
      const pendingItemIds = allDetails
        .filter((item) => item.status === OrderDetailStatus.PENDING)
        .map((item) => item.id);

      // Batch update thay vì loop từng item
      if (pendingItemIds.length > 0) {
        await this.orderDetailsRepo.updateByIds(pendingItemIds, {
          status: OrderDetailStatus.READY,
        });
      }

      updates.completedAt = new Date();
    }

    // IF OrderStatus == Served -> Tự động chuyển các items thành Served
    else if (
      updates.status === OrdersStatus.SERVED &&
      currentOrder.order.status !== OrdersStatus.SERVED
    ) {
      // Chuyển tất cả items còn Ready hoặc Pending thành Served
      const allDetails = currentOrder.details;
      const itemIdsToServe = allDetails
        .filter(
          (item) =>
            item.status === OrderDetailStatus.READY ||
            item.status === OrderDetailStatus.PENDING
        )
        .map((item) => item.id);

      // Batch update thay vì loop từng item
      if (itemIdsToServe.length > 0) {
        await this.orderDetailsRepo.updateByIds(itemIdsToServe, {
          status: OrderDetailStatus.SERVED,
        });
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

  /**
   * Lấy danh sách đơn hàng với bộ lọc linh hoạt (hỗ trợ phân trang optional)
   * @param {string} tenantId - ID tenant (bắt buộc)
   * @param {Object} filters - Bộ lọc: { status, waiterId, includeTableName, pageNumber, pageSize }
   * @returns {Promise<Array|Object>} Mảng orders hoặc { data, pagination } nếu có phân trang
   */
  async getAllOrders(tenantId, filters = {}) {
    if (!tenantId) throw new Error("Tenant ID is required");

    // Chuẩn bị filters cho Repository
    const repoFilters = {
      tenant_id: tenantId,
    };

    // Lọc theo status (Unsubmit = đơn mới chưa ai nhận)
    if (filters.status) {
      repoFilters.status = filters.status;
    }

    // Lọc theo waiter_id (đơn của tôi)
    if (filters.waiterId) {
      repoFilters.waiter_id = filters.waiterId;
    }

    // Lọc theo số giờ gần nhất (VD: 24 giờ)
    if (filters.hours) {
      const hoursAgo = new Date(Date.now() - filters.hours * 60 * 60 * 1000);
      repoFilters.created_after = hoursAgo;
    }

    // Kiểm tra có yêu cầu pagination không
    const usePagination = filters.pageNumber && filters.pageSize;

    let orders;
    let paginationInfo = null;

    if (usePagination) {
      const result = await this.ordersRepo.getAllWithPagination(
        repoFilters,
        parseInt(filters.pageNumber),
        parseInt(filters.pageSize)
      );
      orders = result.data;
      paginationInfo = {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize
      };
    } else {
      orders = await this.ordersRepo.getAll(repoFilters);
    }

    // Enrich với tên bàn nếu cần
    if (orders && orders.length > 0 && filters.includeTableName !== false) {
      const tableIds = [...new Set(orders.map(o => o.tableId))];
      const tablesInfo = await this.tablesRepo.getByIds(tableIds);
      const tableMap = {};
      tablesInfo.forEach(table => {
        tableMap[table.id] = table.tableNumber;
      });

      orders = orders.map(order => ({
        ...order,
        tableNumber: tableMap[order.tableId] || order.tableId
      }));
    }

    // Trả về format khác nhau tùy theo có pagination hay không
    if (usePagination) {
      return {
        data: orders,
        pagination: paginationInfo
      };
    }

    return orders;
  }

  /**
   * API cho Bếp/Bar (hỗ trợ phân trang optional)
   * @param {string} tenantId
   * @param {string} orderStatus - Trạng thái đơn (VD: pending)
   * @param {string} categoryId - Lọc theo categoryId
   * @param {string} itemStatus - (Optional) Trạng thái món (VD: pending, ready)
   * @param {Object} pagination - { pageNumber, pageSize } (optional)
   * @param {number} hours - (Optional) Số giờ gần nhất để lọc đơn (VD: 24)
   * @returns {Promise<Array|Object>} Mảng orders hoặc { data, pagination } nếu có phân trang
   */
  async getKitchenOrders(
    tenantId,
    orderStatus,
    categoryId = null,
    itemStatus = null,
    pagination = null,
    hours = null
  ) {
    // Kiểm tra có yêu cầu pagination không
    const usePagination = pagination && pagination.pageNumber && pagination.pageSize;

    // Tạo filter cơ bản - CHỈ thêm status nếu có giá trị
    const repoFilters = { tenant_id: tenantId };
    if (orderStatus) {
      repoFilters.status = orderStatus;
    }

    // Lọc theo số giờ gần nhất (VD: 24 giờ)
    if (hours) {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      repoFilters.created_after = hoursAgo;
    }

    let orders;
    let paginationInfo = null;

    if (usePagination) {
      const result = await this.ordersRepo.getAllWithPagination(
        repoFilters,
        parseInt(pagination.pageNumber),
        parseInt(pagination.pageSize)
      );
      orders = result.data;
      paginationInfo = {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize
      };
    } else {
      // Lấy tất cả đơn TRỪ Unsubmit (Kitchen chỉ thấy đơn đã được waiter xác nhận)
      orders = await this.ordersRepo.getAll(repoFilters);
    }

    // Kitchen LUÔN lọc bỏ đơn Unsubmit
    orders = orders.filter(o => o.status !== OrdersStatus.UNSUBMIT);

    if (!orders || orders.length === 0) {
      // Trả về đúng format khi có pagination
      if (usePagination) {
        return { data: [], pagination: paginationInfo };
      }
      return [];
    }

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
          waiterId: order.waiterId, // ID nhân viên phục vụ để filter thông báo
          dishes: visibleDishes, // Chỉ trả về các món đã lọc
        };
      })
      .filter((item) => item !== null); // Loại bỏ các đơn rỗng

    // Trả về format khác nhau tùy theo có pagination hay không
    if (usePagination) {
      return {
        data: result,
        pagination: paginationInfo
      };
    }

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

    // Nếu trạng thái là 'ready', kiểm tra xem tất cả món (trừ cancelled) đã ready chưa?
    if (newStatus === OrderDetailStatus.READY) {
      const allItems = await this.orderDetailsRepo.getByOrderId(orderId);
      // Lọc các món không bị cancelled
      const nonCancelledItems = allItems.filter(
        (item) => item.status !== OrderDetailStatus.CANCELLED
      );

      // Kiểm tra nếu tất cả món non-cancelled đều là Ready
      const allReady = nonCancelledItems.length > 0 && nonCancelledItems.every(
        (item) => item.status === OrderDetailStatus.READY
      );

      if (allReady) {
        // Tự động update trạng thái đơn hàng cha thành 'Completed'
        await this.ordersRepo.update(orderId, {
          status: OrdersStatus.COMPLETED,
          completedAt: new Date(),
        });
      }
    }

    // Nếu trạng thái là 'served', kiểm tra xem tất cả món (trừ cancelled) đã served chưa?
    if (newStatus === OrderDetailStatus.SERVED) {
      const allItems = await this.orderDetailsRepo.getByOrderId(orderId);
      // Lọc các món không bị cancelled
      const nonCancelledItems = allItems.filter(
        (item) => item.status !== OrderDetailStatus.CANCELLED
      );

      // Kiểm tra nếu tất cả món non-cancelled đều là Served
      const allServed = nonCancelledItems.length > 0 && nonCancelledItems.every(
        (item) => item.status === OrderDetailStatus.SERVED
      );

      if (allServed) {
        // Tự động update trạng thái đơn hàng cha thành 'Served'
        await this.ordersRepo.update(orderId, {
          status: OrdersStatus.SERVED,
          completedAt: new Date(),
        });
      }
    }

    // Nếu trạng thái là 'cancelled', kiểm tra xem tất cả món đều đã bị hủy chưa?
    if (newStatus === OrderDetailStatus.CANCELLED) {
      const allItems = await this.orderDetailsRepo.getByOrderId(orderId);
      const allCancelled = allItems.every(
        (item) => item.status === OrderDetailStatus.CANCELLED
      );

      if (allCancelled && allItems.length > 0) {
        // Tự động update trạng thái đơn hàng cha thành 'Cancelled'
        await this.ordersRepo.update(orderId, {
          status: OrdersStatus.CANCELLED,
        });

        // Clear current_order_id của bàn (đánh dấu bàn trống)
        await this.tablesRepo.clearCurrentOrderByOrderId(orderId);
      }
    }

    return updatedItem;
  }

}


export default OrdersService;
