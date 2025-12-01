// backend/models/Customers.js
export class Customers {
  constructor(data) {
    
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId; 
    this.phoneNumber = data.phone_number || data.phoneNumber;
    this.fullName = data.full_name || data.fullName;
    this.loyaltyPoints = data.loyalty_points || data.loyaltyPoints;
  }

  toPersistence() {
    return {
      // id thường do DB tự sinh nên có thể không cần map khi create
      tenant_id: this.tenantId,
      phone_number: this.phoneNumber,
      full_name: this.fullName,
      loyalty_points: this.loyaltyPoints,
    };
  }
}