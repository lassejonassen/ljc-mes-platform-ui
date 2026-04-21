import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductSegmentCreateDraftRequest, ProductSegmentDeprecateRequest, ProductSegmentParameterUpdateRequest, ProductSegmentReleaseRequest, ProductSegmentService } from '../../services/product-segment-service';
import { ProductSegmentParameter } from '@/app/shared/models/recipe-management/product-segments/product-segment-parameter.model';
import { ProductSegmentParameterDialogData } from '../../components/product-segment-parameter-dialog/product-segment-parameter-dialog-data.model';
import { ProductSegmentParameterDialog } from '../../components/product-segment-parameter-dialog/product-segment-parameter-dialog';

@Component({
    selector: 'app-product-segment-detail',
    imports: [FormsModule, CommonModule, RouterLink, ToolbarModule, ButtonModule, TooltipModule, TableModule, IconFieldModule, InputIconModule, ToastModule, ConfirmDialogModule, InputTextModule, CheckboxModule],
    templateUrl: './product-segment-detail.html',
    styleUrl: './product-segment-detail.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class ProductSegmentDetail implements OnInit {
    @ViewChild('dt') dt!: Table;

    private route = inject(ActivatedRoute);
    private productSegmentService = inject(ProductSegmentService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    productSegment = this.productSegmentService.productSegment;
    loading = this.productSegmentService.loading;
    error = this.productSegmentService.error;

    isReadOnly = computed(() => {
        const state = this.productSegment()?.state?.toLowerCase();
        return state === 'released' || state === 'obsolete';
    });

    readonly newReleaseAllowed = signal<boolean>(false);

    productSegmentId!: string;
    selectedParameters!: ProductSegmentParameter[] | null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.productSegmentId = id;
            // 2. We just trigger the call; the Service signal handles the data flow
            this.productSegmentService.getById(id).subscribe({
                next: (data) => {
                    this.productSegmentService.getLatestVersion(id).subscribe((res) => this.newReleaseAllowed.set(res === this.productSegment()?.version));
                }
            });
        }
    }

    refresh(): void {
        this.productSegmentService.getById(this.productSegmentId).subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    showProductSegmentParameterDialog(parameter: ProductSegmentParameter): void {
        const data: ProductSegmentParameterDialogData = {
            parameter: parameter,
            productSegmentId: this.productSegmentId
        };

        const ref = this.dialogService.open(ProductSegmentParameterDialog, {
            header: 'Add new Parameter',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: ProductSegmentParameterUpdateRequest | undefined) => {
            if (!result) return;

            this.productSegmentService.updateParameter(result.productSegmentId, result.productSegmentParameterId, result).subscribe({
                next: () => this.showSuccess('Parameter updated')
            });
        });
    }

    exportCSV(): void {}

    openNewReleaseDialog(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to create a new draft of Product Segment`,
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
                this.productSegmentService.createDraft(this.productSegmentId, { productSegmentId: this.productSegmentId } as ProductSegmentCreateDraftRequest).subscribe({
                    next: () => this.showSuccess('Draft created')
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Product Segment new release rejected' });
            }
        });
    }

    openReleaseDialog(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to release Product Segment `,
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
                this.productSegmentService.release(this.productSegmentId, { productSegmentId: this.productSegmentId } as ProductSegmentReleaseRequest).subscribe({
                    next: () => {
                        this.showSuccess('Released');
                        this.refresh(); // Now it refreshes AFTER the server is done
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Product Segment release rejected' });
            }
        });
    }

    openDeprecateDialog(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to deprecate Product Segment`,
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
                this.productSegmentService.deprecate(this.productSegmentId, { productSegmentId: this.productSegmentId } as ProductSegmentDeprecateRequest).subscribe({
                    next: () => {
                        this.showSuccess('Deprecated');
                        this.refresh(); // Now it refreshes AFTER the server is done
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Product Segment deprecation rejected' });
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
