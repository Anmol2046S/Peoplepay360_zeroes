async function run() {
  try {
    console.log("Fetching token...");
    const tokenRes = await fetch('http://localhost:3002/api/v1/dev/token');
    const tokenData = await tokenRes.json();
    console.log("Token Response:", tokenRes.status, tokenData);

    if (tokenData.token) {
      console.log("Fetching metrics...");
      const metricsRes = await fetch('http://localhost:3002/api/v1/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`
        }
      });
      const metricsData = await metricsRes.json();
      console.log("Metrics Response:", metricsRes.status, metricsData);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
run();
