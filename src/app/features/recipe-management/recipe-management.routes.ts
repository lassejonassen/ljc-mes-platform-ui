import { Routes } from '@angular/router';

export default [
    {
        path: 'material-definitions',
        loadChildren: () => import('./material-definitions/material-definitions.routes')
    },
    {
        path: 'process-segments',
        loadChildren: () => import('./process-segments/process-segments.routes')
    },
    {
        path: 'product-segments',
        loadChildren: () => import('./product-segments/product-segments.routes')
    }
] as Routes;
