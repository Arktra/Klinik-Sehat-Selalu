const { User } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: err.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Username, password, and name are required' 
      });
    }

    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const userData = { 
      username, 
      name,
      password: hashedPassword, 
      role: 'patient' // Force patient role for public registrations
    };
    
    const newUser = await User.create(userData);
    const { password: _, ...userWithoutPassword } = newUser.dataValues;
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to register patient',
      error: err.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Username, password, name, and role are required' 
      });
    }

    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const userData = { 
      username, 
      name, 
      password: hashedPassword, 
      role 
    };
    
    const newUser = await User.create(userData);
    const { password: _, ...userWithoutPassword } = newUser.dataValues;
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: err.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData = {};
    const allowedFields = ['username', 'password', 'name', 'role'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    await User.update(updateData, { where: { id: id } });
    const updated = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await User.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.findAll({
      where: { role: role },
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};