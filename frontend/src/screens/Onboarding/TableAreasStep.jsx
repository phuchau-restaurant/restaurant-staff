import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const TableAreasStep = ({ tableAreas, setTableAreas }) => {
  const addTableArea = () => {
    setTableAreas([...tableAreas, { id: Date.now(), name: `Khu vực ${tableAreas.length + 1}`, tables: 5 }]);
  };

  const removeTableArea = (id) => {
    setTableAreas(tableAreas.filter(area => area.id !== id));
  };

  const updateTableArea = (id, field, value) => {
    setTableAreas(tableAreas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Khu vực bàn</h2>
      <p className="text-gray-600">Thiết lập các khu vực và số lượng bàn</p>

      <div className="space-y-4">
        {tableAreas.map((area) => (
          <div key={area.id} className="flex items-center gap-4 p-4 bg-white border-2 border-gray-300 rounded-lg">
            <input
              type="text"
              value={area.name}
              onChange={(e) => updateTableArea(area.id, 'name', e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Tên khu vực"
            />
            <input
              type="number"
              value={area.tables}
              onChange={(e) => updateTableArea(area.id, 'tables', parseInt(e.target.value) || 0)}
              className="w-24 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Số bàn"
              min="1"
            />
            <button
              onClick={() => removeTableArea(area.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button
          onClick={addTableArea}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm khu vực
        </button>
      </div>
    </div>
  );
};

export default TableAreasStep;
