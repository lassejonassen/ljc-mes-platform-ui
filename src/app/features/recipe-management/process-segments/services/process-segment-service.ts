import { ProcessSegment } from '@/app/shared/models/recipe-management/process-segments/process-segment.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';

export interface ProcessSegmentCreateRequest {
    name: string;
}

export interface ProcessSegmentUpdateRequest {
    processSegmentId: string;
    name: string;
}

export interface ProcessSegmentListResponse {
    data: ProcessSegment[];
}

export interface ProcessSegmentParameterCreateRequest {
    processSegmentId: string;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
    isReadOnly: boolean;
    defaultValue: string;
}

export interface ProcessSegmentParameterUpdateRequest {
    processSegmentId: string;
    parameterId: string;
    name: string;
    value: string;
    dataType?: string;
    description?: string;
    isReadOnly: boolean;
    defaultValue: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProcessSegmentService {
    private httpClient = inject(HttpClient);
    private readonly API_URL = `${environment.apiBaseUrl}/process-segments`;

    // State Management
    readonly loading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    // Data Managment
    private readonly _processSegments = signal<ProcessSegment[]>([]);
    readonly processSegments = this._processSegments.asReadonly();

    private readonly _processSegment = signal<ProcessSegment | undefined>(undefined);
    readonly processSegment = this._processSegment.asReadonly();

    getAll(): Observable<ProcessSegment[]> {
        this.startRequest();
        return this.httpClient.get<ProcessSegmentListResponse>(this.API_URL).pipe(
            map((res) => res.data),
            tap((data) => this._processSegments.set(data)),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false)),
            shareReplay(1)
        );
    }

    getById(id: string | number): Observable<ProcessSegment> {
        return this.httpClient.get<ProcessSegment>(`${this.API_URL}/${id}`).pipe(tap((data) => this._processSegment.set(data)));
    }

    create(request: ProcessSegmentCreateRequest): Observable<ProcessSegment> {
        this.startRequest();

        return this.httpClient.post<string>(this.API_URL, request).pipe(
            // switchMap "switches" the stream from the ID response to the GetById response
            switchMap((res) => this.getById(res)),

            tap((newSegment) => {
                // Now you are pushing the actual server-validated object into your list
                this._processSegments.update((items) => [...items, newSegment]);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    createProperty(id: string, content: ProcessSegmentParameterCreateRequest): Observable<ProcessSegment> {
        this.startRequest();

        return this.httpClient.post<void>(`${this.API_URL}/${id}/parameters`, content).pipe(
            // switchMap changes the stream type from 'void' to 'MaterialDefinition'
            switchMap(() => this.getById(id)),
            tap((updatedSegment) => {
                this.syncState(id, updatedSegment);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    update(id: string | number, content: ProcessSegmentUpdateRequest): Observable<void> {
        this.startRequest();

        console.log(id, content);

        // We expect 'void' because of 204 No Content
        return this.httpClient.put<void>(`${this.API_URL}/${id}`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._processSegments.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    updateParameter(id: string, parameterId: string, content: ProcessSegmentParameterUpdateRequest): Observable<ProcessSegment> {
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
                this._processSegments.update((items) => items.filter((item) => item.id !== id));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    deleteParameter(id: string, parameterId: string): Observable<ProcessSegment> {
        this.startRequest();
        return this.httpClient.delete<void>(`${this.API_URL}/${id}/parameters/${parameterId}`).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedSegment) => {
                this.syncState(id, updatedSegment);
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

    private syncState(id: string | number, updatedSegment: ProcessSegment): void {
        // 1. Update the single "currently viewed" definition signal
        this._processSegment.set(updatedSegment);

        // 2. Update the specific item in the list signal
        this._processSegments.update((items) => items.map((item) => (item.id === id ? updatedSegment : item)));
    }
}
