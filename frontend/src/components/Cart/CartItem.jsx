import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const CartItem = ({ item, onAdd, onRemove, onQuantityChange, onNoteChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    const newQty = parseInt(inputValue) || 0;
    if (newQty > 0 && newQty !== item.qty) {
      onQuantityChange?.(item, newQty);
    }
    setIsEditing(false);
    setInputValue("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  const handleQuantityClick = () => {
    setIsEditing(true);
    setInputValue(item.qty.toString());
  };

  return (
    <div className="bg-amber-50 p-3 rounded-xl border-2 border-amber-200 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <img
          src={item.imgUrl}
          alt={item.name}
          className="w-15 h-15 rounded-md object-cover"
        />
        <div className="flex flex-col flex-1 min-w-0 gap-0.5">
          <h4 className="text-sm font-semibold text-gray-800 truncate">
            {item.name}
          </h4>
          <p className="text-xs text-gray-500">
            {item.price.toLocaleString("vi-VN")}₫
          </p>
            <input
            type="text"
            value={item.note || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 50) {
                onNoteChange?.(item.id, value);
              }
            }}
            placeholder="Ghi chú (vd: không hành, ít đá...)"
            maxLength={50}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none bg-white"
            />
        </div>
        <div className="flex items-center border-2 border-orange-500 rounded-full overflow-hidden shadow-lg h-[32px]">
          <div
            onClick={onRemove}
            className="bg-orange-100 text-gray-800 px-2.5 h-full flex items-center border-r-2 border-orange-400 hover:bg-orange-200 active:bg-orange-300 transition-colors cursor-pointer"
          >
            <Minus size={12} />
          </div>
          {isEditing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              autoFocus
              className="bg-white text-orange-600 font-bold text-sm w-8 text-center outline-none h-full"
            />
          ) : (
            <span
              onClick={handleQuantityClick}
              className="bg-white text-orange-600 font-bold text-sm min-w-8 text-center cursor-pointer transition-colors h-full flex items-center justify-center"
            >
              {item.qty}
            </span>
          )}
          <div
            onClick={onAdd}
            className="bg-orange-500 text-white px-2.5 h-full flex items-center hover:bg-orange-600 active:bg-orange-700 transition-colors cursor-pointer"
          >
            <Plus size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
