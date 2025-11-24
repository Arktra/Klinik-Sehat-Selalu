const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  sanitizeMiddleware
};
