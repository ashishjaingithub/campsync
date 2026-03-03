import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.resolve(process.cwd(), 'logs', 'app.log');
const SMOKE_TEST = path.resolve(process.cwd(), 'scripts', 'smoke_test_api.ts');

function checkHealth() {
    console.log(`[Watchdog] Checking health @ ${new Date().toISOString()}`);

    // 1. Run Smoke Test
    try {
        console.log('[Watchdog] Running API Smoke Test...');
        execSync(`npx tsx ${SMOKE_TEST}`, { stdio: 'inherit' });
        console.log('✅ API Health: OK');
    } catch {
        console.error('❌ API Health: FAILED');
    }

    // 2. Scan Logs for Errors
    if (fs.existsSync(LOG_FILE)) {
        const logs = fs.readFileSync(LOG_FILE, 'utf-8').split('\n').filter(Boolean);
        const last10 = logs.slice(-10);
        const errors = last10.filter(l => l.includes('"level":"ERROR"'));

        if (errors.length > 0) {
            console.warn(`⚠️  Detecting ${errors.length} recent errors in logs!`);
            errors.forEach(err => console.warn(`   -> ${err}`));
        } else {
            console.log('✅ Log Status: Clean');
        }
    }
}

// Run every 5 minutes in a simple loop
console.log('--- CampSync Watchdog Started ---');
checkHealth();
setInterval(checkHealth, 5 * 60 * 1000);
