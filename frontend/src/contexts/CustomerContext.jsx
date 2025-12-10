// src/contexts/CustomerContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within CustomerProvider");
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = sessionStorage.getItem("customer");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });   

  const [tableInfo, setTableInfo] = useState(() => {
    try {
      const stored = sessionStorage.getItem("tableInfo");
      return stored ? JSON.parse(stored) : { id: null, number: "..." };
    } catch {
      return { id: null, number: "..." };
    }
  });

  useEffect(() => {
    if (customer) {
      sessionStorage.setItem("customer", JSON.stringify(customer));
    } else {
      sessionStorage.removeItem("customer");
    }
  }, [customer]);

  useEffect(() => {
    if (tableInfo?.id) {
      sessionStorage.setItem("tableInfo", JSON.stringify(tableInfo));
    }
  }, [tableInfo]);

  const login = (customerData) => {
    const normalized = {
      name: (customerData.fullName || customerData.name || "").trim(),
      phoneNumber: customerData.phoneNumber,
      loyaltyPoints:
        typeof customerData.loyaltyPoints === "number"
          ? customerData.loyaltyPoints
          : 0,
    };
    setCustomer(normalized);
  };

  const logout = () => {
    setCustomer(null);
    sessionStorage.removeItem("customer");
  };

  const updateTable = (table) => {
    setTableInfo(table);
  };

  return (
    <CustomerContext.Provider
      value={{ customer, tableInfo, login, logout, updateTable }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
