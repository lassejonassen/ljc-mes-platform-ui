import { Routes } from '@angular/router';
import { EquipmentClassList } from './pages/equipment-class-list/equipment-class-list';
import { EquipmentClassDetail } from './pages/equipment-class-detail/equipment-class-detail';

export default [
    { path: '', component: EquipmentClassList },
    { path: ':id', component: EquipmentClassDetail }
] as Routes;
