// backend/seeds/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Setup Environment để kết nối DB
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Trỏ về file .env gốc

// 2. Import Repositories
import { TablesRepository } from '../repositories/implementation/TablesRepository.js';
//import { AppSettingRepository } from '../repositories/implementation/AppSettingRepository.js';
import TableStatus from '../constants/tableStatus.js';
import TableLocation from '../constants/tableLocation.js';

// 3. Hàm Seed chính
const seedDatabase = async () => {
    console.log('🌱 Starting database seeding...');

    const TENANT_ID = '019abac9-8488-7a85-a0c5-3ac7b0fc9b4f'; //Tenant id mẫu (có sẵn ở DB server nguyên gốc)

    const tablesRepo = new TablesRepository();
    //const settingsRepo = new AppSettingRepository();

    try {
        // --- SEED TABLES ---
        console.log('Creating Tables...');
        const tablesData = [
            { tenantId: TENANT_ID, tableNumber: 'Bàn 01', capacity: 4, location: TableLocation.INDOOR, status: TableStatus.AVAILABLE },
            { tenantId: TENANT_ID, tableNumber: 'Bàn 02', capacity: 2, location: TableLocation.INDOOR, status: TableStatus.OCCUPIED },
            { tenantId: TENANT_ID, tableNumber: 'VIP 01', capacity: 10, location: TableLocation.VIP_ROOM, status: TableStatus.ACTIVE },
            { tenantId: TENANT_ID, tableNumber: 'Sân vườn 01', capacity: 6, location: TableLocation.OUTDOOR, status: TableStatus.AVAILABLE },
        ];

        for (const t of tablesData) {
            // Check trùng trước khi tạo để tránh lỗi chạy lại seed nhiều lần
            const exists = await tablesRepo.findByTableNumber(TENANT_ID, t.tableNumber);
            if (!exists) {
                await tablesRepo.create(t);
                console.log(`+ Created table: ${t.tableNumber}`);
            } else {
                console.log(`- Skipped existing table: ${t.tableNumber}`);
            }
        }

        console.log('✅ Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Chạy hàm
seedDatabase();