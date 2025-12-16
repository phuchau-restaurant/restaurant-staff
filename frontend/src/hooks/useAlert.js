import { useState, useCallback } from "react";

export const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info", // info, success, error, warning
  });

  const showAlert = useCallback((message, type = "info", title = "") => {
    setAlert({
      isOpen: true,
      title,
      message,
      type,
    });
  }, []);

  const showSuccess = useCallback((message, title = "Thành công") => {
    setAlert({
      isOpen: true,
      title,
      message,
      type: "success",
    });
  }, []);

  const showError = useCallback((message, title = "Lỗi") => {
    setAlert({
      isOpen: true,
      title,
      message,
      type: "error",
    });
  }, []);

  const showWarning = useCallback((message, title = "Cảnh báo") => {
    setAlert({
      isOpen: true,
      title,
      message,
      type: "warning",
    });
  }, []);

  const showInfo = useCallback((message, title = "Thông báo") => {
    setAlert({
      isOpen: true,
      title,
      message,
      type: "info",
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
  };
};
