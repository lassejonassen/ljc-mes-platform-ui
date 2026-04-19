import { Component, inject, OnInit, signal } from '@angular/core';
import { ProcessSegmentDialogData } from './process-segment-dialog-data.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ProcessSegmentUpdateRequest, ProcessSegmentCreateRequest } from '../../services/process-segment-service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-process-segment-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './process-segment-dialog.html',
    styleUrl: './process-segment-dialog.scss',
    providers: [DialogService]
})
export class ProcessSegmentDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // State
    readonly isEditMode = signal<boolean>(false);

    // Form Logic
    readonly form = this.fb.group({
        name: ['', [Validators.required]]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as ProcessSegmentDialogData;
        if (data) {
            if (data.processSegment) {
                this.isEditMode.set(true);
                this.form.patchValue({
                    name: data.processSegment.name
                });
            }
        } else {
            throw new Error('ProcessSegmentDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            if (this.isEditMode()) {
                const updateRequest: ProcessSegmentUpdateRequest = {
                    processSegmentId: this.config.data.processSegment.id,
                    name: rawValue.name
                };
                this.ref.close(updateRequest);
            } else {
                const createRequest: ProcessSegmentCreateRequest = {
                    name: rawValue.name
                };
                this.ref.close(createRequest);
            }
        }
    }

    cancel(): void {
        this.ref.close();
    }

    isInvalid(controlName: string) {
        const control = this.form.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }
}
