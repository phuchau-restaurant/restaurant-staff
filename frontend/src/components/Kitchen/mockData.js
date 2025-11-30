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
        station: 'grill',
        completed: true  // Ready - có thể phục vụ
      },
      { 
        id: 2, 
        name: 'Khoai Tây Chiên', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&q=80', 
        notes: '', 
        station: 'fryer',
        completed: false  // Pending - đang nấu
      }
    ],
    server: 'Nguyễn Văn A',
    status: 'cooking',
    orderTime: new Date(Date.now() - 2 * 60000),
    startTime: new Date(Date.now() - 1 * 60000),
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
        station: 'fryer',
        completed: true  // Ready - có thể phục vụ
      },
      { 
        id: 4, 
        name: 'Salad Trộn', 
        quantity: 2, 
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80', 
        notes: '', 
        station: 'salad',
        completed: true  // Ready - có thể phục vụ
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
        id: 5, 
        name: 'Trà Đào Cam Sả', 
        quantity: 2, 
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80', 
        notes: 'Ít đường', 
        station: 'bar',
        completed: false  // Pending - đang nấu
      },
      { 
        id: 6, 
        name: 'Cà Phê Sữa Đá', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&q=80', 
        notes: '', 
        station: 'bar',
        completed: false  // Pending - đang nấu
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
        id: 7, 
        name: 'Bánh Kem Dâu', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80', 
        notes: '', 
        station: 'dessert',
        completed: false  // Pending - chờ xử lý
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
  },
  {
    id: 6,
    orderNumber: 'O-006',
    tableNumber: 10,
    items: [
      { 
        id: 8, 
        name: 'Sườn Nướng BBQ', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80', 
        notes: 'Nhiều sốt BBQ', 
        station: 'grill' 
      },
      { 
        id: 9, 
        name: 'Salad Trộn', 
        quantity: 2, 
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80', 
        notes: 'Không hành tây', 
        station: 'bar' 
      },
      { 
        id: 10, 
        name: 'Mực Chiên Giòn', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&q=80', 
        notes: '', 
        station: 'fryer' 
      },
      { 
        id: 11, 
        name: 'Tiramisu', 
        quantity: 1, 
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&q=80', 
        notes: 'Thêm kem', 
        station: 'dessert' 
      }
    ],
    server: 'Phạm Thị D',
    status: 'new',
    orderTime: new Date(Date.now() - 3 * 60000),
    startTime: null,
    completeTime: null
  }
];
