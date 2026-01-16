import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Minus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, validateOrderData } from "../../utils/orderUtils";
import * as menuItemModifierGroupService from "../../services/menuItemModifierGroupService";

/**
 * OrderForm Component
 * Form thêm/sửa đơn hàng với hỗ trợ modifier
 */
const OrderForm = ({
  order,
  tables,
  menuItems,
  modifierGroups,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    tableId: "",
    dishes: [],
  });

  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [dishModifierGroupIds, setDishModifierGroupIds] = useState([]); // IDs của modifier groups cho món được chọn
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form với dữ liệu order nếu đang edit
  useEffect(() => {
    if (order) {
      setFormData({
        tableId: order.tableId || "",
        dishes:
          order.items?.map((item) => ({
            dishId: item.dishId,
            dishName: item.dishName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            note: item.note || "",
            modifiers: item.modifiers || [],
          })) || [],
      });
    }
  }, [order]);

  // Drag & resize state (like StaffForm)
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState({
    x: window.innerWidth / 2 - 500,
    y: window.innerHeight / 2 - 350,
  });
  const [modalSize, setModalSize] = useState({ width: 1000, height: 700 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 1000,
    height: 700,
  });

  // Handle chọn món ăn
  const handleSelectDish = async (dish) => {
    setSelectedDish(dish);
    setSelectedModifiers([]);
    setQuantity(1);
    setNote("");
    
    // Fetch modifier groups cho món này
    try {
      const modifierLinks = await menuItemModifierGroupService.fetchModifierGroupsByDishId(dish.id);
      // modifierLinks là array of { dishId, groupId }
      const groupIds = modifierLinks.map(link => link.groupId);
      setDishModifierGroupIds(groupIds);
    } catch (error) {
      console.error("Error fetching modifier groups for dish:", error);
      setDishModifierGroupIds([]);
    }
  };

  // Drag handlers
  const onDragStart = (e) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX - modalPos.x, y: e.clientY - modalPos.y });
  };
  const onDrag = (e) => {
    if (!isDragging) return;
    setModalPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };
  const onDragEnd = () => setIsDragging(false);

  // Resize handlers
  const onResizeStart = (e) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height,
    });
    e.stopPropagation();
  };
  const onResize = (e) => {
    if (!isResizing) return;
    setModalSize({
      width: Math.max(600, resizeStart.width + (e.clientX - resizeStart.x)),
      height: Math.max(400, resizeStart.height + (e.clientY - resizeStart.y)),
    });
  };
  const onResizeEnd = () => setIsResizing(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", onDragEnd);
    } else {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
    };
  }, [isDragging]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", onResize);
      window.addEventListener("mouseup", onResizeEnd);
    } else {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", onResizeEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", onResizeEnd);
    };
  }, [isResizing]);

  // Handle chọn/bỏ chọn modifier
  const handleToggleModifier = (optionId, groupId, optionName, price) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.optionId === optionId);
      if (exists) {
        return prev.filter((m) => m.optionId !== optionId);
      } else {
        return [...prev, { optionId, groupId, optionName, price }];
      }
    });
  };

  // Kiểm tra modifier đã được chọn chưa
  const isModifierSelected = (optionId) => {
    return selectedModifiers.some((m) => m.optionId === optionId);
  };

  // Thêm món vào giỏ
  const handleAddDishToOrder = () => {
    if (!selectedDish) return;

    const newDish = {
      dishId: selectedDish.id,
      dishName: selectedDish.name,
      unitPrice: selectedDish.price,
      quantity,
      note,
      modifiers: selectedModifiers,
    };

    setFormData((prev) => ({
      ...prev,
      dishes: [...prev.dishes, newDish],
    }));

    // Reset selection
    setSelectedDish(null);
    setSelectedModifiers([]);
    setQuantity(1);
    setNote("");
  };

  // Xóa món khỏi giỏ
  const handleRemoveDish = (index) => {
    setFormData((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((_, i) => i !== index),
    }));
  };

  // Cập nhật số lượng món trong giỏ
  const handleUpdateDishQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    setFormData((prev) => ({
      ...prev,
      dishes: prev.dishes.map((dish, i) =>
        i === index ? { ...dish, quantity: newQuantity } : dish
      ),
    }));
  };

  // Tính tổng tiền món với modifier
  const calculateDishPrice = (dish) => {
    const basePrice = dish.unitPrice * dish.quantity;
    const modifierPrice = (dish.modifiers || []).reduce(
      (sum, mod) => sum + (mod.price || 0) * dish.quantity,
      0
    );
    return basePrice + modifierPrice;
  };

  // Tính tổng tiền đơn hàng
  const getTotalAmount = () => {
    return formData.dishes.reduce(
      (total, dish) => total + calculateDishPrice(dish),
      0
    );
  };

  // Lấy danh sách modifier groups của món được chọn
  const getDishModifierGroups = () => {
    if (!selectedDish) return [];

    // Lọc modifierGroups dựa trên dishModifierGroupIds đã fetch từ API
    return modifierGroups.filter((group) => 
      dishModifierGroupIds.includes(group.id) && group.isActive !== false
    );
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Prepare data for API
    const orderData = {
      tableId: parseInt(formData.tableId),
      dishes: formData.dishes.map((dish) => ({
        dishId: dish.dishId,
        quantity: dish.quantity,
        description: dish.note || "",
        // Send full modifier objects with optionId and optionName
        modifiers: dish.modifiers.map((m) => ({
          optionId: m.optionId,
          optionName: m.optionName,
        })),
      })),
    };

    // Validate
    const validation = validateOrderData(orderData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(order?.id, orderData);
      onClose();
    } catch (error) {
      setErrors([error.message || "Có lỗi xảy ra khi lưu đơn hàng"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
          style={{
            position: "absolute",
            left: modalPos.x,
            top: modalPos.y,
            width: modalSize.width,
            height: modalSize.height,
            minWidth: 600,
            minHeight: 400,
            maxWidth: "100vw",
            maxHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="shrink-0 cursor-move bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between"
            onMouseDown={onDragStart}
            style={{ userSelect: "none" }}
          >
            <h2 className="text-2xl font-bold">
              {order ? "Chỉnh Sửa Đơn Hàng" : "Thêm Đơn Hàng Mới"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="h-full">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      • {error}
                    </p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Order Info & Dish Selection */}
                <div className="space-y-4">
                  {/* Table Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn bàn <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tableId}
                      onChange={(e) =>
                        setFormData({ ...formData, tableId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">-- Chọn bàn --</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Bàn {table.tableNumber} - {table.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dish Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn món ăn <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                      {menuItems
                        .filter((item) => item.isAvailable)
                        .map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectDish(item)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                              selectedDish?.id === item.id
                                ? "bg-blue-50 border-l-4 border-l-blue-600"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.categoryName}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-orange-600">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Modifier Selection - Show when dish is selected */}
                  {selectedDish && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Tùy chọn cho: {selectedDish.name}
                      </h3>

                      {/* Modifiers */}
                      {getDishModifierGroups().length > 0 ? (
                        <div className="space-y-3">
                          {getDishModifierGroups().map((group) => (
                            <div key={group.id}>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {group.name}
                              </p>
                              <div className="space-y-1">
                                {group.modifiers?.map((option) => (
                                  <label
                                    key={option.id}
                                    className="flex items-center justify-between p-2 bg-white rounded hover:bg-gray-50 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isModifierSelected(option.id)}
                                        onChange={() =>
                                          handleToggleModifier(
                                            option.id,
                                            group.id,
                                            option.name,
                                            option.additionalPrice || option.price || 0
                                          )
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">
                                        {option.name}
                                      </span>
                                    </div>
                                    {(option.additionalPrice || option.price) > 0 && (
                                      <span className="text-xs text-orange-600">
                                        +{formatPrice(option.additionalPrice || option.price)}
                                      </span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Món này không có tùy chọn
                        </p>
                      )}

                      {/* Quantity & Note */}
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                              }
                              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) =>
                                setQuantity(
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setQuantity(quantity + 1)}
                              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú (tùy chọn)
                          </label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ví dụ: Không hành, ít cay..."
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddDishToOrder}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          Thêm vào giỏ
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Order Cart */}
                <div className="bg-gray-50 rounded-lg p-4 h-fit sticky top-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Giỏ hàng ({formData.dishes.length})
                    </h3>
                  </div>

                  {formData.dishes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Chưa có món nào trong giỏ</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {formData.dishes.map((dish, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {dish.dishName}
                              </p>
                              {dish.modifiers?.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Tùy chọn:{" "}
                                  {dish.modifiers
                                    .map((m) => m.optionName)
                                    .join(", ")}
                                </p>
                              )}
                              {dish.note && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  Ghi chú: {dish.note}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDish(index)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateDishQuantity(
                                    index,
                                    dish.quantity - 1
                                  )
                                }
                                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">
                                {dish.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateDishQuantity(
                                    index,
                                    dish.quantity + 1
                                  )
                                }
                                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-orange-600">
                              {formatPrice(calculateDishPrice(dish))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t-2 border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        Tổng cộng:
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(getTotalAmount())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="shrink-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || formData.dishes.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang lưu..." : order ? "Cập Nhật" : "Tạo Đơn"}
            </button>
          </div>
          <div
            onMouseDown={onResizeStart}
            className="absolute right-3 bottom-3 w-4 h-4 cursor-se-resize rounded bg-gray-200"
            title="Kéo để thay đổi kích thước"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderForm;
