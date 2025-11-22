import React, { useState, useMemo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Utensils, Coffee, Cookie, ChefHat } from 'lucide-react';
import KitchenScreen from './screens/KitchenScreen';

// Home Screen - Chọn màn hình
const HomeScreen = ({ onSelectScreen }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-4">
          Hệ Thống Nhà Hàng
        </h1>
        <p className="text-center text-gray-600 mb-12 text-xl">
          Chọn màn hình bạn muốn sử dụng
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Màn hình chọn món */}
          <button
            onClick={() => onSelectScreen('menu')}
            className="group relative bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-12 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-4 border-orange-300 hover:border-orange-500"
          >
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Utensils size={64} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Màn Hình Chọn Món
              </h2>
              <p className="text-gray-600 text-center">
                Dành cho nhân viên phục vụ<br/>
                Gọi món và quản lý đơn hàng
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              Phục vụ
            </div>
          </button>

          {/* Màn hình bếp */}
          <button
            onClick={() => onSelectScreen('kitchen')}
            className="group relative bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-12 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-4 border-red-300 hover:border-red-500"
          >
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <ChefHat size={64} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Màn Hình Bếp
              </h2>
              <p className="text-gray-600 text-center">
                Dành cho đầu bếp<br/>
                Xem và xử lý đơn hàng
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              Bếp
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Dữ liệu giả lập (Mock Data) ---
const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: <Utensils size={20} /> },
  { id: 'burger', name: 'Burger', icon: <Utensils size={20} /> },
  { id: 'drink', name: 'Đồ uống', icon: <Coffee size={20} /> },
  { id: 'dessert', name: 'Tráng miệng', icon: <Cookie size={20} /> },
];

const PRODUCTS = [
  { id: 1, name: 'Bò Phô Mai Đặc Biệt', price: 69000, category: 'burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
  { id: 2, name: 'Gà Giòn Cay', price: 55000, category: 'burger', image: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=500&q=80' },
  { id: 3, name: 'Trà Đào Cam Sả', price: 45000, category: 'drink', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80' },
  { id: 4, name: 'Cà Phê Sữa Đá', price: 35000, category: 'drink', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80' },
  { id: 5, name: 'Bánh Kem Dâu', price: 40000, category: 'dessert', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80' },
  { id: 6, name: 'Khoai Tây Chiên', price: 25000, category: 'dessert', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80' },
];

function App() {
  const [currentScreen, setCurrentScreen] = useState(null); // null, 'menu', 'kitchen'

  // Nút quay lại
  const BackButton = () => (
    <button
      onClick={() => setCurrentScreen(null)}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 font-bold text-gray-700 hover:text-orange-600 border-2 border-gray-200 hover:border-orange-500 hover:scale-105"
    >
      ← Quay lại
    </button>
  );

  // Hiển thị màn hình chính
  if (!currentScreen) {
    return <HomeScreen onSelectScreen={setCurrentScreen} />;
  }

  // Hiển thị màn hình được chọn
  return (
    <>
      <BackButton />
      {currentScreen === 'menu' ? <MenuScreen /> : <KitchenScreen />}
    </>
  );
}

const MenuScreen = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Lọc sản phẩm theo danh mục
  const filteredProducts = useMemo(() => {
    return activeCategory === 'all' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  // Thêm vào giỏ hàng
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Giảm số lượng / Xóa món
  const removeFromCart = (productId) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  // Tính tổng tiền
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Tính tổng số lượng món
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Lấy số lượng món trong giỏ
  const getItemQuantity = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.qty : 0;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 font-sans overflow-hidden relative">
      
      {/* --- Overlay mờ khi giỏ hàng mở --- */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      
      {/* --- Cột 1: Danh mục (Sidebar) --- */}
      <div className="w-24 bg-white border-r flex flex-col items-center py-6 space-y-4 shadow-sm z-10">
        {/* Logo */}
        <img 
          src="/images/logo.png" 
          alt="Your Logo" 
          className="w-16 h-16 object-contain mb-4" // Điều chỉnh kích thước logo tại đây
        />
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${
              activeCategory === cat.id 
              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-105 hover:shadow-xl hover:shadow-orange-400/60'
              : 'text-gray-400 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 hover:scale-105'
            }`}
          >
            <div className="mb-1">{cat.icon}</div>
            <span className="text-[10px] font-bold">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* --- Cột 2: Khu vực chọn món (Main Grid) --- */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-screen">
        <header className="mb-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Thực Đơn</h1>
            <p className="text-gray-500">Thứ 5, 20/11/2025</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-amber-600 border border-amber-100">
            Bàn số: 05
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr pb-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-transparent hover:border-amber-200 group flex flex-col"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-3">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{product.name}</h3>
                  <p className="text-amber-600 font-bold mt-1">
                    {product.price.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                {getItemQuantity(product.id) > 0 ? (
                  <div className="flex items-center border-2 border-orange-500 rounded-full overflow-hidden shadow-lg shrink-0">
                    <div 
                      onClick={() => removeFromCart(product.id)}
                      className="bg-orange-100 text-gray-800 px-3 py-2.5 border-r-2 border-orange-600 hover:bg-orange-200 transition-all cursor-pointer"
                    >
                      <Minus size={16} />
                    </div>
                      <span className="bg-white text-orange-600 font-bold text-base min-w-10 text-center">
                        {getItemQuantity(product.id)}
                      </span>
                    <div 
                      onClick={() => addToCart(product)}
                      className="bg-orange-500  text-white px-3 py-2.5 border-l-2 border-orange-600 hover:bg-orange-600 transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-full shadow-md shadow-orange-300/40 text-white hover:shadow-lg hover:shadow-orange-400/60 hover:scale-110 transition-all duration-300 shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Nút giỏ hàng nổi (Floating Cart Button) --- */}
      {!isCartOpen && totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl shadow-orange-400/50 hover:shadow-orange-500/60 hover:scale-105 transition-all duration-300 z-40 flex items-center gap-3 px-6 py-4"
        >
          <div className="relative">
            <ShoppingCart size={28} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-90">Tổng cộng</span>
            <span className="font-bold text-lg">{totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
        </button>
      )}

      {/* --- Cột 3: Giỏ hàng (Order Summary) - Slide từ phải --- */}
      <div className={`fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl flex flex-col border-l z-40 transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-amber-500" /> Đơn Hàng
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
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
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border-2 border-amber-200 shadow-sm">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.price.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="flex items-center border-2 border-orange-500 rounded-full overflow-hidden shadow-lg">
                  <div 
                    onClick={() => removeFromCart(item.id)}
                    className="bg-orange-100 text-gray-800 px-2.5 py-1.5 border-r-2 border-orange-400 hover:bg-orange-200 transition-all cursor-pointer"
                  >
                    <Minus size={12} />
                  </div>
                  <span className="bg-white text-orange-600 font-bold text-sm min-w-8 text-center">{item.qty}</span>
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
            <span className="text-2xl font-bold text-gray-800">{totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <button 
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
              cart.length > 0 
              ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white hover:from-orange-600 hover:via-orange-700 hover:to-red-600 hover:shadow-xl hover:shadow-orange-400/50 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={cart.length === 0}
            onClick={() => alert(`Đã gửi đơn hàng: ${totalAmount.toLocaleString('vi-VN')}đ`)}
          >
            Thanh Toán Ngay
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;