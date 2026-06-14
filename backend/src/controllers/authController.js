const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * POST /api/auth/register
 * Register a new user account.
 */
function register(req, res, next) {
  try {
    const { username, password, email, phone, address } = req.body;
    const db = getDb();

    // Check if username or email already exists
    const existing = db.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).get([username, email]);

    if (existing) {
      return res.status(409).json({
        code: 409,
        message: '用户名或邮箱已被注册',
      });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const result = db.prepare(
      'INSERT INTO users (username, password, email, phone, address) VALUES (?, ?, ?, ?, ?)'
    ).run([username, hashedPassword, email, phone || '', address || '']);

    // Generate token for immediate login
    const token = generateToken({
      id: result.lastInsertRowid,
      username,
    });

    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        token,
        user: {
          id: result.lastInsertRowid,
          username,
          email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const db = getDb();

    const user = db.prepare(
      'SELECT id, username, password, email, phone, address, role FROM users WHERE username = ?'
    ).get([username]);

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    // Don't expose password
    const { password: _, ...userData } = user;

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userData,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 * Return the currently authenticated user's profile.
 */
function getProfile(req, res, next) {
  try {
    const db = getDb();
    const user = db.prepare(
      'SELECT id, username, email, phone, address, role, created_at FROM users WHERE id = ?'
    ).get([req.user.id]);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile };
