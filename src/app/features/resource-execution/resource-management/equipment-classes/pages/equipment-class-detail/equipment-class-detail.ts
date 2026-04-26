import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { EquipmentClassCapabilityCreateRequest, EquipmentClassCapabilityUpdateRequest, EquipmentClassService } from '../../services/equipment-class-service';
import { EquipmentClassCapability } from '@/app/shared/models/resource-execution/resource-management/equipment-classes/equipment-class-capability.model';
import { EquipmentClassCapabilityDialogData } from '../../components/equipment-class-capability-dialog/equipment-class-capability-dialog-data.model';
import { EquipmentClassCapabilityDialog } from '../../components/equipment-class-capability-dialog/equipment-class-capability-dialog';

@Component({
    selector: 'app-equipment-class-detail',
    imports: [FormsModule, CommonModule, RouterLink, ToolbarModule, ButtonModule, TooltipModule, TableModule, IconFieldModule, InputIconModule, ToastModule, ConfirmDialogModule, InputTextModule, CheckboxModule],
    templateUrl: './equipment-class-detail.html',
    styleUrl: './equipment-class-detail.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class EquipmentClassDetail implements OnInit {
    @ViewChild('dt') dt!: Table;

    private route = inject(ActivatedRoute);
    private equipmentClassService = inject(EquipmentClassService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    equipmentClass = this.equipmentClassService.equipmentClass;
    loading = this.equipmentClassService.loading;
    error = this.equipmentClassService.error;

    equipmentClassId!: string;
    selectedCapabilities!: EquipmentClassCapability[] | null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.equipmentClassId = id;
            // 2. We just trigger the call; the Service signal handles the data flow
            this.equipmentClassService.getById(id).subscribe({
                next: (data) => {}
            });
        }
    }

    refresh(): void {
        this.equipmentClassService.getById(this.equipmentClassId).subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    showCapabilityDialog(capability?: EquipmentClassCapability): void {
        const data: EquipmentClassCapabilityDialogData = {
            equipmentclassId: this.equipmentClassId,
            capability: capability
        };

        const ref = this.dialogService.open(EquipmentClassCapabilityDialog, {
            header: capability ? 'Edit Capability' : 'Add new Capability',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: EquipmentClassCapabilityCreateRequest | EquipmentClassCapabilityUpdateRequest | undefined) => {
            if (!result) return;

            if (capability) {
                this.equipmentClassService.updateCapability(result.equipmentClassId, result).subscribe({
                    next: () => this.showSuccess('Capablity updated')
                });
            } else {
                this.equipmentClassService.createCapability(result.equipmentClassId, result).subscribe({
                    next: () => this.showSuccess('Capability created')
                });
            }
        });
    }

    deleteSelected(): void {}

    openDeleteDialog(equipmentClassCapablity: EquipmentClassCapability): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Equipment Class Capability: ${equipmentClassCapablity.name} `,
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger'
            },
            accept: () => {
                this.equipmentClassService.deleteCapability(this.equipmentClassId, equipmentClassCapablity.name).subscribe({
                    next: () => this.showSuccess('Capability deleted')
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Equipment Class Capability deletion rejected' });
            }
        });
    }

    private showSuccess(message: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    }
}
