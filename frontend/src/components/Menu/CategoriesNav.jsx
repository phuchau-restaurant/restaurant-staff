import React from "react";

const CategoriesNav = ({ categories, activeCategory, onChange }) => {
  return (
    <>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
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
    </>
  );
};

export default CategoriesNav;
