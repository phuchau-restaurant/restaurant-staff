// frontend/src/context/RestaurantContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getRestaurantInfo } from "../services/restaurantService";

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
    const [restaurantInfo, setRestaurantInfo] = useState({
        name: "RoRi",  // Default fallback
        logoUrl: "/images/logo.png",  // Default fallback
        address: "",
        email: "",
        phone: "",
        // Payment settings
        taxRate: 10.0,
        serviceCharge: 0.0,
        discountRules: [],
        qrPayment: null,
    });
    const [loading, setLoading] = useState(true);

    // Fetch restaurant info when user is authenticated
    useEffect(() => {
        const fetchInfo = async () => {
            // Check if user is logged in (has token)
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await getRestaurantInfo();

                if (response.success && response.data) {
                    setRestaurantInfo({
                        name: response.data.name || "RoRi",
                        logoUrl: response.data.logoUrl || "/images/logo.png",
                        address: response.data.address || "",
                        email: response.data.email || "",
                        phone: response.data.phone || "",
                        taxRate: response.data.taxRate ?? 10.0,
                        serviceCharge: response.data.serviceCharge ?? 0.0,
                        discountRules: response.data.discountRules || [],
                        qrPayment: response.data.qrPayment || null,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch restaurant info:", error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();

        // Listen for auth success event (when user logs in)
        const handleAuthSuccess = () => {
            fetchInfo();
        };
        window.addEventListener("auth:success", handleAuthSuccess);

        return () => {
            window.removeEventListener("auth:success", handleAuthSuccess);
        };
    }, []);



    // Update Browser Title & Favicon
    useEffect(() => {
        if (restaurantInfo.name) {
            document.title = restaurantInfo.name;
        }

        if (restaurantInfo.logoUrl) {
            let link = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.type = 'image/png';
            link.href = restaurantInfo.logoUrl;
        }
    }, [restaurantInfo]);

    // Function to update restaurant info (used by RestaurantSettingsContent)
    const updateRestaurantInfo = (newInfo) => {
        setRestaurantInfo((prev) => ({
            ...prev,
            ...newInfo,
        }));
    };

    // Refresh function to reload data from API
    const refreshRestaurantInfo = async () => {
        try {
            const response = await getRestaurantInfo();
            if (response.success && response.data) {
                setRestaurantInfo({
                    name: response.data.name || "RoRi",
                    logoUrl: response.data.logoUrl || "/images/logo.png",
                    address: response.data.address || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    taxRate: response.data.taxRate ?? 10.0,
                    serviceCharge: response.data.serviceCharge ?? 0.0,
                    discountRules: response.data.discountRules || [],
                    qrPayment: response.data.qrPayment || null,
                });
            }
        } catch (error) {
            console.error("Failed to refresh restaurant info:", error);
        }
    };

    return (
        <RestaurantContext.Provider
            value={{
                restaurantInfo,
                loading,
                updateRestaurantInfo,
                refreshRestaurantInfo,
            }}
        >
            {children}
        </RestaurantContext.Provider>
    );
};

// Custom hook for easy access
export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error("useRestaurant must be used within a RestaurantProvider");
    }
    return context;
};

export default RestaurantContext;
