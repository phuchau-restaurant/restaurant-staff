// src/App.jsx
import React, { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import Register from "./screens/RegisterScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import MenuScreen from "./screens/MenuScreen";
import KitchenScreen from "./screens/KitchenScreen";
import WaiterScreen from "./screens/WaiterScreen";
import TestScreen from "./screens/TestScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

function App() {
  const [currentScreen, setCurrentScreen] = useState("test"); // null, 'test', 'dashboard', 'menu', 'kitchen', 'onboarding'
  
  const renderScreen = () => {
    // Hiển thị OnboardingScreen
    if (currentScreen === "onboarding") {
      return <OnboardingScreen onComplete={() => setCurrentScreen("dashboard")} />;
    }

    // Hiển thị TestScreen
    if (currentScreen === "test") {
      return <TestScreen onSelectScreen={setCurrentScreen} />;
    }

    // Hiển thị Login (HomeScreen)
    if (currentScreen === "login") {
      return <HomeScreen onSelectScreen={setCurrentScreen} />
    }

    // Hiển thị Register
    if (currentScreen === "register") {
      return <Register onSelectScreen={setCurrentScreen} />
    }

    // Hiển thị Verify Email
    if (currentScreen === "verify-email") {
      return <VerifyEmailScreen onSelectScreen={setCurrentScreen} />
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

    // Hiển thị WaiterScreen
    if (currentScreen === "waiter") {
      return <WaiterScreen />;
    }
    return null;
  }

  return <div className="h-screen w-screen">{renderScreen()}</div>;
}

export default App;
