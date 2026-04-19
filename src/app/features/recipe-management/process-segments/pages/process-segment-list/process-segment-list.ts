import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
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

@Component({
    selector: 'app-process-segment-list',
    imports: [ToolbarModule, ButtonModule, TableModule, IconFieldModule, InputTextModule, InputIconModule, ToastModule, ConfirmDialogModule, TooltipModule, RouterLink],
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

    selectedProcessSegments!: ProcessSegment[] | null;

    ngOnInit(): void {
        // Trigger the load - the Signal handles the notification.
        this.processSegmentService.getAll().subscribe();
    }

    refresh(): void {
        this.processSegmentService.getAll().subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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

    deleteSelected(): void {}
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
}
