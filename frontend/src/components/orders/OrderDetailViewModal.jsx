import { useRef, useState, useEffect } from "react";
import { X, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, formatDate } from "../../utils/orderUtils";

/**
 * OrderDetailViewModal Component
 * Modal hiển thị chi tiết đơn hàng ở chế độ read-only (chỉ xem, không chỉnh sửa)
 */
const OrderDetailViewModal = ({ order, tables, onClose }) => {
  // Drag & resize state
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState({
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  });
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });

  // Lấy thông tin bàn
  const table = tables.find((t) => t.id === order.tableId);
  const tableName = table
    ? `${table.tableNumber}`
    : `Bàn #${order.tableId}`;

  // Tính tổng tiền cho từng món (không bao gồm modifier vì không có price)
  const calculateDishTotal = (item) => {
    const basePrice = item.unitPrice * item.quantity;
    return basePrice;
  };

  // Tính tổng tiền đơn hàng
  const getTotalAmount = () => {
    return (order.items || []).reduce(
      (total, item) => total + calculateDishTotal(item),
      0
    );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="cursor-move bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between"
            onMouseDown={onDragStart}
            style={{ userSelect: "none" }}
          >
            <h2 className="text-2xl font-bold">Chi Tiết Đơn Hàng #{order.id}</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 font-medium">Bàn</p>
                <p className="text-lg font-bold text-gray-800">{tableName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Trạng thái</p>
                <p className="text-lg font-bold text-gray-800">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Thời gian tạo</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Số lượng món</p>
                <p className="text-lg font-bold text-gray-800">
                  {order.items?.length || 0} món
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Danh sách món ăn
              </h3>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-gray-500" />
                            <p className="font-semibold text-gray-800 text-lg">
                              {item.dishName || `Món #${item.dishId}`}
                            </p>
                          </div>

                          {/* Modifiers */}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="mt-2 ml-6">
                              <p className="text-xs text-gray-600 font-medium mb-1">
                                Tùy chọn:
                              </p>
                              <div className="space-y-1">
                                {item.modifiers.map((mod, modIndex) => (
                                  <div
                                    key={modIndex}
                                    className="flex items-center text-sm"
                                  >
                                    <span className="text-gray-700">
                                      • {mod.optionName || `Option #${mod.optionId}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Note */}
                          {item.note && (
                            <p className="text-sm text-gray-600 mt-2 ml-6 italic">
                              📝 Ghi chú: {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Đơn giá: {formatPrice(item.unitPrice)}
                          </span>
                          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            Số lượng: x{item.quantity}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">
                          {formatPrice(calculateDishTotal(item))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Không có món ăn nào</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t-2 border-gray-300">
              <div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg">
                <span className="text-xl font-bold text-gray-800">
                  Tổng cộng:
                </span>
                <span className="text-3xl font-bold text-orange-600">
                  {formatPrice(getTotalAmount())}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={onResizeStart}
            className="absolute right-3 bottom-3 w-4 h-4 cursor-se-resize rounded bg-gray-300 hover:bg-gray-400"
            title="Kéo để thay đổi kích thước"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailViewModal;
