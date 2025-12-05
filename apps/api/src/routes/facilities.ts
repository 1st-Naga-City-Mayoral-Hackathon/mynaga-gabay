import { Router } from 'express';
import type { HealthFacility, ApiResponse } from '@mynaga/shared';

const router = Router();

// Sample facilities data (will be replaced with Supabase query)
const sampleFacilities: HealthFacility[] = [
    {
        id: '1',
        name: 'Bicol Medical Center',
        type: 'hospital',
        address: 'Concepcion Grande',
        barangay: 'Concepcion Grande',
        city: 'Naga City',
        phone: '(054) 472-3456',
        hours: '24/7',
        services: ['Emergency', 'Surgery', 'OB-Gyne', 'Pediatrics', 'Internal Medicine'],
    },
    {
        id: '2',
        name: 'Naga City Hospital',
        type: 'hospital',
        address: 'Peñafrancia Ave',
        barangay: 'Centro',
        city: 'Naga City',
        phone: '(054) 811-1234',
        hours: '24/7',
        services: ['Emergency', 'General Medicine', 'Pediatrics'],
    },
    {
        id: '3',
        name: 'City Health Office - Barangay Health Center',
        type: 'health_center',
        address: 'Various locations',
        barangay: 'Multiple',
        city: 'Naga City',
        hours: '8:00 AM - 5:00 PM',
        services: ['Primary Care', 'Immunization', 'Prenatal', 'Family Planning'],
    },
];

/**
 * GET /api/facilities
 * List health facilities in Naga City
 */
router.get('/', (req, res) => {
    const { type, barangay } = req.query;

    let facilities = sampleFacilities;

    if (type) {
        facilities = facilities.filter(f => f.type === type);
    }

    if (barangay) {
        facilities = facilities.filter(f =>
            f.barangay.toLowerCase().includes(String(barangay).toLowerCase())
        );
    }

    res.json({
        success: true,
        data: facilities,
    } as ApiResponse<HealthFacility[]>);
});

/**
 * GET /api/facilities/:id
 * Get specific facility details
 */
router.get('/:id', (req, res) => {
    const facility = sampleFacilities.find(f => f.id === req.params.id);

    if (!facility) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Facility not found' },
        } as ApiResponse<never>);
    }

    res.json({
        success: true,
        data: facility,
    } as ApiResponse<HealthFacility>);
});

export { router as facilitiesRouter };
