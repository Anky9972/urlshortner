const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    process.exit(1);
}

// Verify JWT from HTTP-only cookie
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.auth_token;

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
        const token = req.cookies?.auth_token;
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
