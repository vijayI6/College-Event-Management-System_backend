import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import apiRouter from './Routes/Routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


connectDB();

app.use('/api', apiRouter);

app.get('/', (req, res) => {
    res.send('College Event Management System API is running...');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}....`);
});