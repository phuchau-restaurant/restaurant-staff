export const MOCK_ORDERS = [
  {
    id: 1,
    orderNumber: 'O-001',
    tableNumber: 5,
    items: [
      { 
        id: 1, 
        name: 'Bò Phô Mai Đặc Biệt', 
        quantity: 2, 
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80', 
        notes: 'Ít cay, không hành', 
        station: 'grill' 
      },
      { 
        id: 2, 
        name: 'Khoai Tây Chiên', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&q=80', 
        notes: '', 
        station: 'fryer' 
      }
    ],
    server: 'Nguyễn Văn A',
    status: 'new',
    orderTime: new Date(Date.now() - 2 * 60000),
    startTime: null,
    completeTime: null
  },
  {
    id: 2,
    orderNumber: 'O-002',
    tableNumber: 12,
    items: [
      { 
        id: 3, 
        name: 'Gà Giòn Cay', 
        quantity: 3, 
        image: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=200&q=80', 
        notes: 'Thêm sốt', 
        station: 'fryer' 
      }
    ],
    server: 'Trần Thị B',
    status: 'cooking',
    orderTime: new Date(Date.now() - 8 * 60000),
    startTime: new Date(Date.now() - 6 * 60000),
    completeTime: null
  },
  {
    id: 3,
    orderNumber: 'O-003',
    tableNumber: 8,
    items: [
      { 
        id: 4, 
        name: 'Trà Đào Cam Sả', 
        quantity: 2, 
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80', 
        notes: 'Ít đường', 
        station: 'bar' 
      },
      { 
        id: 5, 
        name: 'Cà Phê Sữa Đá', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&q=80', 
        notes: '', 
        station: 'bar' 
      }
    ],
    server: 'Lê Văn C',
    status: 'cooking',
    orderTime: new Date(Date.now() - 12 * 60000),
    startTime: new Date(Date.now() - 10 * 60000),
    completeTime: null
  },
  {
    id: 4,
    orderNumber: 'O-004',
    tableNumber: 3,
    items: [
      { 
        id: 6, 
        name: 'Bánh Kem Dâu', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80', 
        notes: '', 
        station: 'dessert' 
      }
    ],
    server: 'Nguyễn Văn A',
    status: 'new',
    orderTime: new Date(Date.now() - 15 * 60000),
    startTime: null,
    completeTime: null
  },
  {
    id: 5,
    orderNumber: 'O-005',
    tableNumber: 7,
    items: [
      { 
        id: 7, 
        name: 'Bò Nướng Đặc Biệt', 
        quantity: 2, 
        image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=200&q=80', 
        notes: 'Chín vừa', 
        station: 'grill' 
      }
    ],
    server: 'Trần Thị B',
    status: 'completed',
    orderTime: new Date(Date.now() - 20 * 60000),
    startTime: new Date(Date.now() - 18 * 60000),
    completeTime: new Date(Date.now() - 2 * 60000)
  }
];
