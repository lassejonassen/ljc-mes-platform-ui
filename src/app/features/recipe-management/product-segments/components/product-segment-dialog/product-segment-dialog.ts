import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaterialDefinitionService } from '../../../material-definitions/services/material-definition-service';
import { ProcessSegmentService } from '../../../process-segments/services/process-segment-service';
import { ProductSegmentCreateRequest } from '../../services/product-segment-service';
import { MaterialDefinition } from '@/app/shared/models/recipe-management/material-definitions/material-definition.model';
import { ProcessSegment } from '@/app/shared/models/recipe-management/process-segments/process-segment.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-product-segment-dialog',
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
    templateUrl: './product-segment-dialog.html',
    styleUrl: './product-segment-dialog.scss'
})
export class ProductSegmentDialog implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly ref = inject(DynamicDialogRef);
    private readonly materialDefinitionService = inject(MaterialDefinitionService);
    private readonly processSegmentService = inject(ProcessSegmentService);

    // Form Logic
    readonly form = this.fb.group({
        materialDefinition: ['', [Validators.required]],
        processSegment: ['', [Validators.required]]
    });
    formSubmitted: boolean = false;

    processSegments = this.processSegmentService.processSegments;
    materialDefinitions = this.materialDefinitionService.materialDefinitions;

    ngOnInit(): void {
        this.processSegmentService.getReleased().subscribe();
        this.materialDefinitionService.getReleased().subscribe();
    }

    save(): void {
        this.formSubmitted = true;
        if (this.form.valid) {
            const rawValue = this.form.getRawValue();
            const createRequest: ProductSegmentCreateRequest = {
                materialDefinitionId: rawValue.materialDefinition,
                processSegmentId: rawValue.processSegment
            };
            this.ref.close(createRequest);
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
