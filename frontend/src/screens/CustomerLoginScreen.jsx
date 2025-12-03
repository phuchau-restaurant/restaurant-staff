import React, { useState } from 'react';

const CustomerLoginScreen = ({ onSelectScreen }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  // Hàm kiểm tra số điện thoại hợp lệ
  const isValidPhone = (value) => {
    const phoneRegex = /^0\d{9,10}$/; 
    return phoneRegex.test(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      setError("Số điện thoại phải bắt đầu bằng 0 và dài 10 - 11 chữ số.");
      return;
    }

    if (!name.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }

    setError("");
    setIsLoading(true); 

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        },
        body: JSON.stringify({
          phoneNumber: phone,
          fullName: name
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        alert(data.message || "Đăng nhập thất bại");
        setIsLoading(false); 
        return;
      }

      onSelectScreen("menu");

    } catch (error) {
      console.error("Login error:", error);
      alert("Không thể kết nối server!");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-6 w-full">

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-2">

        {/* LEFT ILLUSTRATION */}
        <div className="relative bg-yellow-300 flex items-center justify-center p-10">
          <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full text-yellow-400">
            <path
              fill="currentColor"
              d="M438,327Q427,404,355,445Q283,486,207,459.5Q131,433,92,371.5Q53,310,63,238Q73,166,121.5,107Q170,48,247,54Q324,60,389,104Q454,148,451,224Q448,300,438,327Z"
            />
          </svg>

          <svg width="180" height="180" viewBox="0 0 200 200" className="relative z-10 drop-shadow-xl">
            <circle cx="100" cy="100" r="80" fill="white" />
            <rect x="70" y="90" width="60" height="55" rx="10" fill="#6C5CE7" />
            <circle cx="100" cy="115" r="8" fill="#fff" />
            <path
              d="M78 90V75C78 60 90 50 100 50C110 50 123 60 123 75V90"
              stroke="#6C5CE7"
              strokeWidth="8"
              fill="none"
            />
          </svg>
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-10 flex flex-col justify-center text-center">

          <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
          <p className="text-gray-600 mb-8 text-sm">
            Đăng nhập để tiếp tục sử dụng ứng dụng của bạn.
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>

            {/* PHONE */}
            <div className="text-left">
              <label className="block mb-1 font-medium">Số điện thoại</label>
              <input
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                placeholder="Nhập số điện thoại của bạn"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* FULL NAME */}
            <div className="text-left">
              <label className="block mb-1 font-medium">Tên của bạn</label>
              <input
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                placeholder="Nhập tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="text-red-500 text-sm text-left">{error}</p>
            )}

            {/* BUTTON WITH LOADING */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-yellow-400 py-3 font-semibold rounded-xl shadow-md transition ${
                isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-yellow-500"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="border-2 border-t-transparent border-white rounded-full w-5 h-5 animate-spin"></span>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <p className="text-gray-400 text-xs mt-10">
            © {new Date().getFullYear()} Nguyen Phuc Hau
          </p>

        </div>
      </div>
    </div>
  );
};

export default CustomerLoginScreen;
