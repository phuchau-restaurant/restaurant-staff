import React from 'react';
import { ChefHat, Flame } from 'lucide-react';

export const STATIONS = [
  { id: 'all', name: 'Tất cả', icon: <ChefHat size={20} /> },
  { id: 'grill', name: 'Nướng', icon: <Flame size={20} /> },
  { id: 'fryer', name: 'Chiên', icon: <Flame size={20} /> },
  { id: 'bar', name: 'Đồ uống', icon: <Flame size={20} /> },
  { id: 'dessert', name: 'Tráng miệng', icon: <Flame size={20} /> }
];

// Unified simple color for all orders - white/gray theme
export const STATUS_CONFIG = {
  new: {
    label: 'Chờ xử lý',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  cooking: {
    label: 'Đang chế biến',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  late: {
    label: 'Quá giờ!',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  }
};

// Status badge colors for displaying order status - maps to database status
export const STATUS_BADGE = {
  // Frontend computed statuses
  new: {
    label: 'Chờ xử lý',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300'
  },
  cooking: {
    label: 'Đang chuẩn bị',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  late: {
    label: 'Đang chuẩn bị',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  completed: {
    label: 'Hoàn thành',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  // Database statuses - direct mapping
  Pending: {
    label: 'Chờ xử lý',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300'
  },
  Approved: {
    label: 'Đã duyệt',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  Cooking: {
    label: 'Đang chuẩn bị',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  Completed: {
    label: 'Hoàn thành',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  Served: {
    label: 'Đã phục vụ',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300'
  },
  Cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  Unsubmit: {
    label: 'Chưa gửi',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  Paid: {
    label: 'Đã thanh toán',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300'
  }
};
