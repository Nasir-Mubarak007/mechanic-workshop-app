const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ✅ Use this **at the very top**, before any routes
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://vicky-auto-store.vercel.app'
  ],
  credentials: true,
};

// Use this BEFORE all routes
app.use(cors(corsOptions));


// ✅ Middleware to parse JSON and cookies
// This is necessary for handling JSON requests and cookies in the backend
app.use(express.json());
app.use(cookieParser());

app.options(/^\/.*$/, cors(corsOptions));



// ✅ Importing and using the auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// ✅ Importing and using the user routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// ✅ Importing and using the service routes
const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

// ✅ Importing and using the inventory routes
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);


const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedule', scheduleRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
