// src/screens/MenuScreen.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerContext";
import { motion } from "framer-motion";
import { ShoppingCart, Utensils, LogOut } from "lucide-react";
import MenuItem from "../components/Menu/MenuItem";
import CartItem from "../components/Cart/CartItem";
import AlertModal from "../components/Modal/AlertModal";
import { useAlert } from "../hooks/useAlert";

const defaultCustomer = {
  name: "Khách hàng",
  loyaltyPoints: 0,
};

const MenuScreen = () => {
  const navigate = useNavigate();
  const { customer, tableInfo, logout, updateTable } = useCustomer();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();

  const [activeCategory, setActiveCategory] = useState("0");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryIdMap, setCategoryIdMap] = useState({});
  const [avatarUrl, setAvatarUrl] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Fetch categories and menu
  useEffect(() => {
    // Kiểm tra đã login và có thông tin bàn chưa
    if (!tableInfo || !tableInfo.id) {
      showWarning("Vui lòng đăng nhập trước!");
      setTimeout(() => navigate("/customer/login"), 2000);
      return;
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/categories`,
          {
            headers: { "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866" },
          }
        );

        const json = await res.json();

        if (json.success) {
          const mappedCategories = [
            {
              id: "0",
              name: "All",
              iconUrl: null,
              categoryId: null,
            },
          ];

          const idMap = {};

          json.data
            .filter((cat) => cat.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .forEach((cat) => {
              const catId = cat.name.toLowerCase().replace(/\s+/g, "-");
              mappedCategories.push({
                id: catId,
                name: cat.name,
                iconUrl: cat.urlIcon,
                categoryId: cat.id,
              });
              idMap[catId] = cat.id;
            });

          setCategories(mappedCategories);
          setCategoryIdMap(idMap);
        }
      } catch (err) {
        console.error("❌ Lỗi fetch categories:", err);
        setCategories([
          { id: "all", name: "Tất cả", iconUrl: null, categoryId: null },
        ]);
      }
    };

    const fetchUrlAvatar = async () => {
      try {
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/appsettings`;
        const url = new URL(baseUrl);

        const res = await fetch(url.toString(), {
          headers: { "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866" },
        });

        const json = await res.json();
        if (!json.success) throw new Error("Lấy app settings thất bại");

        // Lọc và map thành mảng URL
        const avatarSettings = json.data
          .filter((setting) => setting.category === "avatar")
          .map((setting) => setting.value);

        setAvatarUrl(avatarSettings);
      } catch (err) {
        console.error("❌ Lỗi fetch avatar:", err);
      }
    };

    // Fetch menu lần đầu tiên khi mount
    const fetchInitialMenus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/menus`,
          {
            headers: { "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866" },
          }
        );

        const json = await res.json();
        if (json.success) {
          const mapped = json.data.map((item, index) => ({
            id: item.id || index + 1,
            name: item.name,
            description: item.description || "Không có mô tả",
            price: item.price,
            category: "0", // Default category for initial load
            imgUrl: item.imgUrl,
            isAvailable: item.isAvailable,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("❌ Lỗi fetch initial menus:", err);
      }
    };

    fetchUrlAvatar();
    fetchCategories();
    fetchInitialMenus();
  }, []);

  // Fetch menus based on active category
  useEffect(() => {
    // Bỏ qua lần render đầu tiên (activeCategory = "all")
    if (activeCategory === "all") return;

    const fetchMenus = async () => {
      setIsLoadingMenu(true);
      try {
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/menus`;
        const url = new URL(baseUrl);

        // Chỉ thêm categoryId khi KHÔNG phải "0" (Tất cả)
        if (activeCategory !== "0") {
          const categoryId = categoryIdMap[activeCategory];
          if (categoryId) {
            url.searchParams.append("categoryId", categoryId);
          }
        }

        const res = await fetch(url.toString(), {
          headers: { "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866" },
        });

        const json = await res.json();

        if (!json.success) throw new Error("Lấy menu thất bại");

        // Tìm category name từ categoryId
        const getCategoryNameById = (catId) => {
          const found = categories.find((c) => c.categoryId === catId);
          return found ? found.id : activeCategory;
        };

        const mapped = json.data.map((item, index) => ({
          id: item.id || index + 1,
          name: item.name,
          description: item.description || "Không có mô tả",
          price: item.price,
          category: getCategoryNameById(item.categoryId),
          imgUrl: item.imgUrl,
          isAvailable: item.isAvailable,
        }));

        setProducts(mapped);
      } catch (err) {
        console.error("❌ Lỗi fetch menu:", err);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    // Gọi API khi chọn "0" (Tất cả) hoặc khi có categoryId hợp lệ
    if (activeCategory === "0" || categoryIdMap[activeCategory]) {
      fetchMenus();
    }
  }, [activeCategory, categoryIdMap, categories]);

  // Submit order (giữ nguyên)
  const submitOrder = async () => {
    try {
      const payload = {
        tableId: tableInfo.id,
        customerId: 1,
        dishes: cart.map((item) => ({
          dishId: item.id,
          quantity: item.qty,
          description: item.name,
          note: item.note?.trim() || null,
        })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866",
          },
          body: JSON.stringify(payload),
        }
      );

      const raw = await response.text();

      let result;
      try {
        result = JSON.parse(raw);
      } catch (e) {
        throw new Error("API trả về HTML thay vì JSON.");
      }

      if (!response.ok) {
        throw new Error(result.message || "Gửi đơn hàng thất bại");
      }

      showSuccess("Đặt món thành công!");
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error("❌ Lỗi đặt món:", err);
      showError("Đặt món thất bại: " + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/customer/login", { replace: true });
  };

  const randomAvatar = useMemo(() => {
    if (avatarUrl.length === 0) return "/images/avatar/default_avt.svg";
    const index = Math.floor(Math.random() * avatarUrl.length);
    return avatarUrl[index];
  }, [avatarUrl]);

  // hiển thị customer từ context hoặc default
  const displayCustomer = customer || defaultCustomer;

  // Cart actions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, note: "" }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const setQuantity = (product, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== product.id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === product.id ? { ...i, qty: newQty } : i))
      );
    }
  };

  const updateItemNote = (itemId, note) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, note } : item))
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.qty : 0;
  };
  return (
    <motion.div
      className="flex h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 font-sans overflow-hidden relative select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <motion.div
        className="w-30 bg-white border-r flex flex-col items-center py-6 space-y-4 shadow-sm z-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.img
          layoutId="app-logo"
          src="/images/logo.png"
          alt="Logo"
          className="w-20 h-20 object-contain mb-4"
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        {categories.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl transition-all duration-300 ${
              activeCategory === cat.id
                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-105"
                  : "text-gray-400"

            }`}
          >
            <div className="mb-1">
              {cat.iconUrl ? (
                <img
                  src={cat.iconUrl}
                  alt={cat.name}
                  className="w-8 h-8 object-contain"
                  style={{
                    filter:
                      activeCategory === cat.id
                        ? "brightness(0) invert(1)"
                        : "brightness(0) saturate(100%) invert(75%) sepia(0%) saturate(0%) hue-rotate(180deg)",
                  }}
                />
              ) : (
                <Utensils size={20} />
              )}
            </div>
            <span className="text-[12px] font-bold">{cat.name}</span>
          </motion.button>
        ))}
      </motion.div>

      <div className="flex-1 overflow-y-auto flex flex-col h-screen">
        <motion.header
          className="px-6 py-4 shrink-0"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 inline-flex px-5 py-3 rounded-full shadow-md text-md font-bold text-white">
                Bàn số: {tableInfo?.number || "..."}
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-full pl-3 pr-2 py-2 border border-gray-200">
              <div className="relative">
                <img
                  src={randomAvatar}
                  alt="Avatar khách hàng"
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 shadow-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {displayCustomer.name}
                </p>
                <p className="text-xs text-amber-600 font-bold">
                  Loyalty: {displayCustomer.loyaltyPoints} điểm
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {isLoadingMenu ? (
            <div className="col-span-full flex flex-col items-center justify-center h-[60vh]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-gray-500 font-medium">
                Đang tải món ăn...
              </p>
            </div>
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.03 }}
              >
                <MenuItem
                  product={product}
                  quantity={getItemQuantity(product.id)}
                  onAdd={() => addToCart(product)}
                  onRemove={() => removeFromCart(product.id)}
                  onQuantityChange={setQuantity}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {!isCartOpen && totalItems > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-linear-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl shadow-orange-400/50 hover:shadow-orange-500/60 hover:scale-105 transition-all duration-300 z-40 flex items-center gap-3 px-6 py-4"
        >
          <div className="relative">
            <ShoppingCart size={28} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-90">Tổng cộng</span>
            <span className="font-bold text-lg">
              {totalAmount.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </motion.button>
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-full lg:w-120 bg-white shadow-2xl flex flex-col border-l z-40 transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-amber-500" /> Đơn hàng
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <ShoppingCart size={32} />
              </div>
              <p>Chưa có món nào</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
                onQuantityChange={setQuantity}
                onNoteChange={updateItemNote}
              />
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Tổng cộng</span>
            <span className="text-2xl font-bold text-gray-800">
              {totalAmount.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <button
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
              cart.length > 0
                ? "bg-linear-to-r from-orange-500 via-orange-600 to-red-500 text-white hover:from-orange-600 hover:via-orange-700 hover:to-red-600 hover:shadow-xl hover:shadow-orange-400/50 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={cart.length === 0}
            onClick={submitOrder}
          >
            Đặt món ngay
          </button>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </motion.div>
  );
};

export default MenuScreen;
