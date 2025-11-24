const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Patient ID is required' },
      isInt: { msg: 'Patient ID must be an integer' }
    }
  },
  nurse_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      isInt: { msg: 'Nurse ID must be an integer' }
    }
  },
  complaint: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  previous_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  registration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'registrations',
  timestamps: false
});

module.exports = Registration;
