export interface MaterialDefinitionProperty {
    id: string;
    materialDefinitionId: string;
    name: string;
    value: string;
    description?: string;
    dataType?: string;
    createdAtUtc: Date;
    updatedAtUtc: Date;
}
