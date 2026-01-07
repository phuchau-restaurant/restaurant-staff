//backend/controllers/Users/usersController.js

//Ko cần import - nhận service thông qua constructor:
//ko cần: import UsersService from "../../services/Users/UsersService.js";

// Thêm dòng này để kiểm tra ngay lập tức khi chạy server:
//console.log('Loaded .env from:', envPath);

class UsersController {
  //inject service vào controller thông qua constructor
  constructor(usersService) {
    this.usersService = usersService;
  }

  // [GET] /api/users
  getAll = async (req, res, next) => {
    try {
      // Lấy trực tiếp từ req.tenantId (do Middleware đã gắn vào)
      const tenantId = req.tenantId;

      const onlyActive = req.query.active === "true";

      // Gọi Service
      const data = await this.usersService.getUsersByTenant(
        tenantId,
        onlyActive
      ); //sử dụng this vì tại constructor đã inject service vào this.usersService
      return res.status(200).json({ success: true, data });
    } catch (error) {
      //return res.status(500).json({ success: false, message: error.message });
      next(error); // in middleware
    }
  };

  // [GET] /api/users/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const data = await this.usersService.getUserById(id, tenantId);

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;

      next(error);
    }
  };

  // [POST] /api/users
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      // Gọi Service
      const newUser = await this.usersService.createUser({
        ...req.body,
        tenantId: tenantId, // Force tenantId từ header/token, không tin tưởng body
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      // gán 400 để middleware biết không phải lỗi server sập
      error.statusCode = 400;
      next(error);
    }
  };

  // [PUT] /api/users/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const updatedUser = await this.usersService.updateUser(
        id,
        tenantId,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [DELETE] /api/users/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.usersService.deleteUser(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
}

export default UsersController;


