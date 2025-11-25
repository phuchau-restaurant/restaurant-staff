import React from 'react';

const TestScreen = ({ onSelectScreen }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Test Screen</h1>
        <p className="text-gray-600 mb-8 text-center">Chọn màn hình để chuyển đến</p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelectScreen(null)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            Login Screen
          </button>
          <button
            onClick={() => onSelectScreen("dashboard")}
            className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
          >
            Dashboard Screen
          </button>
          <button
            onClick={() => onSelectScreen("menu")}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm"
          >
            Menu Screen
          </button>
          <button
            onClick={() => onSelectScreen("kitchen")}
            className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors shadow-sm"
          >
            Kitchen Screen
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
