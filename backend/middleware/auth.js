const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

module.exports = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET);
  //   req.user = decoded;  // ✅ attaches user info
  //   next();
  // } catch (err) {
  //   return res.status(403).json({ message: 'Invalid token or expired token' });
  // }
  try {
  // ✅ 3️⃣ Attach user to request (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
