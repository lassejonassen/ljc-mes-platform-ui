import { MaterialDefinitionProperty } from './material-definition-property.model';

export interface MaterialDefinition {
    id: string;
    sku: string;
    name: string;
    state: string;
    version: number
    createdAtUtc: Date;
    updatedAtUtc: Date;
    properties?: MaterialDefinitionProperty[];
}
