// backend/repositories/interfaces/IUsersRepository.js

import { IBaseRepository } from "./IBaseRepository.js";

//Mở rộng từ Base, thêm các hàm riêng của User.
export class IUsersRepository extends IBaseRepository {
  async findByEmail(email, tenantId = null) { 
    throw new Error("Method 'findByEmail' must be implemented."); 
  }
}