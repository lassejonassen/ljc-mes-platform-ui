import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProcessSegmentParameterDialogData } from './process-segment-parameter-dialog-data.model';
import { ProcessSegmentParameterCreateRequest, ProcessSegmentParameterUpdateRequest } from '../../services/process-segment-service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-process-segment-parameter-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule, CheckboxModule],
    templateUrl: './process-segment-parameter-dialog.html',
    styleUrl: './process-segment-parameter-dialog.scss',
    providers: [DialogService]
})
export class ProcessSegmentParameterDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // State
    readonly isEditMode = signal<boolean>(false);

    // Form Logic
    readonly form = this.fb.group({
        name: ['', [Validators.required]],
        description: ['', []],
        dataType: ['', []],
        isReadOnly: [false, [Validators.required]],
        defaultValue: ['', [Validators.required]]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as ProcessSegmentParameterDialogData;

        console.log(data);
        if (data) {
            if (data.parameter) {
                this.isEditMode.set(true);
                this.form.patchValue({
                    name: data.parameter.name,
                    defaultValue: data.parameter.value,
                    description: data.parameter.description,
                    dataType: data.parameter.dataType,
                    isReadOnly: data.parameter.isReadOnly
                });
            }
        } else {
            throw new Error('ProcessSegmentParameterDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            if (this.isEditMode()) {
                const updateRequest: ProcessSegmentParameterUpdateRequest = {
                    processSegmentId: this.config.data.processSegmentId,
                    parameterId: this.config.data.parameter.id,
                    name: rawValue.name,
                    value: rawValue.defaultValue,
                    description: rawValue.description,
                    dataType: rawValue.dataType,
                    isReadOnly: rawValue.isReadOnly
                };
                this.ref.close(updateRequest);
            } else {
                const createRequest: ProcessSegmentParameterCreateRequest = {
                    processSegmentId: this.config.data.processSegmentId,
                    name: rawValue.name,
                    value: rawValue.defaultValue,
                    description: rawValue.description,
                    dataType: rawValue.dataType,
                    isReadOnly: rawValue.isReadOnly
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
