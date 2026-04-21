import { ProductSegmentParameter } from './product-segment-parameter.model';

export interface ProductSegment {
    id: string;
    materialDefinitionId: string;
    processSegmentId: string;
    materialSku: string;
    materialName: string;
    processSegmentName: string;
    state: string;
    version: number;
    parameters?: ProductSegmentParameter[];
}
