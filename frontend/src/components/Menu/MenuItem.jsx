import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const MenuItem = ({ product, quantity, onAdd, onRemove, onQuantityChange }) => {
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
    if (newQty > 0 && newQty !== quantity) {
      onQuantityChange?.(product, newQty);
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
    setInputValue(quantity.toString());
  };


  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 border border-transparent flex flex-col h-full">
      <div className="w-full h-60 rounded-[2px] overflow-hidden mb-2">
        <img
          src={product.imgUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 min-w-0 mb-3">
          <h3 className="font-bold text-gray-800 text-2xl mb-1 font-oswald">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-500 text-md line-clamp-2 font-assistant">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-amber-600 text-[30px] font-smooch-sans font-bold">
            {product.price.toLocaleString("vi-VN")}đ
          </p>
          {quantity > 0 ? (
            <div className="flex items-center border-2 border-orange-500 rounded-full overflow-hidden shadow-lg shrink-0 h-[42px]">
              <div
                onClick={onRemove}
                className="bg-orange-100 text-gray-800 px-2 h-full flex items-center border-r-2 border-orange-600 hover:bg-orange-200 active:bg-orange-300 transition-colors cursor-pointer"
              >
                <Minus size={16} />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                  className="bg-white text-orange-600 font-bold text-base w-10 text-center outline-none h-full"
                />
              ) : (
                <span
                  onClick={handleQuantityClick}
                  className="bg-white text-orange-600 font-bold text-base min-w-10 text-center cursor-pointer transition-colors h-full flex items-center justify-center"
                >
                  {quantity}
                </span>
              )}
              <div
                onClick={onAdd}
                className="bg-orange-500 text-white px-2 h-full flex items-center border-l-2 border-orange-600 hover:bg-orange-600 active:bg-orange-700 transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </div>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="bg-linear-to-br from-orange-400 to-orange-600 p-2 rounded-full shadow-md shadow-orange-300/40 text-white hover:shadow-lg hover:shadow-orange-400/60 active:scale-95 transition-all duration-300 shrink-0 w-[42px] h-[42px] flex items-center justify-center"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
