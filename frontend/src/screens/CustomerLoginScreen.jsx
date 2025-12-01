import React, { useState } from 'react';

const CustomerLoginScreen = ({ onSelectScreen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Gọi API đăng nhập ở đây với email và password
    console.log('Logging in with:', { email, password });
    
    // Giả sử đăng nhập thành công, chuyển đến màn hình menu
    // Trong thực tế, bạn sẽ chuyển hướng sau khi API trả về thành công
    onSelectScreen("menu"); 
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-6 w-full">

      {/* MAIN CARD */}
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-2">

        {/* LEFT ILLUSTRATION */}
        <div className="relative bg-yellow-300 flex items-center justify-center p-10">

          {/* Organic background */}
          <svg
            viewBox="0 0 500 500"
            className="absolute inset-0 w-full h-full text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M438,327Q427,404,355,445Q283,486,207,459.5Q131,433,92,371.5Q53,310,63,238Q73,166,121.5,107Q170,48,247,54Q324,60,389,104Q454,148,451,224Q448,300,438,327Z"
            />
          </svg>

          {/* Minimal illustration */}
          <svg
            width="180"
            height="180"
            viewBox="0 0 200 200"
            className="relative z-10 drop-shadow-xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Circle */}
            <circle cx="100" cy="100" r="80" fill="white" />
            {/* Lock icon */}
            <rect
              x="70"
              y="90"
              width="60"
              height="55"
              rx="10"
              fill="#6C5CE7"
            />
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

          {/* LOGIN FORM */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="text-left">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="text-left">
              <label className="block mb-1 font-medium">Mật khẩu</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 py-3 font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
            >
              Đăng nhập
            </button>
          </form>

          <p className="mt-6 text-sm">
            Chưa có tài khoản?{" "}
            <button 
              onClick={() => onSelectScreen('register')} 
              className="text-yellow-600 font-semibold hover:underline"
            >
              Đăng ký tại đây
            </button>
          </p>

          <button 
            onClick={() => onSelectScreen('login')} 
            className="mt-4 text-gray-500 text-sm hover:underline"
          >
            Quay về trang chủ
          </button>

          {/* FOOTER */}
          <p className="text-gray-400 text-xs mt-10">
            © {new Date().getFullYear()} Nguyen Phuc Hau
          </p>

        </div>
      </div>
    </div>
  );
}

export default CustomerLoginScreen
