import { Mail, Lock } from 'lucide-react';

// --- COMPONENT: HOMESCREEN ---
const HomeScreen = ({ onSelectScreen }) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden flex flex-col font-sans z-50 ">
      
      {/* --- TOP DECORATIVE WAVES --- */}
      <div className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden z-0">
        {/* Light Blue Wave */}
        <svg viewBox="0 0 900 320" className="w-full h-auto fixed top-0 transform -translate-y-1/4 sm:-translate-y-1/2 opacity-80">
          <path fill="#93C5FD" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        {/* Dark Blue Wave */}
        <svg viewBox="0 0 1000 320" className="w-full h-auto fixed top-0 transform -translate-y-1/3 sm:-translate-y-1/2">
          <path fill="#3B82F6" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 z-10 flex flex-col justify-center px-8 sm:px-12 md:px-24 lg:max-w-lg lg:mx-auto w-full pt-50 pb-40">
        
        {/* Header Text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Đăng Nhập</h1>
          <p className="text-gray-500 font-medium">Hệ thống quản lý nhà hàng</p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-blue-500 text-sm font-semibold ml-1">TÊN ĐĂNG NHẬP</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                placeholder="username"
              />
              <Mail className="absolute right-4 top-3.5 w-5 h-5 text-blue-300" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-blue-500 text-sm font-semibold ml-1">MẬT KHẨU</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                placeholder="••••••••"
              />
              <Lock className="absolute right-4 top-3.5 w-5 h-5 text-blue-300" />
            </div>
          </div>

          {/* LOGIN + FORGOT IN 1 ROW */}
          <div className="flex justify-between items-center pt-2">
            <button
        
              className="
                bg-blue-600 text-white font-bold 
                py-3 px-8 rounded-xl 
                border-2 border-blue-600
                transition-all shadow-md active:scale-95
                hover:bg-white hover:text-blue-600
              "
            >
              Đăng Nhập
            </button>

            <button className="text-sm text-blue-500 hover:text-blue-700 font-medium">
              Quên mật khẩu?
            </button>
          </div>

          {/* BOTTOM SIGNUP */}
          <div className="flex justify-center items-center gap-10 mt-4">
            <span className="text-blue-500 text-sm">Chưa có tài khoản?</span>
            <button
            
              className="font-bold text-blue-600 text-sm hover:underline"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>

      {/* --- BOTTOM WAVE & CTA --- */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0">
        <svg viewBox="0 -110 900 320" className="w-full h-auto block align-bottom">
          <path fill="#3B82F6" fillOpacity="1" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,202.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg> 
      </div>
    </div>
  );
};

export default HomeScreen;
