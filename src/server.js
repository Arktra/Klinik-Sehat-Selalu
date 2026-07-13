const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

(async () => {
  try {
    if (sequelize.ensureDatabaseExists) {
      await sequelize.ensureDatabaseExists();
    }
    await sequelize.authenticate();
    console.log(`✅ Database connected successfully`);
    
    await sequelize.sync({ alter: true });
    console.log("📦 All models synchronized");
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (err) {
    console.error('❌ Unable to start server:', err);
    process.exit(1);
  }
})();
