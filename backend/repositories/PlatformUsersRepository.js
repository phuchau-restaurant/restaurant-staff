// Repository for Platform Users (Super Admins)
import PlatformUser from "../models/PlatformUsers.js";

class PlatformUsersRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  /**
   * Find platform user by email
   * @param {string} email
   * @returns {Promise<PlatformUser|null>}
   */
  async findByEmail(email) {
    const { data, error } = await this.supabase
      .from('platform_users')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data ? new PlatformUser(data) : null;
  }

  /**
   * Get platform user by ID
   * @param {number} id
   * @returns {Promise<PlatformUser|null>}
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from('platform_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data ? new PlatformUser(data) : null;
  }

  /**
   * Get all platform users
   * @returns {Promise<PlatformUser[]>}
   */
  async getAll() {
    const { data, error } = await this.supabase
      .from('platform_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((row) => new PlatformUser(row));
  }

  /**
   * Create new platform user (admin)
   * @param {Object} userData - { email, password_hash, role }
   * @returns {Promise<PlatformUser>}
   */
  async create(userData) {
    const { data, error } = await this.supabase
      .from('platform_users')
      .insert([{
        email: userData.email,
        password_hash: userData.password_hash,
        role: userData.role || 'super_admin',
      }])
      .select()
      .single();

    if (error) throw error;

    return new PlatformUser(data);
  }

  /**
   * Update platform user
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<PlatformUser>}
   */
  async update(id, updates) {
    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('platform_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data ? new PlatformUser(data) : null;
  }

  /**
   * Delete platform user
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const { error } = await this.supabase
      .from('platform_users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  }

  /**
   * Check if email exists
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const { data, error } = await this.supabase
      .from('platform_users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (error) throw error;

    return data && data.length > 0;
  }
}

export default PlatformUsersRepository;
