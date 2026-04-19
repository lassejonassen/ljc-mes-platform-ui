import { MaterialDefinitionProperty } from '@/app/shared/models/recipe-management/material-definitions/material-definition-property.model';

export interface MaterialDefinitionPropertyDialogData {
    materialDefinitionId: string;
    property?: MaterialDefinitionProperty;
}
