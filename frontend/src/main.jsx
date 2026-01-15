import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { RestaurantProvider } from "./context/RestaurantContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <RestaurantProvider>
          <App />
        </RestaurantProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
