import { EquipmentClassCapability } from './equipment-class-capability.model';

export interface EquipmentClass {
    id: string;
    name: string;
    description?: string;
    capabilities?: EquipmentClassCapability[];
}
