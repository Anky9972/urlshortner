const UAParser = require('ua-parser-js');

// Common bot signatures
const BOT_REGEX = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|google-structural|dummy|mediapartners|adsbot|googlebot|bingbot|yandex|baiduspider|twitterbot|slackbot|telegram|discordbot/i;

const botDetectionMiddleware = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';

    // Check regex
    let isBot = BOT_REGEX.test(userAgent);

    // Check libraries (often used by scripts)
    if (userAgent.includes('axios') || userAgent.includes('curl') || userAgent.includes('python-requests') || userAgent.includes('postman')) {
        isBot = true;
    }

    // Use UA Parser as backup
    if (!isBot) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        if (result.device.type === 'bot' || result.browser.name === 'Bot') {
            isBot = true;
        }
    }

    req.isBot = isBot;
    next();
};

module.exports = botDetectionMiddleware;
