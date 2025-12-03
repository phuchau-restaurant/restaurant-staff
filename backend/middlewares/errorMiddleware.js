// backend/middlewares/errorMiddleware.js

export const errorMiddleware = (err, req, res, next) => {
  console.error("Error Log:", err); // Log ra console server
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};