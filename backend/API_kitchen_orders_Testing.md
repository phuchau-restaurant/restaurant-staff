# Hướng dẫn Test (Thunder Client)

## Môi trường

- Base URL: `http://localhost:3000`
- Header bắt buộc: `x-tenant-id: <tenant-id>`

---

## Kịch bản 1 — Lấy đơn chờ (chỉ lọc Order Status)

- Method: `GET`
- Endpoint: `/api/kitchen/orders?status=pending`
- Các trạng thái khác có thể thử: `pending`, `compledted`, `cancelled`
Ví dụ (curl):

```
curl -X GET "http://localhost:3000/api/kitchen/orders?status=pending" \
  -H "x-tenant-id: 019abac9-846f-75d0-8dfd-bcf9c9457866"
```

Kết quả mong đợi:

- Trả về danh sách các đơn có `order.status = pending`.
- Mỗi đơn trả về vẫn kèm theo TOÀN BỘ món trong đơn (bao gồm cả món đã hoàn thành).

---

## Kịch bản 2 — Lọc 2 bước (Order Pending + Món Pending)

- Method: `GET`
- Endpoint: `/api/kitchen/orders?status=pending&item_status=pending`
- Các trạng thái khác có thể thử: `pending`, `ready`, `served`, `cancelled`
Ví dụ (curl):

```
curl -X GET "http://localhost:3000/api/kitchen/orders?status=pending&item_status=pending" \
  -H "x-tenant-id: <tenant-id>"
```

Kết quả mong đợi:

- Chỉ trả về các đơn có `order.status = pending`.
- Trong mỗi đơn, chỉ hiển thị các món có trạng thái `item.status = pending` (những món đã xong sẽ bị loại khỏi danh sách món của đơn đó).

Ví dụ minh họa:

- Nếu một đơn có 3 món: 2 món đã xong, 1 món còn pending → kết quả trả về chứa đơn đó nhưng chỉ có 1 món (món pending).
- Nếu một đơn có 3 món và tất cả 3 món đều đã hoàn thành → đơn đó sẽ không xuất hiện trong kết quả (bị lọc ra bởi bước lọc cuối cùng trong Service).

---

## Ghi chú

- Đảm bảo truyền `x-tenant-id` trong header để lấy dữ liệu đúng tenant.
- Hệ thống lọc theo `order.status` trước, sau đó lọc `items` trong mỗi order theo `item_status`. Nếu sau khi lọc items một order không còn item nào, order đó sẽ không được trả về.

---

Nếu bạn muốn, mình có thể:

- Thêm ví dụ response JSON mẫu cho từng kịch bản.
- Thêm các test requests sẵn sàng cho Thunder Client hoặc Postman.
✅ Hướng dẫn Test (Thunder Client)
Kịch bản 1: Lấy đơn chờ (Chỉ lọc Order Status)

Method: GET

URL: http://localhost:3000/api/kitchen/orders?status=pending

Header: x-tenant-id: ...

Kết quả: Trả về danh sách các đơn đang pending, kèm theo TOÀN BỘ món ăn trong đơn đó (kể cả món đã xong).

Kịch bản 2: Lọc 2 bước (Order Pending + Món Pending)

Method: GET

URL: http://localhost:3000/api/kitchen/orders?status=pending&item_status=pending

Kết quả:

Chỉ trả về các đơn đang pending.

Trong đơn đó, chỉ hiện các món chưa nấu (pending).

Nếu đơn hàng có 3 món, 2 món đã xong, 1 món chưa -> Chỉ hiện 1 món chưa xong.

Nếu đơn hàng có 3 món và đã xong cả 3 -> Đơn hàng này sẽ biến mất khỏi danh sách (nhờ dòng filter cuối cùng trong Service).