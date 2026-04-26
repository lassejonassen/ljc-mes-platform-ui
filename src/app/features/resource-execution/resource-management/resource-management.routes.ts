import { Routes } from '@angular/router';

export default [
    {
        path: 'equipment-classes',
        loadChildren: () => import('./equipment-classes/equipment-classes.routes')
    }
] as Routes;
