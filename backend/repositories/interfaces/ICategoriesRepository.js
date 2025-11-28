
// backend/repositories/interfaces/ICategoriesRepository.js

import { IBaseRepository } from "./IBaseRepository.js";

//Mở rộng từ Base, thêm các hàm riêng của Category.
export class ICategoryRepository extends IBaseRepository {
  async findByName(tenantId, name) { 
    throw new Error("Method 'findByName' must be implemented."); 
  }
}