const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // ✅ attaches user info
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token or expired token' });
  }
};
    //     setUsers(res.data);
    //   } catch (error) {
    //     console.error('Failed to fetch users:', error);
    //   }
    // };
  
    // useEffect(() => {
    //   if (isAdmin) loadUsers();
    // }, [isAdmin]);