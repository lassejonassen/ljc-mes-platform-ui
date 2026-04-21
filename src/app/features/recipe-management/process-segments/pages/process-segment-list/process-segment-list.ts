import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProcessSegmentCreateRequest, ProcessSegmentService, ProcessSegmentUpdateRequest } from '../../services/process-segment-service';
import { ProcessSegment } from '@/app/shared/models/recipe-management/process-segments/process-segment.model';
import { ProcessSegmentDialogData } from '../../components/process-segment-dialog/process-segment-dialog-data.model';
import { ProcessSegmentDialog } from '../../components/process-segment-dialog/process-segment-dialog';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-process-segment-list',
    imports: [TreeTableModule, TagModule, ToolbarModule, ButtonModule, TableModule, IconFieldModule, InputTextModule, InputIconModule, ToastModule, ConfirmDialogModule, RouterLink, TooltipModule],
    templateUrl: './process-segment-list.html',
    styleUrl: './process-segment-list.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class ProcessSegmentList implements OnInit {
    @ViewChild('dt') dt!: Table;
    private processSegmentService = inject(ProcessSegmentService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    processSegments = this.processSegmentService.processSegments;
    loading = this.processSegmentService.loading;
    error = this.processSegmentService.error;
    selectedNodes!: TreeNode | TreeNode[] | null;

    groupedProcessSegments = computed<TreeNode[]>(() => {
        const rawData = [...this.processSegments()];

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
            if (!groups[item.name]) {
                groups[item.name] = {
                    data: { ...item, isGroup: true },
                    expanded: false,
                    children: []
                };
            }

            groups[item.name].children?.push({
                data: { ...item, isGroup: false }
            });
        });

        return Object.values(groups);
    });

    ngOnInit(): void {
        // Trigger the load - the Signal handles the notification.
        this.processSegmentService.getAll().subscribe();
    }

    refresh(): void {
        this.processSegmentService.getAll().subscribe();
    }

    onGlobalFilter(treeTable: TreeTable, event: Event) {
        const val = (event.target as HTMLInputElement).value;
        treeTable.filterGlobal(val, 'contains');
    }

    exportCSV(): void {
        this.dt.exportCSV();
    }

    showProcessSegmentDialog(processSegment?: ProcessSegment): void {
        const data: ProcessSegmentDialogData = {
            processSegment: processSegment
        };

        const ref = this.dialogService.open(ProcessSegmentDialog, {
            header: processSegment ? 'Edit Process Segment' : 'Add new Process Segment',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: ProcessSegmentCreateRequest | ProcessSegmentUpdateRequest | undefined) => {
            if (!result) return;

            if ('processSegmentId' in result) {
                this.processSegmentService.update(result.processSegmentId, result).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Process Segment updated',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            } else {
                this.processSegmentService.create(result).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Process Segment created',
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
            message: `Are you sure you want to delete the ${selectedIds.length} selected process segment(s)?`,
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
                // 4. Call service for each ID (or use a bulk delete method if your API supports it)
                // Using forkJoin or similar is ideal for multiple requests, but following your existing pattern:
                selectedIds.forEach((id) => {
                    this.processSegmentService.delete(id).subscribe({
                        next: () => {
                            // Clear selection after successful deletion
                            this.selectedNodes = null;
                        }
                    });
                });

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Selected Process Segments Deleted',
                    life: 3000
                });
            }
        });
    }

    openDeleteDialog(processSegment: ProcessSegment): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Process Segment: ${processSegment.name}`,
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
                this.processSegmentService.delete(processSegment.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Process Segment deleted',
                            summary: 'Success',
                            life: 3000
                        });
                    }
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Process Segment deletion rejected' });
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
