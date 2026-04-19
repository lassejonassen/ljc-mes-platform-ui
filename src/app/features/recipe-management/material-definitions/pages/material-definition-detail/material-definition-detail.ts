import { MaterialDefinition } from '@/app/shared/models/recipe-management/material-definitions/material-definition.model';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialDefinitionService } from '../../services/material-definition-service';

@Component({
    selector: 'app-material-definition-detail',
    imports: [RouterLink],
    templateUrl: './material-definition-detail.html',
    styleUrl: './material-definition-detail.scss'
})
export class MaterialDefinitionDetail implements OnInit {
    private route = inject(ActivatedRoute);
    private service = inject(MaterialDefinitionService);

    material = signal<MaterialDefinition | null>(null);
    isLoading = signal(true);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.service.getById(id).subscribe({
                next: (data) => {
                    this.material.set(data);
                    this.isLoading.set(false);
                },
                error: () => this.isLoading.set(false)
            });
        }
    }
}
