-- Create platform_users table for Super Admins
CREATE TABLE IF NOT EXISTS platform_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'super_admin' NOT NULL,
    refresh_token_hash VARCHAR(255),
    refresh_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);

-- Insert a default super admin account
-- Email: superadmin@restaurant.com
-- Password: Admin@123 (you should change this after first login)
INSERT INTO platform_users (email, password_hash, role)
VALUES (
    'superadmin@restaurant.com',
    '$2a$10$YourHashedPasswordHere', -- This will be replaced with actual hash
    'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- Note: To generate the password hash, run this in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('Admin@123', 10);
-- console.log(hash);
