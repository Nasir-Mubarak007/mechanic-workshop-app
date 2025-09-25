const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };


connectDB = async () => {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
   const conn= await mongoose.connect(process.env.MONGO_URI, clientOptions);

    // Wait for connection to be fully established
    if (conn.connection.readyState === 1) {
      console.log('✅ MongoDB connected:', conn.connection.host);

      // Optional ping check (safe version)
      const admin = conn.connection.getClient().db().admin();
      const pingResult = await admin.command({ ping: 1 });
      console.log('📡 Ping successful:', pingResult.ok === 1);
    }
    // await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  } 
  // finally {
  //   // Ensures that the client will close when you finish/error
  //   await mongoose.disconnect();
  // }
}

module.exports = connectDB;