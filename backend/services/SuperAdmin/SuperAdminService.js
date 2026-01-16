// Service for Super Admin operations
import bcrypt from "bcryptjs";

class SuperAdminService {
  constructor(platformUsersRepository) {
    this.platformUsersRepo = platformUsersRepository;
  }

  /**
   * Get all platform admins
   * @returns {Promise<Array>}
   */
  async getAllAdmins() {
    const admins = await this.platformUsersRepo.getAll();
    // Return without sensitive data
    return admins.map(admin => admin.toJSON());
  }

  /**
   * Get admin by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getAdminById(id) {
    const admin = await this.platformUsersRepo.getById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }
    return admin.toJSON();
  }

  /**
   * Create new admin
   * @param {Object} adminData - { email, password }
   * @returns {Promise<Object>}
   */
  async createAdmin(adminData) {
    const { email, password } = adminData;

    // Validate input
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Check if email already exists
    const emailExists = await this.platformUsersRepo.emailExists(email.trim());
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await this.platformUsersRepo.create({
      email: email.trim(),
      password_hash: passwordHash,
      role: 'super_admin',
    });

    return newAdmin.toJSON();
  }

  /**
   * Update admin
   * @param {number} id
   * @param {Object} updates - { email?, password? }
   * @returns {Promise<Object>}
   */
  async updateAdmin(id, updates) {
    const admin = await this.platformUsersRepo.getById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    const updateData = {};

    // Update email if provided
    if (updates.email && updates.email.trim()) {
      // Check if new email already exists (excluding current admin)
      const existingAdmin = await this.platformUsersRepo.findByEmail(updates.email.trim());
      if (existingAdmin && existingAdmin.id !== id) {
        throw new Error("Email already exists");
      }
      updateData.email = updates.email.trim();
    }

    // Update password if provided
    if (updates.password) {
      if (updates.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      updateData.password_hash = await bcrypt.hash(updates.password, 10);
    }

    // Perform update
    const updatedAdmin = await this.platformUsersRepo.update(id, updateData);
    return updatedAdmin.toJSON();
  }

  /**
   * Delete admin
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteAdmin(id) {
    const admin = await this.platformUsersRepo.getById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Prevent deleting the last admin
    const allAdmins = await this.platformUsersRepo.getAll();
    if (allAdmins.length <= 1) {
      throw new Error("Cannot delete the last admin");
    }

    return await this.platformUsersRepo.delete(id);
  }
}

export default SuperAdminService;
