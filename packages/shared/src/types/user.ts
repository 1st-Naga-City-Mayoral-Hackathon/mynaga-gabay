export interface User {
    id: string;
    email?: string;
    preferredLanguage: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPreferences {
    language: string;
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
}
