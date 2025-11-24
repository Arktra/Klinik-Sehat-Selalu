const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const bodyToLog = { ...req.body };
    if (bodyToLog.password) {
      bodyToLog.password = '[HIDDEN]';
    }
    console.log(`Request Body:`, bodyToLog);
  }
  
  next();
};

const responseTimeLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    
    console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  requestLogger,
  responseTimeLogger
};
