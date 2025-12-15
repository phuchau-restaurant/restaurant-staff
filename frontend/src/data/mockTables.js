// Mock data for tables
import TableLocation from '../../constants/tableLocation';
import TableStatus from '../../constants/tableStatus';

export const mockTables = [
  {
    id: "1",
    tableNumber: 1,
    capacity: 4,
    area: TableLocation.INDOOR,
    description: "Bàn gần cửa sổ, view đẹp",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=1",
    qrGeneratedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    tableNumber: 2,
    capacity: 2,
    area: TableLocation.INDOOR,
    description: "Bàn nhỏ cho 2 người",
    isActive: true,
    status: TableStatus.OCCUPIED,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=2",
    qrGeneratedAt: "2024-01-15T10:05:00Z",
    createdAt: "2024-01-15T10:05:00Z",
  },
  {
    id: "3",
    tableNumber: 3,
    capacity: 6,
    area: TableLocation.INDOOR,
    description: "Bàn gia đình",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=3",
    qrGeneratedAt: "2024-01-15T10:10:00Z",
    createdAt: "2024-01-15T10:10:00Z",
  },
  {
    id: "4",
    tableNumber: 4,
    capacity: 4,
    area: TableLocation.INDOOR,
    description: "Khu vực yên tĩnh",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=4",
    qrGeneratedAt: "2024-01-15T10:15:00Z",
    createdAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "5",
    tableNumber: 5,
    capacity: 8,
    area: TableLocation.OUTDOOR,
    description: "Bàn VIP, phù hợp cho nhóm lớn",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=5",
    qrGeneratedAt: "2024-01-15T10:20:00Z",
    createdAt: "2024-01-15T10:20:00Z",
  },
  {
    id: "6",
    tableNumber: 6,
    capacity: 4,
    area: TableLocation.OUTDOOR,
    description: "",
    isActive: false,
    status: TableStatus.INACTIVE,
    hasQR: false,
    qrCodeUrl: null,
    qrGeneratedAt: null,
    createdAt: "2024-01-15T10:25:00Z",
  },
  {
    id: "7",
    tableNumber: 7,
    capacity: 10,
    area: TableLocation.PATIO,
    description: "Bàn tiệc ngoài trời",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=7",
    qrGeneratedAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "8",
    tableNumber: 8,
    capacity: 4,
    area: TableLocation.PATIO,
    description: "View thành phố",
    isActive: true,
    status: TableStatus.OCCUPIED,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=8",
    qrGeneratedAt: "2024-01-15T10:35:00Z",
    createdAt: "2024-01-15T10:35:00Z",
  },
  {
    id: "9",
    tableNumber: 9,
    capacity: 6,
    area: TableLocation.VIP_ROOM,
    description: "Phòng riêng, có điều hòa",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=9",
    qrGeneratedAt: "2024-01-15T10:40:00Z",
    createdAt: "2024-01-15T10:40:00Z",
  },
  {
    id: "10",
    tableNumber: 10,
    capacity: 2,
    area: TableLocation.VIP_ROOM,
    description: "Phòng couples",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=10",
    qrGeneratedAt: "2024-01-15T10:45:00Z",
    createdAt: "2024-01-15T10:45:00Z",
  },
  {
    id: "11",
    tableNumber: 11,
    capacity: 4,
    area: TableLocation.INDOOR,
    description: "Gần quầy bar",
    isActive: false,
    status: TableStatus.INACTIVE,
    hasQR: false,
    qrCodeUrl: null,
    qrGeneratedAt: null,
    createdAt: "2024-01-15T10:50:00Z",
  },
  {
    id: "12",
    tableNumber: 12,
    capacity: 6,
    area: TableLocation.OUTDOOR,
    description: "Bàn tròn",
    isActive: true,
    status: TableStatus.AVAILABLE,
    hasQR: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=12",
    qrGeneratedAt: "2024-01-15T10:55:00Z",
    createdAt: "2024-01-15T10:55:00Z",
  },
];

let tablesData = [...mockTables];
let nextId = 13;

export const getTableById = (id) => {
  return tablesData.find((table) => table.id === id);
};

export const createTable = (tableData) => {
  const newTable = {
    id: String(nextId++),
    ...tableData,
    hasQR: true,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=${tableData.tableNumber}`,
    createdAt: new Date().toISOString(),
  };
  tablesData.push(newTable);
  return newTable;
};

export const updateTable = (id, tableData) => {
  const index = tablesData.findIndex((table) => table.id === id);
  if (index === -1) return null;
  
  tablesData[index] = {
    ...tablesData[index],
    ...tableData,
  };
  return tablesData[index];
};

export const getAllTables = () => {
  return [...tablesData];
};

export const deleteTable = (id) => {
  const index = tablesData.findIndex((table) => table.id === id);
  if (index === -1) return false;
  
  tablesData.splice(index, 1);
  return true;
};
