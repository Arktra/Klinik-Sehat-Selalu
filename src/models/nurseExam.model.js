const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NurseExam = sequelize.define('NurseExam', {
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
  nurse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Nurse ID is required' },
      isInt: { msg: 'Nurse ID must be an integer' }
    }
  },
  bp_systolic: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bp_diastolic: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  spo2: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
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
  tableName: 'nurse_exams',
  timestamps: false
});

module.exports = NurseExam;
