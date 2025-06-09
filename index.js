import express from 'express';
import incentiveRoutes from './routes/incentive.routes.js';
import dotenv from 'dotenv';
dotenv.config();
import { pool } from './db/pool.js';
import fetch from 'node-fetch';
import { scheduleIncentiveJob } from './cron/incentive.cron.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000; 

const getAuthToken = async () => {
  try {
    const loginRes = await fetch('https://gg-nodejs.onrender.com/api/user-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'sudhanshujha2717@gmail.com' })
    });

    const loginData = await loginRes.json();
    if (loginData.success && loginData.token) {
      console.log('✅ Auth token fetched successfully');
      return loginData.token;
    } else {
      throw new Error('❌ Failed to get auth token');
    }
  } catch (err) {
    console.error('Error during login:', err.message);
    process.exit(1);
  }
};

app.use('/api/incentives', incentiveRoutes);

const init = async () => {
  const token = await getAuthToken();
  console.log("starting cron,after getting auth_token");
  scheduleIncentiveJob(token); // cron starts only after token is fetched
}; 
init()
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("hii");
  if(pool){
    console.log("hi from db");
     
  }
});
