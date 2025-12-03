// backend/repositories/implementation/CustomersRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { Customers } from "../../models/Customers.js";

///<summary>
/// Repository quản lý thao tác với bảng Customers trong DB
///</summary>
export class CustomerRepository extends BaseRepository {
  constructor() {
    // Mapping: [id, tenant_id, phone_number, name, loyalty_points]
    super("customers", "id"); 
  }
  /**
   * @param {string} tenantId - ID của nhà hàng/thuê bao
   * @param {string} name - Tên cần tìm
   */

  async create(data) {
    const customerEntity = new Customers(data);
    const dbPayload = customerEntity.toPersistence(); 

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload]) 
      .select();

    if (error) throw new Error(`Create failed: ${error.message}`);
    
    return result?.[0] ? new Customers(result[0]) : null;
  }

async update(id, updates) {
    //"Clean Payload"  
    const customerEntity = new Customers(updates);
    const dbPayload = customerEntity.toPersistence();
    // lọc sạch object dbPayload.
    Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] === undefined) {
            delete dbPayload[key];
        }
    });
    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbPayload) 
      .eq(this.primaryKey, id)
      .select();

    if (error) throw new Error(`[Customer] Update failed: ${error.message}`);
    
    return data?.[0] ? new Customers(data[0]) : null;
  }

  async findByName(tenantId, fullName) {
    if (!tenantId) throw new Error("TenantID is required for search");

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq('tenant_id', tenantId)
      .ilike('full_name', `%${fullName}%`);

    if (error) throw new Error(`FindByName failed: ${error.message}`);
    return data.map(item => new Customers(item)) || [];
  }
  
  async findByPhoneNumber(tenantId, phoneNumber) {
    if (!tenantId) throw new Error("TenantID is required for search");
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq('tenant_id', tenantId)
      .eq('phone_number', phoneNumber);

    if (error) throw new Error(`FindByPhoneNumber failed: ${error.message}`);
    return data.map(item => new Customers(item)) || [];
  }

async getById(id) {
    const rawData = await super.getById(id); 
    return rawData ? new Customers(rawData) : null; 
}

  async getAll(filters = {}) {
    const rawData = await super.getAll(filters);    
    return rawData.map(item => new Customers(item));
  }
 
}