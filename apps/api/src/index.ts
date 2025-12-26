import './env';

import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';
import { healthRouter } from './routes/health';
import { facilitiesRouter } from './routes/facilities';
import { ttsRouter } from './routes/tts';
import { routingRouter } from './routes/routing';
import { doctorsRouter } from './routes/doctors';
import { appointmentsRouter } from './routes/appointments';
import { medicationsRouter } from './routes/medications';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { setupSwagger } from './config/swagger';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(requestLogger);

// Setup Swagger API documentation
setupSwagger(app);

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/health', healthRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/route', routingRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/medications', medicationsRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'MyNaga Gabay API',
        version: '0.1.0',
        status: 'running',
        documentation: '/api/docs',
        endpoints: [
            '/api/chat',
            '/api/health',
            '/api/facilities',
            '/api/tts',
            '/api/route',
            '/api/doctors',
            '/api/appointments',
            '/api/medications',
        ],
    });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🏥 MyNaga Gabay API running on http://localhost:${PORT}`);
});

export default app;
