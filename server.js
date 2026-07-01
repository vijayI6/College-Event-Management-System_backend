import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}....`);
});