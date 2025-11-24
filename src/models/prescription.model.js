const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  diagnosis_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'diagnoses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Diagnosis ID is required' },
      isInt: { msg: 'Diagnosis ID must be an integer' }
    }
  },
  medicine_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dosage: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  instruction: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'done'),
    defaultValue: 'draft'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'prescriptions',
  timestamps: false
});

module.exports = Prescription;
