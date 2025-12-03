import React from 'react';
import { ChefHat, Flame } from 'lucide-react';

export const STATIONS = [
  { id: 'all', name: 'Tất cả', icon: <ChefHat size={20} /> },
  { id: 'grill', name: 'Nướng', icon: <Flame size={20} /> },
  { id: 'fryer', name: 'Chiên', icon: <Flame size={20} /> },
  { id: 'bar', name: 'Đồ uống', icon: <Flame size={20} /> },
  { id: 'dessert', name: 'Tráng miệng', icon: <Flame size={20} /> }
];

export const STATUS_CONFIG = {
  new: { 
    label: 'Đơn mới', 
    color: 'bg-blue-500', 
    borderColor: 'border-blue-500', 
    textColor: 'text-blue-600' 
  },
  cooking: { 
    label: 'Đang chế biến', 
    color: 'bg-yellow-500', 
    borderColor: 'border-yellow-500', 
    textColor: 'text-yellow-600' 
  },
  late: { 
    label: 'Trễ', 
    color: 'bg-red-500', 
    borderColor: 'border-red-500', 
    textColor: 'text-red-600' 
  },
  completed: { 
    label: 'Hoàn thành', 
    color: 'bg-green-500', 
    borderColor: 'border-green-500', 
    textColor: 'text-green-600' 
  },
  cancelled: { 
    label: 'Đã hủy', 
    color: 'bg-gray-500', 
    borderColor: 'border-gray-500', 
    textColor: 'text-gray-600' 
  }
};
