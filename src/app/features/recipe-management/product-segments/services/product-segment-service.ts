import { ProductSegment } from '@/app/shared/models/recipe-management/product-segments/product-segment.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';

export interface ProductSegmentCreateRequest {
    materialDefinitionId: string;
    processSegmentId: string;
}

export interface ProductSegmentCreateDraftRequest {
    productSegmentId: string;
}

export interface ProductSegmentReleaseRequest {
    productSegmentId: string;
}

export interface ProductSegmentDeprecateRequest {
    id: string;
}

export interface ProductSegmentListResponse {
    data: ProductSegment[];
}

export interface ProductSegmentParameterUpdateRequest {
    productSegmentId: string;
    productSegmentParameterId: string;
    value: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductSegmentService {
    private httpClient = inject(HttpClient);
    private readonly API_URL = `${environment.apiBaseUrl}/product-segments`;

    // State Management
    readonly loading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    // Data Managment
    private readonly _productSegments = signal<ProductSegment[]>([]);
    readonly productSegments = this._productSegments.asReadonly();

    private readonly _productSegment = signal<ProductSegment | undefined>(undefined);
    readonly productSegment = this._productSegment.asReadonly();

    private readonly _latestVersion = signal<number | undefined>(undefined);
    readonly latestVersion = this._latestVersion.asReadonly();

    getAll(): Observable<ProductSegment[]> {
        this.startRequest();
        return this.httpClient.get<ProductSegmentListResponse>(this.API_URL).pipe(
            map((res) => res.data),
            tap((data) => this._productSegments.set(data)),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false)),
            shareReplay(1)
        );
    }

    getById(id: string | number): Observable<ProductSegment> {
        return this.httpClient.get<ProductSegment>(`${this.API_URL}/${id}`).pipe(tap((data) => this._productSegment.set(data)));
    }

    getLatestVersion(id: string | number): Observable<number> {
        return this.httpClient.get<number>(`${this.API_URL}/${id}/latest-version`).pipe();
    }

    create(request: ProductSegmentCreateRequest): Observable<ProductSegment> {
        this.startRequest();

        return this.httpClient.post<string>(this.API_URL, request).pipe(
            switchMap((res) => this.getById(res)),

            tap((newSegment) => {
                this._productSegments.update((items) => [...items, newSegment]);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    createDraft(id: string, request: ProductSegmentCreateDraftRequest): Observable<ProductSegment> {
        this.startRequest();

        return this.httpClient.post<string>(`${this.API_URL}/${id}/drafts`, request).pipe(
            switchMap((res) => this.getById(res)),

            tap((newSegment) => {
                this._productSegments.update((items) => [...items, newSegment]);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    release(id: string | number, content: ProductSegmentReleaseRequest): Observable<void> {
        this.startRequest();

        // We expect 'void' because of 204 No Content
        return this.httpClient.patch<void>(`${this.API_URL}/${id}/release`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._productSegments.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    deprecate(id: string | number, content: ProductSegmentDeprecateRequest): Observable<void> {
        this.startRequest();

        // We expect 'void' because of 204 No Content
        return this.httpClient.patch<void>(`${this.API_URL}/${id}/deprecate`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._productSegments.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    updateParameter(id: string, parameterId: string, content: ProductSegmentParameterUpdateRequest): Observable<ProductSegment> {
        this.startRequest();
        return this.httpClient.put<void>(`${this.API_URL}/${id}/parameters/${parameterId}`, content).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedSegment) => {
                this.syncState(id, updatedSegment);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    delete(id: string | number): Observable<void> {
        this.startRequest();
        return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
            tap(() => {
                this._productSegments.update((items) => items.filter((item) => item.id !== id));
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

    private syncState(id: string | number, updatedSegment: ProductSegment): void {
        // 1. Update the single "currently viewed" definition signal
        this._productSegment.set(updatedSegment);

        // 2. Update the specific item in the list signal
        this._productSegments.update((items) => items.map((item) => (item.id === id ? updatedSegment : item)));
    }
}
