import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { MaterialDefinitionCreateRequest, MaterialDefinitionService, MaterialDefinitionUpdateRequest } from '../../services/material-definition-service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MaterialDefinition } from '@/app/shared/models/recipe-management/material-definitions/material-definition.model';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaterialDefinitionDialog } from '../../components/material-definition-dialog/material-definition-dialog';
import { MaterialDefinitionDialogData } from '../../components/material-definition-dialog/material-definition-dialog-data.model';
import { Router, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TreeTable, TreeTableModule } from 'primeng/treetable';

@Component({
    selector: 'app-material-definition-list',
    imports: [TreeTableModule, TagModule, ToolbarModule, ButtonModule, TableModule, IconFieldModule, InputTextModule, InputIconModule, ToastModule, ConfirmDialogModule, RouterLink, TooltipModule],
    templateUrl: './material-definition-list.html',
    styleUrl: './material-definition-list.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class MaterialDefinitionList implements OnInit {
    @ViewChild('dt') dt!: Table;
    private materialDefinitionService = inject(MaterialDefinitionService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    // Expose service singals directly to template
    materials = this.materialDefinitionService.materialDefinitions;
    loading = this.materialDefinitionService.loading;
    error = this.materialDefinitionService.error;
    selectedNodes!: TreeNode | TreeNode[] | null;
    groupedMaterials = computed<TreeNode[]>(() => {
        const raw = this.materials();
        const groups: Record<string, TreeNode> = {};

        raw.forEach((m) => {
            if (!groups[m.sku]) {
                groups[m.sku] = {
                    data: {
                        sku: m.sku,
                        name: m.name,
                        isGroup: true // Helper flag
                    },
                    children: [],
                    expanded: false
                };
            }

            // Add the version as a child
            groups[m.sku].children?.push({
                data: { ...m, isGroup: false }
            });
        });

        return Object.values(groups);
    });

    selectedMaterialDefinitions!: MaterialDefinition[] | null;

    ngOnInit(): void {
        // Trigger the load - the Signal handles the notification.
        this.materialDefinitionService.getAll().subscribe();
    }

    refresh(): void {
        this.materialDefinitionService.getAll().subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalFilter2(treeTable: TreeTable, event: Event) {
        const val = (event.target as HTMLInputElement).value;
        treeTable.filterGlobal(val, 'contains');
    }

    exportCSV(): void {
        this.dt.exportCSV();
    }

    showMaterialDefinitionDialog(materialDefinition?: MaterialDefinition): void {
        const data: MaterialDefinitionDialogData = {
            materialDefinition: materialDefinition
        };

        const ref = this.dialogService.open(MaterialDefinitionDialog, {
            header: materialDefinition ? 'Edit Material Definition' : 'Add new Material Definition',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: MaterialDefinitionCreateRequest | MaterialDefinitionUpdateRequest | undefined) => {
            if (!result) return;

            if ('id' in result) {
                this.materialDefinitionService.update(result.id, result).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Material Definition updated',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            } else {
                this.materialDefinitionService.create(result).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Material Definition created',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    deleteSelected(): void {}
    openDeleteDialog(materialDefinition: MaterialDefinition): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Material Definition: ${materialDefinition.sku} (${materialDefinition.name})`,
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
                this.materialDefinitionService.delete(materialDefinition.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Material Definition deleted',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Material Definition deletion rejected' });
            }
        });
    }

    getSeverity(state: string) {
        switch (state?.toLowerCase()) {
            case 'released':
                return 'success';
            case 'draft':
                return 'info';
            case 'obsolete':
                return 'danger';
            default:
                return 'secondary';
        }
    }
}
