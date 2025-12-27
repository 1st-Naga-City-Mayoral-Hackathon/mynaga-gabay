/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation at /api/docs
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'MyNaga Gabay API',
      version: '0.1.0',
      description: `
Health assistant API for Naga City, Philippines.

## Features
- **Chat**: AI-powered health assistant (supports Bikol, Filipino, English)
- **Facilities**: Search health facilities with geo-based queries
- **Doctors**: Doctor listing and availability
- **Appointments**: Booking system with authentication
- **TTS**: Text-to-speech for Bikol language
- **Medications**: Medication tracking and reminders

## Authentication
Most endpoints are public. Authenticated endpoints require:
- \`X-Internal-Key\` header for internal service calls
- \`X-User-Id\` header for user-specific operations

## Languages
- \`en\` - English
- \`fil\` - Filipino/Tagalog
- \`bcl\` - Bikol (Central Bikolano)
      `,
      contact: {
        name: 'MyNaga Gabay Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Chat', description: 'AI health assistant chat' },
      { name: 'Health', description: 'Service health checks' },
      { name: 'Facilities', description: 'Health facilities search' },
      { name: 'Doctors', description: 'Doctor listing and availability' },
      { name: 'Appointments', description: 'Appointment booking (requires auth)' },
      { name: 'TTS', description: 'Text-to-speech service' },
      { name: 'Routing', description: 'Directions and navigation' },
      { name: 'Medications', description: 'Medication tracking (requires auth)' },
    ],
    components: {
      securitySchemes: {
        InternalKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Internal-Key',
          description: 'Internal service authentication key',
        },
        UserId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-User-Id',
          description: 'Authenticated user ID',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        ChatRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: 'User message or health question',
              example: 'Ano ang gamot sa sakit ng ulo?',
            },
            language: {
              type: 'string',
              enum: ['en', 'fil', 'bcl'],
              description: 'Preferred language',
              example: 'fil',
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for conversation context',
            },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            reply: { type: 'string', description: 'Assistant response' },
            language: { type: 'string', enum: ['en', 'fil', 'bcl'] },
            sessionId: { type: 'string' },
            model: { type: 'string' },
          },
        },
        FacilityCard: {
          type: 'object',
          properties: {
            cardType: { type: 'string', example: 'facility' },
            facilityId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Bicol Medical Center' },
            address: { type: 'string' },
            hours: { type: 'string', example: '24/7' },
            phone: { type: 'string' },
            services: { type: 'array', items: { type: 'string' } },
            distanceMeters: { type: 'number' },
            lat: { type: 'number' },
            lng: { type: 'number' },
            facilityType: {
              type: 'string',
              enum: ['hospital', 'health_center', 'clinic', 'pharmacy', 'barangay_health_station'],
            },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            specialization: { type: 'string' },
            facilityId: { type: 'string', format: 'uuid' },
            facilityName: { type: 'string' },
            photoUrl: { type: 'string' },
            consultationFee: { type: 'number' },
          },
        },
        ScheduleCard: {
          type: 'object',
          properties: {
            cardType: { type: 'string', example: 'schedule' },
            facilityId: { type: 'string', format: 'uuid' },
            facilityName: { type: 'string' },
            doctorId: { type: 'string', format: 'uuid' },
            doctorName: { type: 'string' },
            humanSummary: { type: 'string' },
            slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  slotId: { type: 'string' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  available: { type: 'boolean' },
                },
              },
            },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            doctorId: { type: 'string', format: 'uuid' },
            doctorName: { type: 'string' },
            facilityId: { type: 'string', format: 'uuid' },
            facilityName: { type: 'string' },
            patientName: { type: 'string' },
            patientPhone: { type: 'string' },
            slotStart: { type: 'string', format: 'date-time' },
            slotEnd: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
            },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateAppointmentRequest: {
          type: 'object',
          required: ['doctorId', 'facilityId', 'slotStart', 'slotEnd', 'patientName'],
          properties: {
            doctorId: { type: 'string', format: 'uuid' },
            facilityId: { type: 'string', format: 'uuid' },
            slotStart: { type: 'string', format: 'date-time' },
            slotEnd: { type: 'string', format: 'date-time' },
            patientName: { type: 'string' },
            patientPhone: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        BookingCard: {
          type: 'object',
          properties: {
            cardType: { type: 'string', example: 'booking' },
            doctorId: { type: 'string', format: 'uuid' },
            doctorName: { type: 'string' },
            facilityId: { type: 'string', format: 'uuid' },
            facilityName: { type: 'string' },
            selectedSlot: {
              type: 'object',
              properties: {
                slotId: { type: 'string' },
                startTime: { type: 'string', format: 'date-time' },
                endTime: { type: 'string', format: 'date-time' },
                available: { type: 'boolean' },
              },
            },
            status: { type: 'string', enum: ['booked', 'cancelled'] },
            appointmentId: { type: 'string', format: 'uuid' },
          },
        },
        RouteCard: {
          type: 'object',
          properties: {
            cardType: { type: 'string', example: 'route' },
            from: {
              type: 'object',
              properties: { lat: { type: 'number' }, lng: { type: 'number' } },
            },
            to: {
              type: 'object',
              properties: { lat: { type: 'number' }, lng: { type: 'number' } },
            },
            distanceMeters: { type: 'number' },
            durationSeconds: { type: 'number' },
            profile: { type: 'string', enum: ['driving', 'walking', 'cycling'] },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  instruction: { type: 'string' },
                  distanceMeters: { type: 'number' },
                  durationSeconds: { type: 'number' },
                },
              },
            },
          },
        },
        TTSRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: {
              type: 'string',
              description: 'Text to convert to speech',
              maxLength: 5000,
            },
            language: {
              type: 'string',
              enum: ['bcl', 'fil', 'eng'],
              default: 'bcl',
            },
          },
        },
        MedicationCourse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            medicationName: { type: 'string' },
            strength: { type: 'string' },
            form: { type: 'string' },
            instructions: { type: 'string' },
            scheduleTimes: { type: 'array', items: { type: 'string' } },
            timezone: { type: 'string', default: 'Asia/Manila' },
            prn: { type: 'boolean' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
          },
        },
        MedicationReminder: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            courseId: { type: 'string', format: 'uuid' },
            enabled: { type: 'boolean' },
            timesOfDay: { type: 'array', items: { type: 'string' } },
            timezone: { type: 'string' },
            channel: { type: 'string' },
          },
        },
        IntakeEvent: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            courseId: { type: 'string', format: 'uuid' },
            scheduledAt: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['taken', 'missed', 'skipped'] },
            takenAt: { type: 'string', format: 'date-time' },
            source: { type: 'string', enum: ['web', 'mobile'] },
          },
        },
      },
    },
    paths: {
      // Chat endpoints
      '/api/chat': {
        post: {
          tags: ['Chat'],
          summary: 'Send message to health assistant',
          description: 'Main chat endpoint for the Gabay health assistant. Supports Bikol, Filipino, and English.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/ChatResponse' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: 'Invalid input' },
            503: { description: 'Chat service unavailable' },
          },
        },
      },
      '/api/chat/health': {
        get: {
          tags: ['Chat'],
          summary: 'Check chat service health',
          responses: {
            200: { description: 'Service health status' },
          },
        },
      },
      // Health endpoints
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Basic health check',
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/health/readiness': {
        get: {
          tags: ['Health'],
          summary: 'Readiness check for deployments',
          responses: {
            200: { description: 'Service is ready' },
            503: { description: 'Service is not ready' },
          },
        },
      },
      // Facilities endpoints
      '/api/facilities': {
        get: {
          tags: ['Facilities'],
          summary: 'List health facilities',
          description: 'Search health facilities with optional geo-based filtering',
          parameters: [
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['hospital', 'health_center', 'clinic', 'pharmacy', 'barangay_health_station'],
              },
              description: 'Filter by facility type',
            },
            {
              name: 'barangay',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by barangay (partial match)',
            },
            {
              name: 'nearLat',
              in: 'query',
              schema: { type: 'number' },
              description: 'Latitude for geo search',
            },
            {
              name: 'nearLng',
              in: 'query',
              schema: { type: 'number' },
              description: 'Longitude for geo search',
            },
            {
              name: 'radiusMeters',
              in: 'query',
              schema: { type: 'number', default: 5000 },
              description: 'Search radius in meters',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'number', default: 10 },
              description: 'Max results',
            },
          ],
          responses: {
            200: {
              description: 'List of facilities',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/FacilityCard' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/facilities/{id}': {
        get: {
          tags: ['Facilities'],
          summary: 'Get facility details',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: { description: 'Facility details' },
            404: { description: 'Facility not found' },
          },
        },
      },
      // Doctors endpoints
      '/api/doctors': {
        get: {
          tags: ['Doctors'],
          summary: 'List doctors',
          parameters: [
            {
              name: 'facilityId',
              in: 'query',
              schema: { type: 'string', format: 'uuid' },
              description: 'Filter by facility',
            },
            {
              name: 'specialization',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by specialization (partial match)',
            },
          ],
          responses: {
            200: {
              description: 'List of doctors',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Doctor' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/doctors/{id}': {
        get: {
          tags: ['Doctors'],
          summary: 'Get doctor details',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: { description: 'Doctor details' },
            404: { description: 'Doctor not found' },
          },
        },
      },
      '/api/doctors/{id}/availability': {
        get: {
          tags: ['Doctors'],
          summary: 'Get doctor availability slots',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'from',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'Start date (default: now)',
            },
            {
              name: 'to',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'End date (default: 7 days from now)',
            },
          ],
          responses: {
            200: {
              description: 'Schedule card with availability',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/ScheduleCard' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: { description: 'Doctor not found' },
          },
        },
      },
      // Appointments endpoints
      '/api/appointments': {
        get: {
          tags: ['Appointments'],
          summary: 'List user appointments',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
              },
            },
          ],
          responses: {
            200: {
              description: 'List of appointments',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Appointment' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Appointments'],
          summary: 'Create appointment',
          security: [{ InternalKey: [], UserId: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateAppointmentRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Appointment created',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/BookingCard' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: 'Invalid parameters' },
            401: { description: 'Unauthorized' },
            409: { description: 'Slot unavailable' },
          },
        },
      },
      '/api/appointments/{id}': {
        get: {
          tags: ['Appointments'],
          summary: 'Get appointment details',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: { description: 'Appointment details' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - not your appointment' },
            404: { description: 'Appointment not found' },
          },
        },
        delete: {
          tags: ['Appointments'],
          summary: 'Cancel appointment',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: { description: 'Appointment cancelled' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - not your appointment' },
            404: { description: 'Appointment not found' },
          },
        },
      },
      // TTS endpoints
      '/api/tts': {
        post: {
          tags: ['TTS'],
          summary: 'Convert text to speech',
          description: 'Converts text to speech audio (WAV format). Supports Bikol, Filipino, and English.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TTSRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Audio file',
              content: {
                'audio/wav': {
                  schema: { type: 'string', format: 'binary' },
                },
              },
            },
            400: { description: 'Invalid input' },
            503: { description: 'TTS service unavailable' },
          },
        },
      },
      '/api/tts/health': {
        get: {
          tags: ['TTS'],
          summary: 'Check TTS service health',
          responses: {
            200: { description: 'TTS service is healthy' },
            503: { description: 'TTS service is unavailable' },
          },
        },
      },
      // Routing endpoints
      '/api/route': {
        get: {
          tags: ['Routing'],
          summary: 'Get directions between two points',
          description: 'Calculates driving/walking route. Coordinates must be within Naga City area.',
          security: [{ InternalKey: [] }],
          parameters: [
            { name: 'fromLat', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'fromLng', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'toLat', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'toLng', in: 'query', required: true, schema: { type: 'number' } },
            {
              name: 'profile',
              in: 'query',
              schema: { type: 'string', enum: ['driving', 'walking', 'cycling'], default: 'driving' },
            },
          ],
          responses: {
            200: {
              description: 'Route details',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/RouteCard' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: 'Invalid parameters or out of bounds' },
            401: { description: 'Missing internal key' },
            404: { description: 'No route found' },
          },
        },
      },
      // Medications endpoints
      '/api/medications/courses': {
        get: {
          tags: ['Medications'],
          summary: 'List medication courses',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            {
              name: 'includeInactive',
              in: 'query',
              schema: { type: 'string', enum: ['0', '1'] },
              description: 'Include inactive courses',
            },
          ],
          responses: {
            200: {
              description: 'List of medication courses',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/MedicationCourse' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Medications'],
          summary: 'Create medication course',
          security: [{ InternalKey: [], UserId: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['medicationName', 'instructions'],
                  properties: {
                    medicationName: { type: 'string' },
                    strength: { type: 'string' },
                    form: { type: 'string' },
                    instructions: { type: 'string' },
                    scheduleTimes: { type: 'array', items: { type: 'string' } },
                    timezone: { type: 'string', default: 'Asia/Manila' },
                    prn: { type: 'boolean' },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Course created' },
            400: { description: 'Invalid input' },
          },
        },
      },
      '/api/medications/courses/{id}': {
        patch: {
          tags: ['Medications'],
          summary: 'Update medication course',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Course updated' },
            404: { description: 'Course not found' },
          },
        },
        delete: {
          tags: ['Medications'],
          summary: 'Deactivate medication course',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Course deactivated' },
            404: { description: 'Course not found' },
          },
        },
      },
      '/api/medications/reminders': {
        get: {
          tags: ['Medications'],
          summary: 'List medication reminders',
          security: [{ InternalKey: [], UserId: [] }],
          responses: {
            200: { description: 'List of reminders' },
          },
        },
        post: {
          tags: ['Medications'],
          summary: 'Create medication reminder',
          security: [{ InternalKey: [], UserId: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['courseId'],
                  properties: {
                    courseId: { type: 'string', format: 'uuid' },
                    timesOfDay: { type: 'array', items: { type: 'string' } },
                    timezone: { type: 'string' },
                    enabled: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Reminder created' },
            404: { description: 'Course not found' },
          },
        },
      },
      '/api/medications/reminders/{id}': {
        patch: {
          tags: ['Medications'],
          summary: 'Update reminder',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Reminder updated' },
            404: { description: 'Reminder not found' },
          },
        },
        delete: {
          tags: ['Medications'],
          summary: 'Delete reminder',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Reminder deleted' },
            404: { description: 'Reminder not found' },
          },
        },
      },
      '/api/medications/intake': {
        get: {
          tags: ['Medications'],
          summary: 'List intake events',
          security: [{ InternalKey: [], UserId: [] }],
          parameters: [
            { name: 'courseId', in: 'query', schema: { type: 'string', format: 'uuid' } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          ],
          responses: {
            200: { description: 'List of intake events' },
          },
        },
        post: {
          tags: ['Medications'],
          summary: 'Record intake event',
          security: [{ InternalKey: [], UserId: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['courseId', 'scheduledAt', 'status'],
                  properties: {
                    courseId: { type: 'string', format: 'uuid' },
                    scheduledAt: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['taken', 'missed', 'skipped'] },
                    takenAt: { type: 'string', format: 'date-time' },
                    source: { type: 'string', enum: ['web', 'mobile'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Intake recorded' },
            404: { description: 'Course not found' },
          },
        },
      },
    },
  },
  apis: [], // We're defining paths inline, not using JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Serve Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'MyNaga Gabay API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );

  // Serve OpenAPI spec as JSON
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };
