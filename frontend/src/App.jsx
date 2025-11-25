// src/App.jsx
import React, { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import MenuScreen from "./screens/MenuScreen";
import KitchenScreen from "./screens/KitchenScreen";
import TestScreen from "./screens/TestScreen";

function App() {
  const [currentScreen, setCurrentScreen] = useState("test"); // null, 'test', 'dashboard', 'menu', 'kitchen'
  
  const renderScreen = () => {
    // Hiển thị TestScreen
    if (currentScreen === "test") {
      return <TestScreen onSelectScreen={setCurrentScreen} />;
    }

    // Nếu chưa chọn màn hình, hiển thị HomeScreen
    if (!currentScreen) {
      return <HomeScreen onSelectScreen={setCurrentScreen} />;
    }

    // Hiển thị DashboardLayout (bao gồm sidebar và nội dung có thể thay đổi)
    if (currentScreen === "dashboard") {
      return <DashboardLayout />;
    }
  
    // Hiển thị MenuScreen
    if (currentScreen === "menu") {
      return <MenuScreen />;
    }
  
    // Hiển thị KitchenScreen
    if (currentScreen === "kitchen") {
      return <KitchenScreen />;
    }
    return null;
  }

  return <div className="h-screen w-screen">{renderScreen()}</div>;
}

export default App;
