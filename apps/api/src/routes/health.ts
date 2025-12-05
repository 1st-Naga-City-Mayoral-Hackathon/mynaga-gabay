import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

/**
 * GET /api/health/readiness
 * Readiness check for deployments
 */
router.get('/readiness', async (req, res) => {
    const checks = {
        claude: !!process.env.CLAUDE_API_KEY,
        database: !!process.env.DATABASE_URL,
    };

    const allReady = Object.values(checks).every(Boolean);

    res.status(allReady ? 200 : 503).json({
        ready: allReady,
        checks,
    });
});

export { router as healthRouter };
