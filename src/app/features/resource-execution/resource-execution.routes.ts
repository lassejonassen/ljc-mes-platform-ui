import { Routes } from '@angular/router';

export default [
    {
        path: 'resource-management',
        loadChildren: () => import('./resource-management/resource-management.routes')
    },
    {
        path: 'production-execution',
        loadChildren: () => import('./production-execution/production-execution.routes')
    }
] as Routes;
