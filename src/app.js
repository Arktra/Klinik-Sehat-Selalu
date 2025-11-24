const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

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

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT || 100,
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

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;