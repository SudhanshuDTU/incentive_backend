import cron from 'node-cron';
import fetch from 'node-fetch';
import { IncentiveModel } from '../models/incentive.model.js';
import dotenv from 'dotenv';
dotenv.config();
const TEAM_API = 'https://gg-nodejs.onrender.com/api/teams/';
const CLUSTER_API = 'https://gg-nodejs.onrender.com/api/clusters/';
const NEW_RELIC_API = 'https://api.newrelic.com/graphql';

const NEW_RELIC_HEADERS = {
  'Content-Type': 'application/json',
  'API-Key': `${process.env.NEW_RELIC_API_KEY}`
};


export const runIncentiveJob =  async (authToken) => {
  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
  try {
    console.log('Starting weekly incentive job...');

    // 1. Fetch all team members
    const teamRes = await fetch(TEAM_API, { headers: AUTH_HEADERS });
    const teams = await teamRes.json();

    // 2. Fetch all clusters
    const clusterRes = await fetch(CLUSTER_API, { headers: AUTH_HEADERS });
    const clusters = await clusterRes.json();

    // 3. Map cluster_id to cluster_name
    const clusterMap = {};
    clusters.forEach(c => {
      clusterMap[c.cluster_id] = c.cluster_name;
    });

    // grab cluster_id from cluster_name
    const reverseClusterMap = {};
    for (const [id, name] of Object.entries(clusterMap)) {
     reverseClusterMap[name] = id;
    }

    // 4. Map cluster_name to user_ids
    const clusterUsers = {};
    teams.forEach(user => {
      user.cluster_assigned.forEach(cid => {
        const name = clusterMap[cid];
        if (!name) return;
        if (!clusterUsers[name]) clusterUsers[name] = [];
        clusterUsers[name].push(user.user_id);
      });
    });

    // count machine in each cluster
    const machineCountMap = {};
    clusters.forEach(c=>{
      machineCountMap[c.cluster_name] = c.machines?.length || 0;
    })

    // 5. Fetch Sales data from New Relic
    const salesQuery = {
      query: `{
        actor {
          account(id: 4142841) {
            nrql(query: "SELECT sum(product_price) FROM \`monitoring:gograb\` WHERE eventName='billed_item' SINCE 7 days ago limit max FACET cluster_name") {
              results
            }
          }
        }
      }`
    };

    const salesRes = await fetch(NEW_RELIC_API, {
      method: 'POST',
      headers: NEW_RELIC_HEADERS,
      body: JSON.stringify(salesQuery)
    });

    const salesResults = (await salesRes.json()).data.actor.account.nrql.results;

    // 6. Fetch Availability data from New Relic
    const availabilityQuery = {
      query: `{
        actor {
          account(id: 4142841) {
            nrql(query: "SELECT average(availability) * 100 FROM \`monitoring:gograb\` WHERE eventName='machine_info' SINCE 7 days ago limit max FACET cluster_name") {
              results
            }
          }
        }
      }`
    };

    const availRes = await fetch(NEW_RELIC_API, {
      method: 'POST',
      headers: NEW_RELIC_HEADERS,
      body: JSON.stringify(availabilityQuery)
    });

    const availabilityResults = (await availRes.json()).data.actor.account.nrql.results;

    // 7. Combine sales + availability by cluster_name
    const availabilityMap = {};
    availabilityResults.forEach(entry => {
      availabilityMap[entry.cluster_name] = entry["average.availability*100"];
    });

    // 8. Insert into DB
    for (const entry of salesResults) {
      const clusterName = entry.cluster_name;
      const sales = entry["sum.product_price"] || 0;
      const availability_rate = availabilityMap[clusterName] || 0;
      const userIds = clusterUsers[clusterName] || [];
    
      if (userIds.length === 0) continue; // skip unlinked clusters
      const machineCount = machineCountMap[clusterName] || 1;
      const salesPerMachine = sales / machineCount;
      await IncentiveModel.create({
        userId: userIds, 
        sales,
        availability_rate,
        clusterId: reverseClusterMap[clusterName],
        from_date: new Date(new Date().setDate(new Date().getDate() - 7)),
        to_date: new Date(),
        salesPerMachine
      });
    }

    console.log('Incentive job completed.');
  } catch (err) {
    console.error('Cron job failed:', err);
  }
};
// Cron Job - Every Sunday at 1:00 PM
export const scheduleIncentiveJob = (token) => {
  cron.schedule('0 13 * * 0', async () => {
    console.log('🕐 Running incentive job via cron...');
    await runIncentiveJob(token);
  });
};

  