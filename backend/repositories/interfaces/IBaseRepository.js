// backend/repositories/interfaces/IBaseRepository.js

/**
 * Interface giả lập (Abstract Class) -- thứ mà Js không hỗ trợ trực tiếp :Đ
 * Định nghĩa các hành động chuẩn buộc phải có.
 */
export class IBaseRepository {
  constructor() {
    if (this.constructor === IBaseRepository) {
      throw new Error("Cannot instantiate abstract class IBaseRepository directly.");
    }
  }

  async create(data) { throw new Error("Method 'create' must be implemented."); }
  async getById(id) { throw new Error("Method 'getById' must be implemented."); }
  async update(id, data) { throw new Error("Method 'update' must be implemented."); }
  async delete(id) { throw new Error("Method 'delete' must be implemented."); }
  async getAll(filters) { throw new Error("Method 'getAll' must be implemented."); }
}