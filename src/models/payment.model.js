const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  cashier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: { msg: 'Cashier ID is required' },
      isInt: { msg: 'Cashier ID must be an integer' }
    }
  },
  doctor_fee: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  treatment_fee: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  drug_fee: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.doctor_fee + this.treatment_fee + this.drug_fee;
    }
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'paid'),
    defaultValue: 'unpaid'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments',
  timestamps: false
});

module.exports = Payment;
