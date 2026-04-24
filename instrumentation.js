/**
 * instrumentation.js
 * Next.js instrumentation hook — runs once when the server starts.
 * Used to initialize the nightly node-cron scheduler for Ymail fetching.
 * 
 * Fires at 2:30 AM IST = 21:00 UTC daily.
 */

export async function register() {
  // Only run on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const cron = await import('node-cron');
      
      // Schedule: 2:30 AM IST = 21:00 UTC  
      const schedule = '0 21 * * *';  // '30 21 * * *' for 3 AM IST

      cron.default.schedule(schedule, async () => {
        const timestamp = new Date().toISOString();
        console.log(`[YmailCron] Nightly run triggered at ${timestamp}`);
        
        try {
          const res = await fetch(`http://localhost:${process.env.PORT || 3000}/api/cron/ymail`, {
            headers: {
              Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
          });
          const data = await res.json();
          console.log('[YmailCron] Result:', data);
        } catch (err) {
          console.error('[YmailCron] Cron call failed:', err.message);
        }
      });

      console.log(`[YmailCron] Nightly scheduler registered. Runs at 2:30 AM IST (21:00 UTC) daily.`);
    } catch (err) {
      console.warn('[YmailCron] Could not initialize scheduler:', err.message);
    }
  }
}
