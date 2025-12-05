import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';
import { healthRouter } from './routes/health';
import { facilitiesRouter } from './routes/facilities';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Load environment variables
dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/health', healthRouter);
app.use('/api/facilities', facilitiesRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'MyNaga Gabay API',
        version: '0.1.0',
        status: 'running',
        endpoints: ['/api/chat', '/api/health', '/api/facilities'],
    });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🏥 MyNaga Gabay API running on http://localhost:${PORT}`);
});

export default app;
