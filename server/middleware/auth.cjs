const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    process.exit(1);
}

// Extract token from Authorization header or cookie
const extractToken = (req) => {
    // 1. Check Authorization: Bearer <token> header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    // 2. Fall back to HTTP-only cookie
    return req.cookies?.auth_token || null;
};

// Verify JWT from Bearer header or HTTP-only cookie
const authMiddleware = (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
    } catch {
        // Ignore invalid tokens for optional auth
    }
    next();
};

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };
