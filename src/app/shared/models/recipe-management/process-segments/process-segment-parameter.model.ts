export interface ProcessSegmentParameter {
    id: string;
    createdAtUtc: Date;
    updatedAtUtc: Date;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
    isReadOnly: boolean;
    defaultValue: string;
    processSegmentId: string;
}
