// src/App.jsx
import React, { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import KitchenScreen from "./screens/KitchenScreen";

function App() {
  const [currentScreen, setCurrentScreen] = useState(null); // null, 'menu', 'kitchen'

  // Nếu chưa chọn màn hình, hiển thị HomeScreen
  if (!currentScreen) {
    return <HomeScreen onSelectScreen={setCurrentScreen} />;
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

export default App;
