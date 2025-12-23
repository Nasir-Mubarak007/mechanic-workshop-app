const User = require('../models/User');
const bcrypt = require('bcryptjs');


// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    // if (users.length === 0) {
    //   return res.status(404).json({ message: 'No users found' });
    // }
    res.json(users);
  } catch (err) {
    console.error('❌ getUsers failed:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// add new user, only admin can add new user
exports.addUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update user, only admin can update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// exports.updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(user);
//     return res.status(200).json({ message: 'User updated successfully', user });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }

// Delete user
exports.deleteUser = async (req, res) => {
  console.warn(`Deleting user with ID: ${req.params.id}`);
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by name
exports.getUserByName = async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role });
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for this role' });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// deactivate or activate user
exports.toggleUserStatus = async (req, res) => {
  // Find the user by ID
  console.log(`Toggling status for user with ID: ${req.params.id}`);
  
  const user = await User.findById(req.params.id);
  try {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();
    // Return the updated user
    return res.status(200).json({ message: 'User status updated successfully', user });
    // res.json({ message: 'User Activation status changed successfully', user });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// // activate user
// exports.activateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json({ message: 'User activated successfully', user });

//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

