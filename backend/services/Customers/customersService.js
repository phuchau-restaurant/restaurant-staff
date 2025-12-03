// backend/services/Customers/customersService.js
import { isValidPhoneNumber } from "../../helpers/validationHelper.js"; 
import{ isValidFullName } from "../../helpers/validationHelper.js";

class CustomersService {
  constructor(customerRepository) {
    this.customerRepo = customerRepository;
  }

  /**
   * Lấy danh sách danh mục của một nhà hàng (Tenant)
   * @param {string} tenantId - ID của nhà hàng (Bắt buộc)
   * @param {boolean} onlyActive - Nếu true, chỉ lấy danh mục đang hoạt động
   */
  async getCustomersByTenant(tenantId, onlyActive = false) {
    if (!tenantId) throw new Error("Missing tenantId");

    const filters = { tenant_id: tenantId }; 
    
    if (onlyActive) {
      filters.is_active = true;
    }
   
    return await this.customerRepo.getAll(filters);
  }

  /**
   * Tạo danh mục mới
   * - Rule 1: Tên không được để trống
   * - Rule 2: Tên không được trùng trong cùng 1 Tenant
   */
  async createCustomer({ tenantId, phoneNumber, fullName ,loyaltyPoints = 0 }) {

    if (!tenantId) throw new Error("Tenant ID is required");
    if (!fullName || fullName.trim() === "") throw new Error("Customer full name is required");
    if (!phoneNumber || phoneNumber.trim() === "") throw new Error("Customer phone number is required");
    if (isNaN(loyaltyPoints) || loyaltyPoints < 0) { loyaltyPoints = 0; }

    //Business rule
    if (!isValidPhoneNumber(phoneNumber.trim())) {
      throw new Error("Invalid phone number format");
    }
    if (!isValidFullName(fullName.trim())) {
      throw new Error("Invalid full name format");
    }

    const existing = await this.customerRepo.findByPhoneNumber(tenantId, phoneNumber.trim());
    if (existing && existing.length > 0) {
      const isExactMatch = existing
            .some(cust => cust.phoneNumber === phoneNumber.trim());
      if (isExactMatch) {
        throw new Error(`Customer with phone number '${phoneNumber.trim()}' already exists in this tenant`);
      }
    }
    
    const newCustomerData = {
      tenantId: tenantId,         
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      loyaltyPoints: loyaltyPoints          
    };
    return await this.customerRepo.create(newCustomerData);
  }

  /**
   * @param {string} id - ID danh mục
   * @param {string} tenantId - ID nhà hàng (Dùng để verify quyền sở hữu)
   */
  async getCustomerById(id, tenantId) {
    if (!id) throw new Error("Customer ID is required");

    const customer = await this.customerRepo.getById(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    if (tenantId && customer.tenantId !== tenantId) { 
      throw new Error("Access denied: Customer belongs to another tenant");
    }
    return customer;
  }

  async findCustomerByPhoneNumber(tenantId, phoneNumber) {
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!phoneNumber || phoneNumber.trim() === "") throw new Error("Customer phone number is required");

    const customers = await this.customerRepo.findByPhoneNumber(tenantId, phoneNumber.trim());
    if (!customers || customers.length === 0) {
      throw new Error("Customer not found");
    }
    if (tenantId && customers[0].tenantId !== tenantId) { 
      throw new Error("Access denied: Customer belongs to another tenant");
    }
    return customers[0]; //model - entity
  }

  /**
   * Cập nhật 
   * Bắt buộc customer cần có số điện thoại
   */
  async updateCustomer(id, tenantId, updates) {
    await this.getCustomerById(id, tenantId); //throw error if not found

    if (updates.phoneNumber) {
        //Business rule
        if (!isValidPhoneNumber(updates.phoneNumber.trim())) {
        throw new Error("Invalid phone number format");
        }
        if (!isValidFullName(updates.fullName.trim())) {
        throw new Error("Invalid full name format");
        }

       const existing = await this.customerRepo.findByPhoneNumber(tenantId, updates.phoneNumber.trim());
       const isDuplicate = existing.some(cust => cust.id !== id && cust.phoneNumber === updates.phoneNumber.trim());
       if (isDuplicate) {
         throw new Error(`Customer with phone number '${updates.phoneNumber}' already exists`);
       }
    }

    return await this.customerRepo.update(id, updates);
  }


  async deleteCustomer(id, tenantId) {
    await this.getCustomerById(id, tenantId);
    return await this.customerRepo.delete(id);
  }
}

export default CustomersService; 