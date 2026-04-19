export interface MaterialDefinitionProperty {
    id: string;
    name: string;
    value: string;
    description?: string;
    dataType?: string;
    createdAtUtc: Date;
    updatedAtUtc: Date;
}

export interface MaterialDefinitionPropertyCreateRequest {
    materialDefinitionId: string;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
}

export interface MaterialDefinitionPropertyUpdateRequest {
    materialDefinitionId: string;
    propertyId: string;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
}
