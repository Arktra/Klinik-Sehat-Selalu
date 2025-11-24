const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json({
      message: 'Validation error',
      errors: errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Duplicate entry',
      field: err.errors[0].path
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: 'Invalid reference to related record'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
