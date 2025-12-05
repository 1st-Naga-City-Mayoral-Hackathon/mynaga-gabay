export interface HealthFacility {
    id: string;
    name: string;
    type: FacilityType;
    address: string;
    barangay: string;
    city: string;
    phone?: string;
    hours?: string;
    services: string[];
    latitude?: number;
    longitude?: number;
}

export type FacilityType =
    | 'hospital'
    | 'health_center'
    | 'clinic'
    | 'pharmacy'
    | 'birthing_home'
    | 'diagnostic_center';

export interface Medication {
    id: string;
    genericName: string;
    brandNames: string[];
    category: string;
    description: string;
    dosageForms: string[];
    commonUses: string[];
    warnings: string[];
    bikolName?: string;
}

export interface PhilHealthInfo {
    category: string;
    coverage: string;
    requirements: string[];
    howToAvail: string[];
}
