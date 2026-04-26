import { EquipmentClassCapability } from '@/app/shared/models/resource-execution/resource-management/equipment-classes/equipment-class-capability.model';

export interface EquipmentClassCapabilityDialogData {
    equipmentclassId: string;
    capability?: EquipmentClassCapability;
}
