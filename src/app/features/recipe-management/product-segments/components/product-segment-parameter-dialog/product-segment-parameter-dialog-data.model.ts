import { ProductSegmentParameter } from '@/app/shared/models/recipe-management/product-segments/product-segment-parameter.model';

export interface ProductSegmentParameterDialogData {
    productSegmentId: string;
    parameter: ProductSegmentParameter;
}
