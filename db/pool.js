import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: "postgresql://incentive_db_user:4FfquXC5llaVRsGJVL9vLdRGnncX86tH@dpg-d0vei0p5pdvs738e6svg-a.oregon-postgres.render.com/incentive_db",
  ssl: { rejectUnauthorized: false } 
});

