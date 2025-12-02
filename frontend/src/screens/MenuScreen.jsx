// src/screens/MenuScreen.jsx
import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Utensils,
  Coffee,
  Cookie,
  LogOut,
} from "lucide-react";
import MenuItem from "../components/Menu/MenuItem";

const CATEGORIES = [
  { id: "all", name: "Tất cả", icon: <Utensils size={20} /> },
  { id: "burger", name: "Burger", icon: <Utensils size={20} /> },
  { id: "drink", name: "Đồ uống", icon: <Coffee size={20} /> },
  { id: "dessert", name: "Tráng miệng", icon: <Cookie size={20} /> },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Bò Phô Mai Đặc Biệt",
    description: "Burger bò phô mai kẹp thịt bò nướng và rau tươi",
    price: 69000,
    category: "burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
  },
  {
    id: 2,
    name: "Gà Giòn Cay",
    description: "Ức gà chiên cay, khoai tây và sốt đặc biệt",
    price: 55000,
    category: "burger",
    image:
      "https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=500&q=80",
  },
  {
    id: 3,
    name: "Trà Đào Cam Sả",
    description: "Trà đào thanh mát pha cam và sả tươi",
    price: 45000,
    category: "drink",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80",
  },
  {
    id: 4,
    name: "Cà Phê Sữa Đá",
    description: "Cà phê rang xay pha cùng sữa đặc béo mịn",
    price: 35000,
    category: "drink",
    image:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80",
  },
  {
    id: 5,
    name: "Bánh Kem Dâu",
    description: "Cốt bánh mềm, kem ngậy và dâu tươi",
    price: 40000,
    category: "dessert",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80",
  },
  {
    id: 6,
    name: "Khoai Tây Chiên",
    description: "Khoai tây chiên vàng giòn, chấm sốt đậm đà",
    price: 25000,
    category: "dessert",
    image:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80",
  },
];

const CUSTOMER = {
  name: "Nguyễn Thảo Vy",
  loyaltyPoints: 1280,
};

const AVATARS = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
];




const MenuScreen = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const submitOrder = async () => {
    try {
      const payload = {
        tableId: 7,
        customerId: 1,
        dishes: cart.map(item => ({
          dishId: item.id,
          quantity: item.qty,
          description: item.name
        }))
      };

      console.log("📦 Gửi payload:", payload);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id":"019abac9-846f-75d0-8dfd-bcf9c9457866" },
        body: JSON.stringify(payload),
      });

      // Đọc response dạng text trước
      const raw = await response.text();
      console.log("📥 Raw API response:", raw);

      // Nếu không phải JSON → báo lỗi server
      let result;
      try {
        result = JSON.parse(raw);
      } catch (e) {
        throw new Error("API trả về HTML thay vì JSON. Có thể sai URL hoặc server lỗi.");
      }

      if (!response.ok) {
        throw new Error(result.message || "Gửi đơn hàng thất bại");
      }

      alert("🎉 Đặt món thành công!");
      setCart([]);
      setIsCartOpen(false);

    } catch (err) {
      console.error("❌ Lỗi đặt món:", err);
      alert("Đặt món thất bại: " + err.message);
    }
  };




  const randomAvatar = useMemo(() => {
    const index = Math.floor(Math.random() * AVATARS.length);
    return AVATARS[index];
  }, []);

  const filteredProducts = useMemo(() => {
    return activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            return { ...item, qty: item.qty - 1 };
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  const setQuantity = (product, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== product.id));
    } else {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, qty: newQty } : item
          );
        }
        return [...prev, { ...product, qty: newQty }];
      });
    }
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
    <div className="flex h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 font-sans overflow-hidden relative select-none">
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <div className="w-24 bg-white border-r flex flex-col items-center py-6 space-y-4 shadow-sm z-10">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-16 h-16 object-contain mb-4"
        />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${
              activeCategory === cat.id
                ? "bg-linear-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-105 hover:shadow-xl hover:shadow-orange-400/60"
                : "text-gray-400 hover:bg-linear-to-br hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 hover:scale-105"
            }`}
          >
            <div className="mb-1">{cat.icon}</div>
            <span className="text-[10px] font-bold">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col h-screen">
        <header className="px-6 py-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="bg-amber inline-flex px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-amber-700 border border-amber-100">
                Bàn số: 05
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
                  {CUSTOMER.name}
                </p>
                <p className="text-xs text-amber-600 font-bold">
                  Loyalty: {CUSTOMER.loyaltyPoints} điểm
                </p>
              </div>
              <button
                onClick={() => alert("Đăng xuất")}
                className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr pb-6">
          {filteredProducts.map((product) => (
            <MenuItem
              key={product.id}
              product={product}
              quantity={getItemQuantity(product.id)}
              onAdd={() => addToCart(product)}
              onRemove={() => removeFromCart(product.id)}
              onQuantityChange={setQuantity}
            />
          ))}
        </div>
      </div>

      {!isCartOpen && totalItems > 0 && (
        <button
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
        </button>
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl flex flex-col border-l z-40 transition-transform duration-300 ${
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
              <div
                key={item.id}
                className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border-2 border-amber-200 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {item.price.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <div className="flex items-center border-2 border-orange-500 rounded-full overflow-hidden shadow-lg">
                  <div
                    onClick={() => removeFromCart(item.id)}
                    className="bg-orange-100 text-gray-800 px-2.5 py-1.5 border-r-2 border-orange-400 hover:bg-orange-200 transition-all cursor-pointer"
                  >
                    <Minus size={12} />
                  </div>
                  <span className="bg-white text-orange-600 font-bold text-sm min-w-8 text-center">
                    {item.qty}
                  </span>
                  <div
                    onClick={() => addToCart(item)}
                    className="bg-orange-500 text-white px-2.5 py-1.5 hover:bg-orange-600 transition-all cursor-pointer"
                  >
                    <Plus size={12} />
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default MenuScreen;
