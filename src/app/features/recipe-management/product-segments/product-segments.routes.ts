import { Routes } from '@angular/router';
import { ProductSegmentList } from './pages/product-segment-list/product-segment-list';
import { ProductSegmentDetail } from './pages/product-segment-detail/product-segment-detail';

export default [
    { path: '', component: ProductSegmentList },
    {
        path: ':id',
        component: ProductSegmentDetail
    }
] as Routes;
