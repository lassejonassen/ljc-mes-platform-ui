import { Component, inject, OnInit, signal } from '@angular/core';
import { EquipmentClassDialogData } from './equipment-class-dialog-data.model';
import { EquipmentClassCreateRequest, EquipmentClassUpdateRequest } from '../../services/equipment-class-service';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-equipment-class-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './equipment-class-dialog.html',
    styleUrl: './equipment-class-dialog.scss',
    providers: [DialogService]
})
export class EquipmentClassDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // State
    readonly isEditMode = signal<boolean>(false);

    // Form Logic
    readonly form = this.fb.group({
        name: ['', [Validators.required]],
        description: ['', []]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as EquipmentClassDialogData;
        if (data) {
            if (data.equipmentClass) {
                this.isEditMode.set(true);
                this.form.patchValue({
                    name: data.equipmentClass.name,
                    description: data.equipmentClass.description
                });
            }
        } else {
            throw new Error('EquipmentClassDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            if (this.isEditMode()) {
                const updateRequest: EquipmentClassUpdateRequest = {
                    id: this.config.data.equipmentClass.id,
                    name: rawValue.name,
                    description: rawValue.description
                };
                this.ref.close(updateRequest);
            } else {
                const createRequest: EquipmentClassCreateRequest = {
                    name: rawValue.name,
                    description: rawValue.description
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
