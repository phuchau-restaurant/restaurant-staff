CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


--Enums definition
CREATE TYPE item_status AS ENUM (
    'Pending',
    'Ready',
    'Served',
    'Cancelled'
);
CREATE TYPE table_location AS ENUM (
    'Indoor',
    'Outdoor',
    'Patio',
    'VIP_Room'
);

CREATE TYPE table_status AS ENUM (
    'Active',
    'Inactive',
    'Available',
    'Occupied'
);
CREATE TYPE order_status AS ENUM (
    'Unsubmit',
    'Approved',
    'Pending',
    'Completed',
    'Served',
    'Paid',
    'Cancelled'
);
--End enums definition


CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  ts_bytes BYTEA;
  uuid_bytes BYTEA;
BEGIN
  -- 48-bit Unix timestamp (ms)
  ts_bytes := decode(
    lpad(
      to_hex(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint),
      12,
      '0'
    ),
    'hex'
  );

  -- Random base
  uuid_bytes := gen_random_bytes(16);

  -- Inject timestamp
  uuid_bytes := overlay(uuid_bytes placing ts_bytes from 1 for 6);

  -- Version = 7
  uuid_bytes := set_byte(uuid_bytes, 6,
    (get_byte(uuid_bytes, 6) & 15) | 112
  );

  -- Variant = RFC 4122
  uuid_bytes := set_byte(uuid_bytes, 8,
    (get_byte(uuid_bytes, 8) & 63) | 128
  );

  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$;

-- ================================================================
-- PHẦN 0: CẤU HÌNH & EXTENSIONS
-- ================================================================
-- Kích hoạt extension để tạo UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- PHẦN 1: GLOBAL / SYSTEM TABLES (Super Admin)
-- ================================================================

-- 1. Bảng tenants (Nhà hàng)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(), -- Sử dụng v7
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    owner_email VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng platform_users (Super Admin)
CREATE TABLE platform_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'super_admin'
);


-- ================================================================
-- PHẦN 2: TENANT RESOURCES (Tài nguyên Nhà hàng)
-- ================================================================

-- 3. Bảng users (Nhân viên nhà hàng)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'waiter',
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT users_email_tenant_unique UNIQUE (tenant_id, email) -- Email có thể trùng giữa các tenant khác nhau, nhưng trong 1 tenant phải duy nhất
);


-- 4. Bảng tables (Bàn ăn)
-- Lưu ý: current_order_id sẽ được Add Foreign Key sau vì bảng orders chưa tạo
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL, -- Ban 1, Ban 2, Ban Vip 1, Ban Vip 2, ...
    capacity  int default 4 check (capacity  > 0 and capacity <= 20),
    location table_location default 'Indoor',
    is_vip BOOLEAN DEFAULT false,
    qr_token varchar(500), -- null
    status table_status DEFAULT 'Active',
    qr_token_created_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_order_id BIGINT -- Kiểu dữ liệu phải khớp với orders.id (BIGSERIAL = BIGINT)
    description varchar(80)
);



-- ================================================================
-- PHẦN 3: MENU MANAGEMENT
-- ================================================================

-- 5. Bảng categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    url_icon TEXT
);

-- 6. Bảng dishes
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true
);


-- ================================================================
-- PHẦN 4: ORDERING & OPERATIONS
-- ================================================================

-- 8. Bảng orders
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,

    status order_status DEFAULT 'Unsubmit', -- Unsubmit, Approved, Pending, Completed, Served, Paid, Cancelled
    total_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE 
);


-- 9. Bảng order_details: order_details
CREATE TABLE order_details (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- Denormalization cho Sharding
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,


    dish_id INTEGER REFERENCES dishes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL, -- Snapshot giá
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED, -- Tự động tính toán
    note VARCHAR(255),
    status item_status DEFAULT 'Pending'--Pending, Ready, Served, Cancelled
);

-- 10. Bảng payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT UNIQUE REFERENCES orders(id) ON DELETE CASCADE, -- 1 Order chỉ có 1 Payment (trong mô hình đơn giản này)
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE
);

create table app_settings (
    id serial primary key,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key varchar(50) not null,
    value varchar(50) not null,
    value_type varchar(20) not null,
    category varchar(50) not null,
    description text null,
    is_system bool not null default false
);

-- ================================================================
-- PHẦN 5: BỔ SUNG RÀNG BUỘC & INDEXING (Tối ưu hiệu năng)
-- ================================================================
-- 5.1 Xử lý mối quan hệ vòng (Circular Dependency) giữa Tables và Orders
ALTER TABLE tables
ADD CONSTRAINT fk_tables_current_order
FOREIGN KEY (current_order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- 5.2 Indexing cho tenant_id (BẮT BUỘC cho Multi-tenant)
-- Giúp query "WHERE tenant_id = ..." nhanh hơn
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_tables_tenant ON tables(tenant_id);
CREATE INDEX idx_categories_tenant ON categories(tenant_id);
CREATE INDEX idx_dishes_tenant ON dishes(tenant_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
-- order_items -> order_details
CREATE INDEX idx_order_details_tenant ON order_details(tenant_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);

-- 5.3 Index bổ sung cho các khoá ngoại thường dùng để join
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_details_order ON order_details(order_id);