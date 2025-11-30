import React from 'react';

const stepDescriptions = [
  {
    title: "Chào mừng đến với hệ thống quản lý nhà hàng",
    description: "Hãy bắt đầu bằng việc nhập thông tin cơ bản về nhà hàng của bạn. Thông tin này sẽ được sử dụng trên hóa đơn và các tài liệu khác."
  },
  {
    title: "Thiết lập khu vực bàn",
    description: "Tạo các khu vực trong nhà hàng và xác định số lượng bàn cho mỗi khu vực. Bạn có thể thay đổi sau này."
  },
  {
    title: "Tạo thực đơn",
    description: "Xây dựng thực đơn của bạn bằng cách tạo các nhóm món và thêm món ăn vào từng nhóm. Đừng quên thiết lập giá cho mỗi món."
  },
  {
    title: "Tạo tài khoản nhân viên",
    description: "Thêm các thành viên trong đội ngũ của bạn và phân quyền truy cập phù hợp cho từng vai trò."
  },
  {
    title: "Cấu hình màn hình bếp",
    description: "Thiết lập các station bếp và gán các món ăn tương ứng để tối ưu hóa quy trình làm việc."
  },
  {
    title: "Cài đặt POS",
    description: "Chọn loại thiết bị POS và cấu hình máy in cho hệ thống của bạn."
  },
  {
    title: "Hoàn tất thiết lập",
    description: "Xem lại tất cả thông tin đã nhập. Bạn có thể quay lại các bước trước để chỉnh sửa nếu cần."
  }
];

const InfoPanel = ({ currentStep }) => {
  const step = stepDescriptions[currentStep - 1];
  
  return (
    <div className="bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white sticky top-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-4">{step.title}</h1>
        <p className="text-blue-100 text-lg leading-relaxed">{step.description}</p>
      </div>
      <div className="mt-auto">
        <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-blue-200">{Math.round((currentStep / 7) * 100)}% hoàn thành</p>
      </div>
    </div>
  );
};

export default InfoPanel;
