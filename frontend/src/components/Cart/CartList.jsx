import React from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";

const CartList = ({ cart, onAdd, onRemove }) => {
  return (
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
              src={item.imgUrl}
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
                onClick={() => onRemove(item.id)}
                className="bg-orange-100 text-gray-800 px-2.5 py-1.5 border-r-2 border-orange-400 hover:bg-orange-200 transition-all cursor-pointer"
              >
                <Minus size={12} />
              </div>
              <span className="bg-white text-orange-600 font-bold text-sm min-w-8 text-center">
                {item.qty}
              </span>
              <div
                onClick={() => onAdd(item)}
                className="bg-orange-500 text-white px-2.5 py-1.5 hover:bg-orange-600 transition-all cursor-pointer"
              >
                <Plus size={12} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CartList;
