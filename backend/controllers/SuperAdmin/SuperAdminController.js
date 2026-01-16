// Controller for Super Admin operations
class SuperAdminController {
  constructor(superAdminService) {
    this.superAdminService = superAdminService;
  }

  /**
   * GET /api/superadmin/admins
   * Get all platform admins
   */
  getAllAdmins = async (req, res, next) => {
    try {
      const admins = await this.superAdminService.getAllAdmins();
      
      return res.status(200).json({
        success: true,
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/superadmin/admins/:id
   * Get admin by ID
   */
  getAdminById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const admin = await this.superAdminService.getAdminById(parseInt(id));
      
      return res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      if (error.message === "Admin not found") {
        error.statusCode = 404;
      }
      next(error);
    }
  };

  /**
   * POST /api/superadmin/admins
   * Create new admin
   */
  createAdmin = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      const newAdmin = await this.superAdminService.createAdmin({
        email,
        password,
      });
      
      return res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: newAdmin,
      });
    } catch (error) {
      if (
        error.message.includes("required") ||
        error.message.includes("already exists") ||
        error.message.includes("must be")
      ) {
        error.statusCode = 400;
      }
      next(error);
    }
  };

  /**
   * PUT /api/superadmin/admins/:id
   * Update admin
   */
  updateAdmin = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email, password } = req.body;
      
      const updatedAdmin = await this.superAdminService.updateAdmin(
        parseInt(id),
        { email, password }
      );
      
      return res.status(200).json({
        success: true,
        message: "Admin updated successfully",
        data: updatedAdmin,
      });
    } catch (error) {
      if (error.message === "Admin not found") {
        error.statusCode = 404;
      } else if (
        error.message.includes("already exists") ||
        error.message.includes("must be")
      ) {
        error.statusCode = 400;
      }
      next(error);
    }
  };

  /**
   * DELETE /api/superadmin/admins/:id
   * Delete admin
   */
  deleteAdmin = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      await this.superAdminService.deleteAdmin(parseInt(id));
      
      return res.status(200).json({
        success: true,
        message: "Admin deleted successfully",
      });
    } catch (error) {
      if (error.message === "Admin not found") {
        error.statusCode = 404;
      } else if (error.message.includes("Cannot delete")) {
        error.statusCode = 400;
      }
      next(error);
    }
  };
}

export default SuperAdminController;
