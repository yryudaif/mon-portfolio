const jwt = require('jsonwebtoken');

function verifyAdminToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      return next();
    } else {
      return res.redirect('/admin/login');
    }
  } catch (err) {
    return res.redirect('/admin/login');
  }
}

module.exports = verifyAdminToken;