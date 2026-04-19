import { Routes } from '@angular/router';
import { ProcessSegmentList } from './pages/process-segment-list/process-segment-list';
import { ProcessSegmentDetail } from './pages/process-segment-detail/process-segment-detail';

export default [
    { path: '', component: ProcessSegmentList },
    { path: ':id', component: ProcessSegmentDetail }
] as Routes;
