export interface WageGroup {
    id: string;
    code: string;
    name: string;
    baseHourlyRate: number;
    currency: string;
    description?: string;
    isActive: boolean;
}

export interface WageGroupListResponse {
    data: WageGroup[];
}

export interface WageGroupActivationStatusRequest {
    id: string;
}

export interface WageGroupCreateRequest {
    code: string;
    name: string;
    baseHourlyRate: number;
    currency: string;
    description?: string;
}

export interface WageGroupUpdateRequest {
    id: string;
    code: string;
    name: string;
    baseHourlyRate: number;
    currency: string;
    description?: string;
}
