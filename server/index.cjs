const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const authRoutes = require('./routes/auth.cjs');
const urlRoutes = require('./routes/urls.cjs');
const clickRoutes = require('./routes/clicks.cjs');
const folderRoutes = require('./routes/folders.cjs');
const tagRoutes = require('./routes/tags.cjs');
const userRoutes = require('./routes/users.cjs');
const apiKeyRoutes = require('./routes/apiKeys.cjs');
const webhookRoutes = require('./routes/webhooks.cjs');
const freeUrlRoutes = require('./routes/freeUrls.cjs');
const notificationRoutes = require('./routes/notifications.cjs');
const pixelRoutes = require('./routes/pixels.cjs');
const splitRoutes = require('./routes/splits.cjs');
const healthRoutes = require('./routes/health.cjs');
const teamRoutes = require('./routes/teams.cjs');
const domainRoutes = require('./routes/domains.cjs');
const auditRoutes = require('./routes/audit.cjs');
const analyticsAiRoutes = require('./routes/analytics-ai.cjs');
const linktreeRoutes = require('./routes/linktrees.cjs');
const roomRoutes = require('./routes/rooms.cjs');

const rateLimitMiddleware = require('./middleware/rateLimit.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimitMiddleware); // Apply global rate limit

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/clicks', clickRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/free-urls', freeUrlRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pixels', pixelRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/link-health', healthRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics-ai', analyticsAiRoutes);
app.use('/api/linktrees', linktreeRoutes);
app.use('/api/rooms', roomRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 TrimLink API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
