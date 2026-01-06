// User roles
export enum UserRole {
    EMPLOYEE = 'EMPLOYEE',
    RECRUITER = 'RECRUITER',
}

// Application statuses
export enum ApplicationStatus {
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    REFEREE_CONTACTED = 'REFEREE_CONTACTED',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
    HIRED = 'HIRED',
}

// Message sender types
export enum SenderType {
    RECRUITER = 'RECRUITER',
    REFEREE = 'REFEREE',
}

// Job status
export enum JobStatus {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    DRAFT = 'DRAFT',
}

// Referee relationship types
export const REFEREE_RELATIONSHIPS = [
    'Manager',
    'Supervisor',
    'Colleague',
    'Team Lead',
    'HR Manager',
    'Director',
    'Professor',
    'Other',
] as const;

export type RefereeRelationship = typeof REFEREE_RELATIONSHIPS[number];
