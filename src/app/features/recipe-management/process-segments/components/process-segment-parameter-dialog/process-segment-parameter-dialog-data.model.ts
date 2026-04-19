import { ProcessSegmentParameter } from '@/app/shared/models/recipe-management/process-segments/process-segment-parameter.model';

export interface ProcessSegmentParameterDialogData {
    processSegmentId: string;
    parameter?: ProcessSegmentParameter;
}
