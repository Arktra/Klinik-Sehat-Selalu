const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Queue = sequelize.define('Queue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  registration_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'registrations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Registration ID is required' },
      isInt: { msg: 'Registration ID must be an integer' }
    }
  },
  queue_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('waiting', 'nurse', 'doctor', 'cashier', 'done'),
    defaultValue: 'waiting'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'queues',
  timestamps: false
});

module.exports = Queue;
