const db = require('../../models');
const UserService = require('../../services/userService');
const userService = new UserService(db);

async function isAdmin(req, res, next) {
  try {
    const { id: userId } = req.user;
    const user = await userService.getOneUser(userId);
    if (!user || user.RoleId !== 1) {
      return res.status(403).json({ error: 'Access denied. Only logged in Admin can use this page.'});
    }
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Failed to authenticate as admin.' });
  }
}

module.exports = isAdmin;