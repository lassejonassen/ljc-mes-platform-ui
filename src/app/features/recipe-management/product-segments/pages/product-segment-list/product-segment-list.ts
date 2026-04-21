import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table, TableModule } from 'primeng/table';
import { ProductSegmentCreateRequest, ProductSegmentService } from '../../services/product-segment-service';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { ProductSegment } from '@/app/shared/models/recipe-management/product-segments/product-segment.model';
import { ProductSegmentDialog } from '../../components/product-segment-dialog/product-segment-dialog';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-product-segment-list',
    imports: [TreeTableModule, TagModule, ToolbarModule, ButtonModule, TableModule, IconFieldModule, InputTextModule, InputIconModule, ToastModule, ConfirmDialogModule, RouterLink, TooltipModule],
    templateUrl: './product-segment-list.html',
    styleUrl: './product-segment-list.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class ProductSegmentList implements OnInit {
    @ViewChild('dt') dt!: Table;
    private productSegmentService = inject(ProductSegmentService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    productSegments = this.productSegmentService.productSegments;
    loading = this.productSegmentService.loading;
    error = this.productSegmentService.error;
    selectedNodes!: TreeNode | TreeNode[] | null;

    groupedProductSegments = computed<TreeNode[]>(() => {
        const rawData = [...this.productSegments()];

        // 1. Robust Sort: Handles numbers, strings, and missing values
        rawData.sort((a, b) => {
            // Handle null/undefined versions by treating them as empty strings
            const verA = (a.version ?? '').toString();
            const verB = (b.version ?? '').toString();

            return verB.localeCompare(verA, undefined, {
                numeric: true,
                sensitivity: 'base'
            });
        });

        const groups: Record<string, TreeNode> = {};

        // 2. Build the Tree
        rawData.forEach((item) => {
            if (!groups[item.processSegmentName]) {
                groups[item.processSegmentName] = {
                    data: { ...item, isGroup: true },
                    expanded: false,
                    children: []
                };
            }

            groups[item.processSegmentName].children?.push({
                data: { ...item, isGroup: false }
            });
        });

        return Object.values(groups);
    });

    ngOnInit(): void {
        // Trigger the load - the Signal handles the notification.
        this.productSegmentService.getAll().subscribe();
    }

    refresh(): void {
        this.productSegmentService.getAll().subscribe();
    }

    onGlobalFilter(treeTable: TreeTable, event: Event) {
        const val = (event.target as HTMLInputElement).value;
        treeTable.filterGlobal(val, 'contains');
    }

    exportCSV(): void {
        this.dt.exportCSV();
    }

    showProductSegmentDialog(): void {
        const ref = this.dialogService.open(ProductSegmentDialog, {
            header: 'Add new Product Segment',
            width: '30vw'
        });

        ref!.onClose.subscribe((result: ProductSegmentCreateRequest | undefined) => {
            if (!result) return;

            console.log(result);

            this.productSegmentService.create(result).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        detail: 'Product Segment created',
                        summary: 'Success',
                        life: 3000
                    });
                }
            });
        });
    }

    deleteSelected(): void {
        // 1. Ensure there is a selection
        if (!this.selectedNodes || (Array.isArray(this.selectedNodes) && this.selectedNodes.length === 0)) {
            return;
        }

        // 2. Normalize selection to an array and extract IDs
        // We filter out nodes where isGroup is true (the parent SKU folders)
        // to ensure we only send actual record IDs to the service.
        const nodes = Array.isArray(this.selectedNodes) ? this.selectedNodes : [this.selectedNodes];
        const selectedIds = nodes.filter((node) => !node.data.isGroup).map((node) => node.data.id);

        if (selectedIds.length === 0) return;

        // 3. Open Confirmation Dialog
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the ${selectedIds.length} selected product segment(s)?`,
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
                selectedIds.forEach((id) => {
                    this.productSegmentService.delete(id).subscribe({
                        next: () => {
                            // Clear selection after successful deletion
                            this.selectedNodes = null;
                        }
                    });
                });

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Selected Product Segments Deleted',
                    life: 3000
                });
            }
        });
    }

    openDeleteDialog(productSegment: ProductSegment): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Product Segment: ${productSegment.processSegmentName} (${productSegment.materialSku} ${productSegment.materialName})`,
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
                this.productSegmentService.delete(productSegment.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Product Segment deleted',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Product Segment deletion rejected' });
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
