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
    color: 'bg-blue-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50'
  },
  cooking: {
    label: 'Đang chế biến',
    color: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-50'
  },
  late: {
    label: 'Quá giờ!',
    color: 'bg-red-600',
    borderColor: 'border-red-600',
    textColor: 'text-red-700',
    bgLight: 'bg-red-50'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-green-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-gray-500',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-600',
    bgLight: 'bg-gray-100'
  }
};
