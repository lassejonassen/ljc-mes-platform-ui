import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProductSegmentParameterDialogData } from './product-segment-parameter-dialog-data.model';
import { ProductSegmentParameterUpdateRequest } from '../../services/product-segment-service';

@Component({
    selector: 'app-product-segment-parameter-dialog',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule, CheckboxModule],
    templateUrl: './product-segment-parameter-dialog.html',
    styleUrl: './product-segment-parameter-dialog.scss',
    providers: [DialogService]
})
export class ProductSegmentParameterDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);

    // Form Logic
    readonly form = this.fb.group({
        name: ['', [Validators.required]],
        value: ['', [Validators.required]],
        description: ['', [Validators.required]],
        dataType: ['', [Validators.required]]
    });
    formSubmitted: boolean = false;

    ngOnInit(): void {
        const data = this.config.data as ProductSegmentParameterDialogData;

        console.log(data);
        if (data) {
            if (data.parameter) {
                this.form.patchValue({
                    name: data.parameter.name,
                    value: data.parameter.value,
                    description: data.parameter.description,
                    dataType: data.parameter.dataType
                });
            }
        } else {
            throw new Error('ProductSegmentParameterDialog was opened with wrong configuration.');
        }
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            const updateRequest: ProductSegmentParameterUpdateRequest = {
                productSegmentId: this.config.data.productSegmentId,
                productSegmentParameterId: this.config.data.parameter.id,
                value: rawValue.value
            };
            this.ref.close(updateRequest);
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
