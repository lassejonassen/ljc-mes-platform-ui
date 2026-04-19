import { MaterialDefinition } from '@/app/shared/models/recipe-management/material-definitions/material-definition.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';

export interface MaterialDefinitionCreateRequest {
    sku: string;
    name: string;
}

export interface MaterialDefinitionCreateDraftRequest {
    materialDefinitionId: string;
}

export interface MaterialDefinitionReleaseRequest {
    id: string;
}

export interface MaterialDefinitionDeprecateRequest {
    id: string;
}

export interface MaterialDefinitionUpdateRequest {
    id: string;
    name: string;
}

export interface MaterialDefinitionListResponse {
    data: MaterialDefinition[];
}

export interface MaterialDefinitionPropertyCreateRequest {
    materialDefinitionId: string;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
}

export interface MaterialDefinitionPropertyUpdateRequest {
    materialDefinitionId: string;
    propertyId: string;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MaterialDefinitionService {
    private httpClient = inject(HttpClient);
    private readonly API_URL = `${environment.apiBaseUrl}/material-definitions`;

    // State Management
    readonly loading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    // Data Managment
    private readonly _materialDefinitions = signal<MaterialDefinition[]>([]);
    readonly materialDefinitions = this._materialDefinitions.asReadonly();

    private readonly _materialDefinition = signal<MaterialDefinition | undefined>(undefined);
    readonly materialDefinition = this._materialDefinition.asReadonly();

    getAll(): Observable<MaterialDefinition[]> {
        this.startRequest();
        return this.httpClient.get<MaterialDefinitionListResponse>(this.API_URL).pipe(
            map((res) => res.data),
            tap((data) => this._materialDefinitions.set(data)),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false)),
            shareReplay(1)
        );
    }

    getById(id: string | number): Observable<MaterialDefinition> {
        return this.httpClient.get<MaterialDefinition>(`${this.API_URL}/${id}`).pipe(tap((data) => this._materialDefinition.set(data)));
    }

    create(request: MaterialDefinitionCreateRequest): Observable<MaterialDefinition> {
        this.startRequest();

        return this.httpClient.post<string>(this.API_URL, request).pipe(
            // switchMap "switches" the stream from the ID response to the GetById response
            switchMap((res) => this.getById(res)),

            tap((newFullDefinition) => {
                // Now you are pushing the actual server-validated object into your list
                this._materialDefinitions.update((items) => [...items, newFullDefinition]);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    createDraft(id: string, request: MaterialDefinitionCreateDraftRequest): Observable<MaterialDefinition> {
        this.startRequest();

        return this.httpClient.post<string>(`${this.API_URL}/${id}/drafts`, request).pipe(
            // switchMap "switches" the stream from the ID response to the GetById response
            switchMap((res) => this.getById(res)),

            tap((newFullDefinition) => {
                // Now you are pushing the actual server-validated object into your list
                this._materialDefinitions.update((items) => [...items, newFullDefinition]);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    createProperty(id: string, content: MaterialDefinitionPropertyCreateRequest): Observable<MaterialDefinition> {
        this.startRequest();

        return this.httpClient.post<void>(`${this.API_URL}/${id}/properties`, content).pipe(
            // switchMap changes the stream type from 'void' to 'MaterialDefinition'
            switchMap(() => this.getById(id)),
            tap((updatedDefinition) => {
                this.syncState(id, updatedDefinition);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    release(id: string | number, content: MaterialDefinitionReleaseRequest): Observable<void> {
        this.startRequest();

        // We expect 'void' because of 204 No Content
        return this.httpClient.patch<void>(`${this.API_URL}/${id}/release`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._materialDefinitions.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    deprecate(id: string | number, content: MaterialDefinitionDeprecateRequest): Observable<void> {
        this.startRequest();

        // We expect 'void' because of 204 No Content
        return this.httpClient.patch<void>(`${this.API_URL}/${id}/deprecate`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._materialDefinitions.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    update(id: string | number, content: MaterialDefinitionUpdateRequest): Observable<void> {
        this.startRequest();

        // We expect 'void' because of 204 No Content
        return this.httpClient.put<void>(`${this.API_URL}/${id}`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._materialDefinitions.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    updateProperty(id: string, propertyId: string, content: MaterialDefinitionPropertyUpdateRequest): Observable<MaterialDefinition> {
        this.startRequest();
        return this.httpClient.put<void>(`${this.API_URL}/${id}/properties/${propertyId}`, content).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedDefinition) => {
                this.syncState(id, updatedDefinition);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    delete(id: string | number): Observable<void> {
        this.startRequest();
        return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
            tap(() => {
                this._materialDefinitions.update((items) => items.filter((item) => item.id !== id));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    deleteProperty(id: string, propertyId: string): Observable<MaterialDefinition> {
        this.startRequest();
        return this.httpClient.delete<void>(`${this.API_URL}/${id}/properties/${propertyId}`).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedDefinition) => {
                this.syncState(id, updatedDefinition);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    private startRequest(): void {
        this.error.set(null);
        this.loading.set(true);
    }

    private handleError(err: any): Observable<never> {
        const msg = this.getErrorMessage(err);
        this.error.set(msg);
        return throwError(() => new Error(msg));
    }

    private getErrorMessage(error: any): string {
        return error?.error?.message || error?.message || 'An unknown error occurred';
    }

    private syncState(id: string | number, updatedDefinition: MaterialDefinition): void {
        // 1. Update the single "currently viewed" definition signal
        this._materialDefinition.set(updatedDefinition);

        // 2. Update the specific item in the list signal
        this._materialDefinitions.update((items) => items.map((item) => (item.id === id ? updatedDefinition : item)));
    }
}
