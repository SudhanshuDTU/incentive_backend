import express from 'express';
import incentiveRoutes from './routes/incentive.routes.js';
import dotenv from 'dotenv';
dotenv.config();
import { pool } from './db/pool.js';
import { runIncentiveJob } from './cron/incentive.cron.js';
import './cron/incentive.cron.js'

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;  

app.use('/api/incentives', incentiveRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("hii");
  if(pool){
    console.log("hi from db");
     
  }
});
