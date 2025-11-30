import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const StaffAccountsStep = ({ staff, setStaff }) => {
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Waiter', username: '', password: '' });

  const addStaff = () => {
    if (newStaff.name && newStaff.username && newStaff.password) {
      setStaff([...staff, { ...newStaff, id: Date.now() }]);
      setNewStaff({ name: '', role: 'Waiter', username: '', password: '' });
    }
  };

  const removeStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tài khoản nhân viên</h2>
      <p className="text-gray-600">Tạo tài khoản cho nhân viên của bạn</p>

      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Tên nhân viên"
          />
          <select
            value={newStaff.role}
            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
            <option value="Waiter">Waiter</option>
            <option value="Kitchen">Kitchen</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={newStaff.username}
            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Tên đăng nhập"
          />
          <input
            type="password"
            value={newStaff.password}
            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Mật khẩu"
          />
        </div>
        <button
          onClick={addStaff}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
        >
          Thêm nhân viên
        </button>
      </div>

      <div className="space-y-2">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-lg">
            <div>
              <p className="font-semibold text-gray-800">{s.name}</p>
              <p className="text-sm text-gray-500">{s.role} - {s.username}</p>
            </div>
            <button
              onClick={() => removeStaff(s.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffAccountsStep;
