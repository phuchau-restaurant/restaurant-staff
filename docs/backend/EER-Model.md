```mermaid
erDiagram
    %% --- SYSTEM / GLOBAL ---
    platform_users {
        integer id PK
        varchar email UK
        varchar password_hash
        varchar role "Default: super_admin"
    }

    tenants {
        uuid id PK "Default: uuid_generate_v7"
        varchar name
        varchar slug UK
        varchar owner_email
        varchar status "Default: active"
        varchar subscription_plan "Default: basic"
        timestamp created_at
    }

    %% --- TENANT RESOURCES ---
    app_settings {
        integer id PK
        uuid tenant_id FK
        varchar key
        text value
        varchar value_type
        varchar category
        text description
        boolean is_system
    }

    users {
        integer id PK
        uuid tenant_id FK
        varchar email
        varchar password_hash
        varchar full_name
        varchar role "Default: waiter"
        boolean is_active
    }

    tables {
        integer id PK
        uuid tenant_id FK
        varchar table_number UK
        bigint current_order_id FK "Nullable"
        varchar qr_token
        timestamp qr_token_created_at
        user_defined status "Default: Active"
        user_defined location "Default: Indoor"
        integer capacity
        varchar description
        timestamp created_at
        timestamp updated_at
    }

    %% --- MENU ---
    categories {
        integer id PK
        uuid tenant_id FK
        varchar name
        integer display_order
        boolean is_active
        text url_icon
    }

    dishes {
        integer id PK
        uuid tenant_id FK
        integer category_id FK
        varchar name
        text description
        numeric price
        text image_url
        boolean is_available
    }

    %% --- OPERATIONS ---
    orders {
        bigint id PK
        uuid tenant_id FK
        integer table_id FK
        numeric total_amount
        timestamp created_at
        timestamp completed_at
        user_defined status "Default: Unsubmit"
    }

    order_details {
        bigint id PK
        uuid tenant_id FK
        bigint order_id FK
        integer dish_id FK
        integer quantity
        numeric unit_price
        numeric total_price
        varchar note
        user_defined status
    }

    payments {
        integer id PK
        uuid tenant_id FK
        bigint order_id FK "Unique"
        numeric amount
        varchar payment_method
        varchar payment_status "Default: pending"
        varchar transaction_id
        timestamp paid_at
    }

    %% --- RELATIONSHIPS ---
    
    %% Tenant Ownership (1 tenant has many resources)
    tenants ||--o{ app_settings : "defines"
    tenants ||--o{ users : "employs"
    tenants ||--o{ tables : "owns"
    tenants ||--o{ categories : "manages"
    tenants ||--o{ dishes : "serves"
    tenants ||--o{ orders : "records"
    tenants ||--o{ order_details : "archives"
    tenants ||--o{ payments : "collects"

    %% Operational Logic
    categories ||--o{ dishes : "contains"
    
    tables |o--o{ orders : "hosts (history)"
    tables |o--o| orders : "currently serving (state)"
    
    orders ||--o{ order_details : "includes"
    dishes ||--o{ order_details : "appears in"
    
    orders ||--o| payments : "paid by (1-to-1)"