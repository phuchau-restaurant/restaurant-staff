// backend/controllers/Payment/PaymentController.js

class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payments
     * Create payment for an order (payment is confirmed immediately)
     */
    createInvoice = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const { orderId, paymentMethod } = req.body;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: "Order ID is required",
                });
            }

            if (!paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: "Payment method is required",
                });
            }

            const result = await this.paymentService.createInvoice(orderId, tenantId, paymentMethod);

            return res.status(201).json({
                success: true,
                message: "Payment created successfully",
                data: result,
            });
        } catch (error) {
            console.error("[PaymentController] createInvoice error:", error);

            if (error.message === "Payment already exists for this order") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create payment",
            });
        }
    };

    /**
     * GET /api/payments/:id
     * Get invoice details by payment ID
     */
    getInvoice = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const { id } = req.params;

            const result = await this.paymentService.getInvoiceDetails(id, tenantId);

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error("[PaymentController] getInvoice error:", error);

            if (error.message === "Payment not found") {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get invoice",
            });
        }
    };

    /**
     * GET /api/payments/order/:orderId
     * Get invoice by order ID
     */
    getInvoiceByOrderId = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const { orderId } = req.params;

            const result = await this.paymentService.getInvoiceByOrderId(orderId, tenantId);

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error("[PaymentController] getInvoiceByOrderId error:", error);

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found for this order",
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get invoice",
            });
        }
    };

    /**
     * PATCH /api/payments/:id/confirm
     * Confirm payment
     */
    confirmPayment = async (req, res) => {
        try {
            const tenantId = req.tenantId;
            const { id } = req.params;
            const { paymentMethod } = req.body;

            if (!paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: "Payment method is required",
                });
            }

            const result = await this.paymentService.confirmPayment(id, tenantId, paymentMethod);

            return res.status(200).json({
                success: true,
                message: "Payment confirmed successfully",
                data: result,
            });
        } catch (error) {
            console.error("[PaymentController] confirmPayment error:", error);

            if (error.message === "Payment not found") {
                return res.status(404).json({
                    success: false,
                    message: "Payment not found",
                });
            }

            if (error.message === "Payment already confirmed") {
                return res.status(400).json({
                    success: false,
                    message: "Payment already confirmed",
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || "Failed to confirm payment",
            });
        }
    };
}

export default PaymentController;
