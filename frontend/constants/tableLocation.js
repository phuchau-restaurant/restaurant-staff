/**
* Định nghĩa các vị trí của bàn (Table Location)
* Tương ứng với ENUM table_location trong Database
*/
const TableLocation = {
INDOOR: 'Indoor',
OUTDOOR: 'Outdoor',
PATIO: 'Patio',
VIP_ROOM: 'VIP_Room'
};

// Đóng băng object để không thể thay đổi
Object.freeze(TableLocation);

export default TableLocation;