import { pool } from '../db/pool.js';

export const IncentiveModel = {
  async create(data) {
    const { userId, sales, availability_rate, clusterId, from_date, to_date } = data;
    const res = await pool.query(
      `INSERT INTO incentives (userId, sales, availability_rate, clusterId, from_date, to_date, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [userId, sales, availability_rate, clusterId, from_date, to_date]
    );
    return res.rows[0];
  },

  
  async getAll() {
    const res = await pool.query('SELECT * FROM incentives ORDER BY createdAt DESC');
    return res.rows;
  },

  async getById(id) {
    const res = await pool.query('SELECT * FROM incentives WHERE id = $1', [id]);
    return res.rows[0];
  },

  async update(id, data) {
    const { sales, availability_rate, from_date, to_date } = data;
    const res = await pool.query(
      `UPDATE incentives SET sales=$1, availability_rate=$2, from_date=$3, to_date=$4
       WHERE id=$5 RETURNING *`,
      [sales, availability_rate, from_date, to_date, id]
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await pool.query('DELETE FROM incentives WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  },
};
