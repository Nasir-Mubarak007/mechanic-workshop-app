const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';
const JWT_EXPIRES_IN = '5d';

// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ username });
//     if (!user || !user.isActive) {
//       console.log('❌ No user found for username:', username);
//       return res.status(401).json({ message: 'Invalid credentials or inactive user' });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.log('❌ Password mismatch for user:', username);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role, username: user.username },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     // Send as HTTP-only cookie
//     res
//       .cookie('token', token, {
//         httpOnly: true,
//         secure: true, // set to true in production with HTTPS
//         sameSite: 'none', // or 'lax' if same-site
//         maxAge: 5 * 24 * 60 * 60 * 1000 // 7 days
//       })
//       .json({
//         message: 'Login successful',
//         user: {
//           _id: user._id,
//           name: user.name,
//           role: user.role,
//           isActive: user.isActive
//         }
//       });
//   } catch (err) {
//     console.error('Login failed:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1️⃣ Find the user
    const user = await User.findOne({ username });
    if (!user || !user.isActive) {
      console.log('❌ No user found for username:', username);
      return res.status(401).json({ message: 'Invalid credentials or inactive user' });
    }

    // 2️⃣ Check password (await is critical!)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', username);
      return res.status(401).json({ message: 'Wrong password!' });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 4️⃣ Send secure HTTP-only cookie
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true on Render
        sameSite: 'none', // required for cross-site (Vercel → Render)
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
      })
      .json({
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.logout = (req, res) => {
  // Clear the cookie
  console.log('Logging out user:', req.user ? req.user.username : 'Unknown user');
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none', // or 'none' if using cross-origin
    secure: true, // set to true in production with HTTPS
    // maxAge: 0, // Optional: set maxAge to 0 to immediately expire the cookie
    // Uncomment the line below if you want to set secure cookies in production
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
}

exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      // isAdmin: user.role === 'admin',
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  next();
};
      