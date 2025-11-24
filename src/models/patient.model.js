const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    validate: {
      notNull: {
        msg: 'User ID is required'
      },
      isInt: {
        msg: 'User ID must be an integer'
      }
    }
  },
  nik: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'patients',
  timestamps: false
});

module.exports = Patient;
