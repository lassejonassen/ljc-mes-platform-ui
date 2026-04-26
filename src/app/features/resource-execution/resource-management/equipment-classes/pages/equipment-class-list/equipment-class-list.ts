import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { EquipmentClassCreateRequest, EquipmentClassService, EquipmentClassUpdateRequest } from '../../services/equipment-class-service';
import { EquipmentClass } from '@/app/shared/models/resource-execution/resource-management/equipment-classes/equipment-class.model';
import { EquipmentClassDialog } from '../../components/equipment-class-dialog/equipment-class-dialog';
import { EquipmentClassDialogData } from '../../components/equipment-class-dialog/equipment-class-dialog-data.model';

@Component({
    selector: 'app-equipment-class-list',
    imports: [TreeTableModule, TagModule, ToolbarModule, ButtonModule, TableModule, IconFieldModule, InputTextModule, InputIconModule, ToastModule, ConfirmDialogModule, RouterLink, TooltipModule],
    templateUrl: './equipment-class-list.html',
    styleUrl: './equipment-class-list.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class EquipmentClassList {
    @ViewChild('dt') dt!: Table;
    private equipmentClassService = inject(EquipmentClassService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    equipmentClasses = this.equipmentClassService.equipmentClasses;
    loading = this.equipmentClassService.loading;
    error = this.equipmentClassService.error;
    selectedEquipmentClasses: EquipmentClass[] | null = null;

    ngOnInit(): void {
        // Trigger the load - the Signal handles the notification.
        this.equipmentClassService.getAll().subscribe();
    }

    refresh(): void {
        this.equipmentClassService.getAll().subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        const val = (event.target as HTMLInputElement).value;
        table.filterGlobal(val, 'contains');
    }

    exportCSV(): void {
        this.dt.exportCSV();
    }

    showEquipmentClassDialog(equipmentClass?: EquipmentClass): void {
        const data: EquipmentClassDialogData = {
            equipmentClass: equipmentClass
        };

        const ref = this.dialogService.open(EquipmentClassDialog, {
            header: equipmentClass ? 'Edit Equipment Class' : 'Add new Equipment Class',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: EquipmentClassCreateRequest | EquipmentClassUpdateRequest | undefined) => {
            if (!result) return;

            if ('id' in result) {
                this.equipmentClassService.update(result.id, result).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Equipment Class updated',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            } else {
                this.equipmentClassService.create(result).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Equipment Class created',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    deleteSelected(): void {
        // 1. Ensure there is a selection
        if (!this.selectedEquipmentClasses || this.selectedEquipmentClasses.length === 0) {
            return;
        }

        const count = this.selectedEquipmentClasses.length;

        // 2. Open Confirmation Dialog
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the ${count} selected equipment class(es)?`,
            header: 'Confirm Bulk Deletion',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete All',
                severity: 'danger'
            },
            accept: () => {
                // 3. Extract IDs and execute deletions
                // Note: If your API supports a bulk delete endpoint,
                // it is much better to use that instead of a loop.
                const idsToDelete = this.selectedEquipmentClasses!.map((ec) => ec.id);

                idsToDelete.forEach((id) => {
                    this.equipmentClassService.delete(id).subscribe({
                        next: () => {
                            // Logic to clear local selection after the loop or per item
                        }
                    });
                });

                this.selectedEquipmentClasses = null; // Clear selection

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Selected Equipment Classes Deleted',
                    life: 3000
                });
            }
        });
    }

    openDeleteDialog(equipmentClass: EquipmentClass): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Equipment Class: ${equipmentClass.name}`,
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
                this.equipmentClassService.delete(equipmentClass.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Equipment Class deleted',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Equipment Class deletion rejected' });
            }
        });
    }
}
