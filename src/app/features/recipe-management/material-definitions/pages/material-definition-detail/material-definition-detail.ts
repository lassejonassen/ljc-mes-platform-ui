import { MaterialDefinition } from '@/app/shared/models/recipe-management/material-definitions/material-definition.model';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    MaterialDefinitionCreateDraftRequest,
    MaterialDefinitionDeprecateRequest,
    MaterialDefinitionPropertyCreateRequest,
    MaterialDefinitionPropertyUpdateRequest,
    MaterialDefinitionReleaseRequest,
    MaterialDefinitionService
} from '../../services/material-definition-service';
import { Table, TableModule } from 'primeng/table';
import { MaterialDefinitionProperty } from '@/app/shared/models/recipe-management/material-definitions/material-definition-property.model';
import { MaterialDefinitionPropertyDialogData } from '../../components/material-definition-property-dialog/material-definition-property-dialog-data.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MaterialDefinitionPropertyDialog } from '../../components/material-definition-property-dialog/material-definition-property-dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-material-definition-detail',
    imports: [RouterLink, ToolbarModule, ButtonModule, TooltipModule, TableModule, IconFieldModule, InputIconModule, ToastModule, ConfirmDialogModule, InputTextModule],
    templateUrl: './material-definition-detail.html',
    styleUrl: './material-definition-detail.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class MaterialDefinitionDetail implements OnInit {
    @ViewChild('dt') dt!: Table;
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private materialDefinitionService = inject(MaterialDefinitionService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    material = this.materialDefinitionService.materialDefinition;
    loading = this.materialDefinitionService.loading;
    error = this.materialDefinitionService.error;

    isReadOnly = computed(() => {
        const state = this.material()?.state?.toLowerCase();
        return state === 'released' || state === 'obsolete';
    });

    readonly newReleaseAllowed = signal<boolean>(false);

    materialDefinitionId!: string;
    selectedMaterialDefinitionProperties!: MaterialDefinitionProperty[] | null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.materialDefinitionId = id;
            // 2. We just trigger the call; the Service signal handles the data flow
            this.materialDefinitionService.getById(id).subscribe({
                next: (data) => {
                    this.materialDefinitionService.getLatestVersion(id).subscribe((res) => this.newReleaseAllowed.set(res === this.material()?.version));
                }
            });
        }
    }

    refresh(): void {
        this.materialDefinitionService.getById(this.materialDefinitionId).subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    showMaterialDefinitionPropertyDialog(property?: MaterialDefinitionProperty): void {
        const data: MaterialDefinitionPropertyDialogData = {
            property: property,
            materialDefinitionId: this.materialDefinitionId
        };

        const ref = this.dialogService.open(MaterialDefinitionPropertyDialog, {
            header: property ? 'Edit Property' : 'Add new Property',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: MaterialDefinitionPropertyCreateRequest | MaterialDefinitionPropertyUpdateRequest | undefined) => {
            if (!result) return;

            if ('propertyId' in result) {
                this.materialDefinitionService.updateProperty(result.materialDefinitionId, result.propertyId, result).subscribe({
                    next: () => this.showSuccess('Property updated')
                });
            } else {
                this.materialDefinitionService.createProperty(result.materialDefinitionId, result).subscribe({
                    next: () => this.showSuccess('Property created')
                });
            }
        });
    }

    deleteSelected(): void {}
    openDeleteDialog(materialDefinitionProperty: MaterialDefinitionProperty): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Material Definition Property: ${materialDefinitionProperty.name} `,
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
                this.materialDefinitionService.deleteProperty(materialDefinitionProperty.materialDefinitionId, materialDefinitionProperty.id).subscribe({
                    next: () => this.showSuccess('Property deleted')
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Material Definition Property deletion rejected' });
            }
        });
    }

    exportCSV(): void {}

    openNewReleaseDialog(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to create a new draft of Material Definition: ${this.material()!.sku} (${this.material()!.name}) `,
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Create',
                severity: 'primary'
            },
            accept: () => {
                this.materialDefinitionService.createDraft(this.materialDefinitionId, { materialDefinitionId: this.materialDefinitionId } as MaterialDefinitionCreateDraftRequest).subscribe({
                    next: (res) => {
                        this.router.navigate(['/recipe-management/material-definitions', res.id]);
                        this.showSuccess('Draft created');
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Material Definition new release rejected' });
            }
        });
    }

    openReleaseDialog(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to release Material Definition: ${this.material()!.sku} (${this.material()!.name}) `,
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Create',
                severity: 'primary'
            },
            accept: () => {
                this.materialDefinitionService.release(this.materialDefinitionId, { id: this.materialDefinitionId } as MaterialDefinitionReleaseRequest).subscribe({
                    next: () => {
                        this.showSuccess('Released');
                        this.refresh(); // Now it refreshes AFTER the server is done
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Material Definition release rejected' });
            }
        });
    }

    openDeprecateDialog(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to deprecate Material Definition: ${this.material()!.sku} (${this.material()!.name}) `,
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Create',
                severity: 'primary'
            },
            accept: () => {
                this.materialDefinitionService.deprecate(this.materialDefinitionId, { id: this.materialDefinitionId } as MaterialDefinitionDeprecateRequest).subscribe({
                    next: () => {
                        this.showSuccess('Deprecated');
                        this.refresh(); // Now it refreshes AFTER the server is done
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Material Definition deprecation rejected' });
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
