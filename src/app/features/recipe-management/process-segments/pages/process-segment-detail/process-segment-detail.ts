import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProcessSegmentParameterCreateRequest, ProcessSegmentParameterUpdateRequest, ProcessSegmentService } from '../../services/process-segment-service';
import { ProcessSegmentParameter } from '@/app/shared/models/recipe-management/process-segments/process-segment-parameter.model';
import { ProcessSegmentParameterDialogData } from '../../components/process-segment-parameter-dialog/process-segment-parameter-dialog-data.model';
import { ProcessSegmentParameterDialog } from '../../components/process-segment-parameter-dialog/process-segment-parameter-dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-process-segment-detail',
    imports: [FormsModule, CommonModule, RouterLink, ToolbarModule, ButtonModule, TooltipModule, TableModule, IconFieldModule, InputIconModule, ToastModule, ConfirmDialogModule, InputTextModule, CheckboxModule],
    templateUrl: './process-segment-detail.html',
    styleUrl: './process-segment-detail.scss',
    providers: [ConfirmationService, MessageService, DialogService]
})
export class ProcessSegmentDetail implements OnInit {
    @ViewChild('dt') dt!: Table;

    private route = inject(ActivatedRoute);
    private processSegmentService = inject(ProcessSegmentService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);

    processSegment = this.processSegmentService.processSegment;
    loading = this.processSegmentService.loading;
    error = this.processSegmentService.error;

    processSegmentId!: string;
    selectedParameters!: ProcessSegmentParameter[] | null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.processSegmentId = id;
            // 2. We just trigger the call; the Service signal handles the data flow
            this.processSegmentService.getById(id).subscribe({
                next: (data) => {
                    // We update the service's private signal via a sync (if your service has the syncState helper)
                    // Or simply ensure your getById in the service sets the signal.
                    // If your getById doesn't set the signal yet, see the Service adjustment below.
                }
            });
        }
    }

    refresh(): void {
        this.processSegmentService.getById(this.processSegmentId).subscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    showProcessSegmentParameterDialog(parameter?: ProcessSegmentParameter): void {
        const data: ProcessSegmentParameterDialogData = {
            parameter: parameter,
            processSegmentId: this.processSegmentId
        };

        const ref = this.dialogService.open(ProcessSegmentParameterDialog, {
            header: parameter ? 'Edit Parameter' : 'Add new Parameter',
            width: '30vw',
            data
        });

        ref!.onClose.subscribe((result: ProcessSegmentParameterCreateRequest | ProcessSegmentParameterUpdateRequest | undefined) => {
            if (!result) return;

            if ('parameterId' in result) {
                this.processSegmentService.updateParameter(result.processSegmentId, result.parameterId, result).subscribe({
                    next: () => this.showSuccess('Parameter updated')
                });
            } else {
                this.processSegmentService.createProperty(result.processSegmentId, result).subscribe({
                    next: () => this.showSuccess('Parameter created')
                });
            }
        });
    }

    deleteSelected(): void {}
    openDeleteDialog(processSegmentParameter: ProcessSegmentParameter): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete Process Segment Parameter: ${processSegmentParameter.name} `,
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
                this.processSegmentService.deleteParameter(processSegmentParameter.processSegmentId, processSegmentParameter.id).subscribe({
                    next: () => this.showSuccess('Property deleted')
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Process Segment Parameter deletion rejected' });
            }
        });
    }

    exportCSV(): void {}

    private showSuccess(message: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    }
}
