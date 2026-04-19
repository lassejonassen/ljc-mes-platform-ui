import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MaterialDefinitionPropertyDialogData } from './material-definition-property-dialog-data.model';
import { MaterialDefinitionPropertyCreateRequest, MaterialDefinitionPropertyUpdateRequest } from '../../services/material-definition-service';

@Component({
    selector: 'app-material-definition-property-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './material-definition-property-dialog.html',
    styleUrl: './material-definition-property-dialog.scss',
    providers: [DialogService]
})
export class MaterialDefinitionPropertyDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // State
    readonly isEditMode = signal<boolean>(false);

    // Form Logic
    readonly form = this.fb.group({
        name: ['', [Validators.required]],
        value: ['', [Validators.required]],
        description: ['', []],
        dataType: ['', []]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as MaterialDefinitionPropertyDialogData;

        console.log(data);
        if (data) {
            if (data.property) {
                this.isEditMode.set(true);
                this.form.patchValue({
                    name: data.property.name,
                    value: data.property.value,
                    description: data.property.description,
                    dataType: data.property.dataType
                });
            }
        } else {
            throw new Error('MaterialDefinitionPropertyDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            if (this.isEditMode()) {
                const updateRequest: MaterialDefinitionPropertyUpdateRequest = {
                    materialDefinitionId: this.config.data.materialDefinitionId,
                    propertyId: this.config.data.property.id,
                    name: rawValue.name,
                    value: rawValue.value,
                    description: rawValue.description,
                    dataType: rawValue.dataType
                };
                this.ref.close(updateRequest);
            } else {
                const createRequest: MaterialDefinitionPropertyCreateRequest = {
                    materialDefinitionId: this.config.data.materialDefinitionId,
                    name: rawValue.name,
                    value: rawValue.value,
                    description: rawValue.description,
                    dataType: rawValue.dataType
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
