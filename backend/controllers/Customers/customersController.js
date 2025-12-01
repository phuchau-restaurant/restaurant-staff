//backend/controllers/Customers/customersControllers.js

///<summary>
/// Controller quản lý các endpoint liên quan đến Customers
///</summary>

class CustomersController {
  constructor(customersService) { //inject constructor
      this.customersService = customersService;
    }

  // [GET] /api/customers
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId; 
      
      const onlyActive = req.query.active === 'true';
      const data = await this.customersService.getCustomersByTenant(tenantId, onlyActive); 
      return res.status(200).json({ 
        success: true,
        message: "Customers fetched successfully",
        total: data.length,
        data: data
      });

    } catch (error) {
      next(error); // in middleware
    }
  }

  // [GET] /api/customers/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const data = await this.customersService.getCustomerById(id, tenantId);

      return res.status(200).json({
        message: "Customer fetched successfully",
        success: true,
        total: data.length,
        data: data
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      
      next(error);
    }
  }
  // for [POST] /api/customers/login
  findByPhoneNumberLogin = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { phoneNumber } = req.body; //must be body, not query or params
      const data = await this.customersService.findCustomerByPhoneNumber(tenantId, phoneNumber);
      return res.status(200).json({ 
            message: "Customer fetched successfully",
            success: true, 
            total: data.length,
            data :data
        });
    } catch (error) {
        if (error.message.includes("not found")) error.statusCode = 404;
        else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  }

  // [POST] /api/customers
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      // Gọi Service
      const newCustomer = await this.customersService.createCustomer({
        ...req.body,
        tenantId: tenantId 
      });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: newCustomer
      });
    } catch (error) {
      // gán 400 để middleware biết không phải lỗi server sập
      error.statusCode = 400;
      next(error);
    }
  }

  // [PUT] /api/customers/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const updatedCustomer = await this.customersService.updateCustomer(id, tenantId, req.body);

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: updatedCustomer
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [DELETE] /api/customers/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.customersService.deleteCustomer(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Customer deleted successfully"
      });
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
  }
}

export default CustomersController;