const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  queue_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'queues',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Queue ID is required' },
      isInt: { msg: 'Queue ID must be an integer' }
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Doctor ID is required' },
      isInt: { msg: 'Doctor ID must be an integer' }
    }
  },
  diagnosis_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'diagnoses',
  timestamps: false
});

module.exports = Diagnosis;
