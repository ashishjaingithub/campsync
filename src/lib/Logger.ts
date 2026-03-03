export const Logger = {
    info(message: string, meta?: unknown) {
        this._log('INFO', message, meta);
    },

    warn(message: string, meta?: unknown) {
        this._log('WARN', message, meta);
    },

    error(message: string, meta?: unknown) {
        this._log('ERROR', message, meta);
    },

    async _log(level: string, message: string, meta?: unknown) {
        const isServer = typeof window === 'undefined';

        if (isServer) {
            try {
                // Dynamically import fs/path only on server to avoid client-side build errors
                const fs = await import('fs');
                const path = await import('path');

                const LOG_DIR = path.resolve(process.cwd(), 'logs');
                const LOG_FILE = path.resolve(LOG_DIR, 'app.log');

                if (!fs.existsSync(LOG_DIR)) {
                    fs.mkdirSync(LOG_DIR);
                }

                const timestamp = new Date().toISOString();
                const logEntry = {
                    timestamp,
                    level,
                    message,
                    meta
                };

                const line = `${JSON.stringify(logEntry)}\n`;
                fs.appendFileSync(LOG_FILE, line);
            } catch {
                // Silent fail for log writing errors to prevent app crashes
            }
        }

        // Always log to console for visibility
        if (level === 'ERROR') {
            console.error(`[${level}] ${message}`, meta || '');
        } else {
            console.log(`[${level}] ${message}`, meta || '');
        }
    }
};
