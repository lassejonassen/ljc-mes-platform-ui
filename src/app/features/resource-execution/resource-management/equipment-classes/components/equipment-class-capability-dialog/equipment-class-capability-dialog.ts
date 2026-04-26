import { Component, inject, OnInit, signal } from '@angular/core';
import { EquipmentClassCapabilityCreateRequest, EquipmentClassCapabilityUpdateRequest } from '../../services/equipment-class-service';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { EquipmentClassCapabilityDialogData } from './equipment-class-capability-dialog-data.model';

@Component({
    selector: 'app-equipment-class-capability-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './equipment-class-capability-dialog.html',
    styleUrl: './equipment-class-capability-dialog.scss',
    providers: [DialogService]
})
export class EquipmentClassCapabilityDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // State
    readonly isEditMode = signal<boolean>(false);

    // Form Logic
    readonly form = this.fb.group({
        name: ['', [Validators.required]],
        value: ['', [Validators.required]],
        unitOfMeasure: ['', [Validators.required]]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as EquipmentClassCapabilityDialogData;

        console.log(data);
        if (data) {
            if (data.capability) {
                this.isEditMode.set(true);
                this.form.patchValue({
                    name: data.capability.name,
                    value: data.capability.value,
                    unitOfMeasure: data.capability.unitOfMeasure
                });
            }
        } else {
            throw new Error('EquipmentClassCapabilityDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            if (this.isEditMode()) {
                const updateRequest: EquipmentClassCapabilityUpdateRequest = {
                    equipmentClassId: this.config.data.materialDefinitionId,
                    name: rawValue.name,
                    value: rawValue.value,
                    unitOfMeasure: rawValue.unitOfMeasure
                };
                this.ref.close(updateRequest);
            } else {
                const createRequest: EquipmentClassCapabilityCreateRequest = {
                    equipmentClassId: this.config.data.materialDefinitionId,
                    name: rawValue.name,
                    value: rawValue.value,
                    unitOfMeasure: rawValue.unitOfMeasure
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
