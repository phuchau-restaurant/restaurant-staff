/**
 * Get tenant ID from localStorage
 * @returns {string|null} The tenant ID if available
 */
export const getTenantId = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user?.tenantId || null;
  } catch (error) {
    console.error('Error getting tenant ID:', error);
    return null;
  }
};
