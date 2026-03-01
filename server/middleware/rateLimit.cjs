const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 Hour
const DEFAULT_LIMIT = 1000; // 1000 requests per hour

// In-memory store: { ip: { count: 0, resetTime: Date } }
// Note: In production with multiple clusters, use Redis.
const hits = new Map();

const cleanup = () => {
    const now = Date.now();
    for (const [key, value] of hits.entries()) {
        if (value.resetTime < now) {
            hits.delete(key);
        }
    }
};

// Cleanup every 10 minutes
setInterval(cleanup, 10 * 60 * 1000);

const rateLimitMiddleware = (req, res, next) => {
    // Identify user by IP or API Key (if present)
    const key = req.apiKey?.id || req.ip;

    const now = Date.now();

    if (!hits.has(key)) {
        hits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
        const data = hits.get(key);

        if (now > data.resetTime) {
            // Window expired, reset
            hits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        } else {
            // Increment
            data.count++;

            // Check limit
            // TODO: Fetch user specific limit from DB if authenticated
            const limit = req.apiKey?.rateLimit || DEFAULT_LIMIT;

            if (data.count > limit) {
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil((data.resetTime - now) / 1000)
                });
            }
        }
    }

    next();
};

module.exports = rateLimitMiddleware;
