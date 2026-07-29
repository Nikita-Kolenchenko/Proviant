export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Внутрішня помилка сервера",
    error: err.data || null,
  });
};
