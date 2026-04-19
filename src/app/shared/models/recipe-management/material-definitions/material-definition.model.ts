import { MaterialDefinitionProperty } from './material-definition-property.model';

export interface MaterialDefinition {
    id: string;
    sku: string;
    name: string;
    createdAtUtc: Date;
    updatedAtUtc: Date;
    properties?: MaterialDefinitionProperty[];
}
