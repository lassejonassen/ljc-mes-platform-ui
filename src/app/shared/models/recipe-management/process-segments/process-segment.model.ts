import { ProcessSegmentParameter } from './process-segment-parameter.model';

export interface ProcessSegment {
    id: string;
    createdAtUtc: Date;
    updatedAtUtc: Date;
    name: string;
    stableId: string;
    version: number;
    state: string;
    parameters?: ProcessSegmentParameter[];
}
