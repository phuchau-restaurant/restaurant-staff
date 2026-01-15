// frontend/src/services/paymentService.js
import { getTenantId } from "../utils/auth";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/payments`;

const getHeaders = () => ({
    "Content-Type": "application/json",
    "x-tenant-id": getTenantId(),
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

/**
 * Payment Service - API calls for payment/invoice management
 */
const paymentService = {
    /**
     * Create invoice for an order
     * @param {string} orderId - Order ID
     */
    async createInvoice(orderId) {
        try {
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ orderId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create invoice");
            }

            return result;
        } catch (error) {
            console.error("[paymentService] createInvoice error:", error);
            throw error;
        }
    },

    /**
     * Get invoice by payment ID
     * @param {string} paymentId - Payment ID
     */
    async getInvoice(paymentId) {
        try {
            const response = await fetch(`${BASE_URL}/${paymentId}`, {
                headers: getHeaders(),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to get invoice");
            }

            return result;
        } catch (error) {
            console.error("[paymentService] getInvoice error:", error);
            throw error;
        }
    },

    /**
     * Get invoice by order ID
     * @param {string} orderId - Order ID
     */
    async getInvoiceByOrderId(orderId) {
        try {
            const response = await fetch(`${BASE_URL}/order/${orderId}`, {
                headers: getHeaders(),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to get invoice");
            }

            return result;
        } catch (error) {
            console.error("[paymentService] getInvoiceByOrderId error:", error);
            throw error;
        }
    },

    /**
     * Create payment (when confirming payment)
     * @param {string} orderId - Order ID
     * @param {string} paymentMethod - 'Cash' | 'Card' | 'E-Wallet'
     */
    async createPayment(orderId, paymentMethod) {
        try {
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ orderId, paymentMethod }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create payment");
            }

            return result;
        } catch (error) {
            console.error("[paymentService] createPayment error:", error);
            throw error;
        }
    },
};

export default paymentService;
