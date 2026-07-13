const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sanitizeMiddleware } = require('./utils/sanitize');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(compression());

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      return allowed.trim().toLowerCase() === origin.trim().toLowerCase();
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX) || 100;

const limiter = rateLimit({
  windowMs: rateLimitWindow,
  max: rateLimitMax,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeMiddleware);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Klinik Sehat Selalu API is running!', 
    timestamp: new Date(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    endpoints: {
      users: '/api/users',
      patients: '/api/patients',
      registrations: '/api/registrations',
      queues: '/api/queues',
      nurseExams: '/api/nurse-exams',
      diagnoses: '/api/diagnoses',
      prescriptions: '/api/prescriptions',
      payments: '/api/payments',
      health: '/api/health'
    },
    documentation: 'See README.md and API_DOCUMENTATION.md for detailed information'
  });
});

const userRoutes = require('./routes/user.routes');
const patientRoutes = require('./routes/patient.routes');
const registrationRoutes = require('./routes/registration.routes');
const queueRoutes = require('./routes/queue.routes');
const nurseExamRoutes = require('./routes/nurseExam.routes');
const diagnosisRoutes = require('./routes/diagnosis.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const paymentRoutes = require('./routes/payment.routes');

app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/nurse-exams', nurseExamRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);
app.use(notFoundHandler);

module.exports = app;