import { Routes } from '@angular/router';
import { MaterialDefinitionList } from './pages/material-definition-list/material-definition-list';
import { MaterialDefinitionDetail } from './pages/material-definition-detail/material-definition-detail';

export default [
    { path: '', component: MaterialDefinitionList },
    { path: ':id', component: MaterialDefinitionDetail }
] as Routes;
