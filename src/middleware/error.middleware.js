export const errorMiddleware = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");

    return res.status(400).json({ message });
  }
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Внутрішня помилка сервера",
    error: err.data || null,
  });
};

export const createError = (status, message, data) => {
  const error = new Error(message);
  error.status = status;
  if (data !== undefined) {
    error.data = data;
  }
  return error;
};
