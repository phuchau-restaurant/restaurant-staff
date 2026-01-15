// backend/services/Payment/PaymentService.js
import { supabase } from "../../configs/database.js";

class PaymentService {
    constructor(paymentRepository, restaurantInfoRepository) {
        this.paymentRepo = paymentRepository;
        this.restaurantInfoRepo = restaurantInfoRepository;
    }

    /**
     * Create invoice for an order
     * @param {string} orderId - Order ID
     * @param {string} tenantId - Tenant ID
     * @returns {Object} Payment record with order details
     */
    async createInvoice(orderId, tenantId, paymentMethod = 'Cash') {
        if (!orderId) throw new Error("Order ID is required");
        if (!tenantId) throw new Error("Tenant ID is required");

        // Validate payment method
        const validMethods = ['Cash', 'Card', 'E-Wallet'];
        if (!validMethods.includes(paymentMethod)) {
            throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
        }

        // Check if payment already exists for this order
        const existingPayment = await this.paymentRepo.getByOrderId(orderId, tenantId);
        if (existingPayment) {
            throw new Error("Payment already exists for this order");
        }

        // Get order with details
        const order = await this.getOrderWithDetails(orderId, tenantId);
        if (!order) throw new Error("Order not found");

        // Get restaurant info for tax/discount settings
        const restaurantInfo = await this.restaurantInfoRepo.getByTenantId(tenantId);

        // Calculate invoice amounts
        const invoice = this.calculateInvoice(order.items, restaurantInfo);

        // Create payment record (already paid - no is_paid field)
        const paymentData = {
            tenantId,
            orderId,
            paymentMethod,
            paidAt: new Date().toISOString(),
            ...invoice,
        };

        const payment = await this.paymentRepo.create(paymentData);

        // Update order status to 'Paid'
        await this.updateOrderStatus(orderId, tenantId, 'Paid');

        return {
            payment,
            order,
            restaurantInfo,
        };
    }

    /**
     * Get invoice details by payment ID
     */
    async getInvoiceDetails(paymentId, tenantId) {
        const payment = await this.paymentRepo.getById(paymentId, tenantId);
        if (!payment) throw new Error("Payment not found");

        const order = await this.getOrderWithDetails(payment.orderId, tenantId);
        const restaurantInfo = await this.restaurantInfoRepo.getByTenantId(tenantId);

        return {
            payment,
            order,
            restaurantInfo,
        };
    }

    /**
     * Get invoice by order ID
     */
    async getInvoiceByOrderId(orderId, tenantId) {
        const payment = await this.paymentRepo.getByOrderId(orderId, tenantId);
        if (!payment) throw new Error("Payment not found for this order");

        return await this.getInvoiceDetails(payment.id, tenantId);
    }

    /**
     * Calculate invoice amounts
     * Formula: Discount BEFORE tax
     * subtotal -> discount -> tax + service -> total
     * Includes modifier prices
     */
    calculateInvoice(items, restaurantInfo) {
        // Calculate subtotal including modifiers
        const subtotal = items.reduce((sum, item) => {
            const basePrice = parseFloat(item.unitPrice || item.unit_price) || 0;
            const quantity = parseInt(item.quantity) || 1;

            // Calculate modifier total for this item
            const modifierTotal = (item.modifiers || []).reduce((modSum, mod) => {
                return modSum + (parseFloat(mod.price) || 0);
            }, 0);

            // (basePrice + modifierTotal) * quantity
            return sum + (basePrice + modifierTotal) * quantity;
        }, 0);

        // Get rates from restaurant info (with defaults)
        const taxRate = restaurantInfo?.taxRate || 10;
        const serviceChargeRate = restaurantInfo?.serviceCharge || 0;
        const discountRules = restaurantInfo?.discountRules || [];

        // Find applicable discount
        const applicableRule = discountRules
            .filter(rule => subtotal >= (rule.min_order || 0))
            .sort((a, b) => b.min_order - a.min_order)[0];

        const discountPercent = applicableRule?.discount_percent || 0;

        // Calculate amounts (Discount BEFORE tax)
        const discountAmount = subtotal * (discountPercent / 100);
        const afterDiscount = subtotal - discountAmount;

        const taxAmount = afterDiscount * (taxRate / 100);
        const serviceChargeAmount = afterDiscount * (serviceChargeRate / 100);

        const amount = afterDiscount + taxAmount + serviceChargeAmount;

        return {
            subtotal: Math.round(subtotal),
            taxRate,
            taxAmount: Math.round(taxAmount),
            serviceChargeRate,
            serviceChargeAmount: Math.round(serviceChargeAmount),
            discountPercent,
            discountAmount: Math.round(discountAmount),
            amount: Math.round(amount),
        };
    }

    /**
     * Get order with its details and modifiers
     */
    async getOrderWithDetails(orderId, tenantId) {
        // Get order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("tenant_id", tenantId)
            .single();

        if (orderError && orderError.code !== "PGRST116") {
            throw new Error(`Failed to get order: ${orderError.message}`);
        }
        if (!order) return null;

        // Get order details with dish info
        const { data: items, error: itemsError } = await supabase
            .from("order_details")
            .select(`
                *,
                dishes:dish_id (
                    id,
                    name,
                    price,
                    image_url
                )
            `)
            .eq("order_id", orderId)
            .eq("tenant_id", tenantId);

        if (itemsError) {
            throw new Error(`Failed to get order items: ${itemsError.message}`);
        }

        // Get modifiers for all order details with price from modifier_options
        const itemIds = (items || []).map(item => item.id);
        let modifiersMap = {};

        if (itemIds.length > 0) {
            const { data: modifiers, error: modifiersError } = await supabase
                .from("order_item_modifiers")
                .select(`
                    *,
                    modifier_options:modifier_option_id (
                        id,
                        name,
                        price_adjustment
                    )
                `)
                .in("order_detail_id", itemIds);

            if (!modifiersError && modifiers) {
                // Group modifiers by order_detail_id
                modifiersMap = modifiers.reduce((acc, mod) => {
                    const detailId = mod.order_detail_id;
                    if (!acc[detailId]) acc[detailId] = [];
                    acc[detailId].push({
                        id: mod.id,
                        optionName: mod.option_name,
                        price: parseFloat(mod.modifier_options?.price_adjustment) || 0,
                    });
                    return acc;
                }, {});
            }
        }

        // Attach modifiers to each item and normalize field names for frontend
        const itemsWithModifiers = (items || []).map(item => ({
            ...item,
            // Add normalized fields for frontend compatibility
            name: item.dishes?.name || 'Món ăn',
            unitPrice: parseFloat(item.unit_price) || 0,
            modifiers: modifiersMap[item.id] || [],
        }));

        // Get table info
        const { data: table } = await supabase
            .from("tables")
            .select("id, table_number")
            .eq("id", order.table_id)
            .single();

        return {
            ...order,
            items: itemsWithModifiers,
            table,
        };
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, tenantId, status) {
        const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", orderId)
            .eq("tenant_id", tenantId);

        if (error) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    }
}

export default PaymentService;
