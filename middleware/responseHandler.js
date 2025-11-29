export const AsyncError = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // console.log(err)
    res.status(statusCode).json({ message, success: false });
  });
};

export const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

