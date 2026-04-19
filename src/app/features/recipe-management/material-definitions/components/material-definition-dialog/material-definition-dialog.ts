import { Component, inject, OnInit, signal } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialDefinitionDialogData } from './material-definition-dialog-data.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MaterialDefinitionCreateRequest, MaterialDefinitionUpdateRequest } from '../../services/material-definition-service';

@Component({
    selector: 'app-material-definition-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './material-definition-dialog.html',
    styleUrl: './material-definition-dialog.scss',
    providers: [DialogService]
})
export class MaterialDefinitionDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // State
    readonly isEditMode = signal<boolean>(false);

    // Form Logic
    readonly form = this.fb.group({
        sku: ['', [Validators.required]],
        name: ['', [Validators.required]]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as MaterialDefinitionDialogData;

        if (data) {
            if (data.materialDefinition) {
                this.isEditMode.set(true);
                this.form.patchValue({
                    sku: data.materialDefinition.sku,
                    name: data.materialDefinition.name
                });
            }
        } else {
            throw new Error('MaterialDefinitionDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            if (this.isEditMode()) {
                const updateRequest: MaterialDefinitionUpdateRequest = {
                    id: this.config.data.materialDefinition.id,
                    name: rawValue.name
                };
                this.ref.close(updateRequest);
            } else {
                const createRequest: MaterialDefinitionCreateRequest = {
                    sku: rawValue.sku,
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
