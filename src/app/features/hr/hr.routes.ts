import { Routes } from '@angular/router';

export default [
    {
        path: 'operators',
        loadChildren: () => import('./operators/operators.routes')
    },
    {
        path: 'skills',
        loadChildren: () => import('./skills/skills.routes')
    },
    {
        path: 'teams',
        loadChildren: () => import('./teams/teams.routes')
    },
    {
        path: 'wage-groups',
        loadChildren: () => import('./wage-groups/wage-groups.routes')
    }
] as Routes;
