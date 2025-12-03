import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';

const MenuSetupStep = ({ menuGroups, setMenuGroups }) => {
  const [currentDish, setCurrentDish] = useState({ name: '', price: '', image: null });
  const [editingDish, setEditingDish] = useState(null);

  const addMenuGroup = () => {
    setMenuGroups([...menuGroups, { id: Date.now(), name: `Nhóm ${menuGroups.length + 1}`, dishes: [] }]);
  };

  const updateGroupName = (id, name) => {
    setMenuGroups(menuGroups.map(group => 
      group.id === id ? { ...group, name } : group
    ));
  };

  const addDishToGroup = (groupId) => {
    if (currentDish.name && currentDish.price) {
      setMenuGroups(menuGroups.map(group => 
        group.id === groupId 
          ? { ...group, dishes: [...group.dishes, { ...currentDish, id: Date.now() }] }
          : group
      ));
      setCurrentDish({ name: '', price: '', image: null });
    }
  };

  const deleteDish = (groupId, dishId) => {
    setMenuGroups(menuGroups.map(group => 
      group.id === groupId 
        ? { ...group, dishes: group.dishes.filter(dish => dish.id !== dishId) }
        : group
    ));
  };

  const startEditDish = (groupId, dish) => {
    setEditingDish({ groupId, dishId: dish.id, name: dish.name, price: dish.price });
  };

  const saveEditDish = () => {
    if (editingDish && editingDish.name && editingDish.price) {
      setMenuGroups(menuGroups.map(group => 
        group.id === editingDish.groupId 
          ? { 
              ...group, 
              dishes: group.dishes.map(dish => 
                dish.id === editingDish.dishId 
                  ? { ...dish, name: editingDish.name, price: editingDish.price }
                  : dish
              )
            }
          : group
      ));
      setEditingDish(null);
    }
  };

  const cancelEdit = () => {
    setEditingDish(null);
  };

  const deleteMenuGroup = (groupId) => {
    setMenuGroups(menuGroups.filter(group => group.id !== groupId));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Thiết lập thực đơn</h2>
      <p className="text-gray-600">Tạo nhóm món và thêm món ăn</p>

      <div className="space-y-4">
        {menuGroups.map((group) => (
          <div key={group.id} className="p-4 bg-white border-2 border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={group.name}
                onChange={(e) => updateGroupName(group.id, e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
                placeholder="Tên nhóm món"
              />
              <button
                onClick={() => deleteMenuGroup(group.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Xóa nhóm món"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {group.dishes.map((dish) => (
                <div key={dish.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                  {editingDish && editingDish.dishId === dish.id ? (
                    <>
                      <input
                        type="text"
                        value={editingDish.name}
                        onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                        className="flex-1 px-3 py-1 border-2 border-blue-300 rounded focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={editingDish.price}
                        onChange={(e) => setEditingDish({ ...editingDish, price: e.target.value })}
                        className="w-32 px-3 py-1 ml-2 border-2 border-blue-300 rounded focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={saveEditDish}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-medium flex-1">{dish.name}</span>
                      <span className="text-blue-600 font-semibold mr-3">{parseInt(dish.price).toLocaleString('vi-VN')}đ</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditDish(group.id, dish)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDish(group.id, dish.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentDish.name}
                onChange={(e) => setCurrentDish({ ...currentDish, name: e.target.value })}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Tên món"
              />
              <input
                type="number"
                value={currentDish.price}
                onChange={(e) => setCurrentDish({ ...currentDish, price: e.target.value })}
                className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Giá"
              />
              <button
                onClick={() => addDishToGroup(group.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addMenuGroup}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm nhóm món
        </button>
      </div>
    </div>
  );
};

export default MenuSetupStep;
