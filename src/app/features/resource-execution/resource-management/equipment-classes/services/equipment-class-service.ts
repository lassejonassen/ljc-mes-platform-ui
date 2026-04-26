import { EquipmentClass } from '@/app/shared/models/resource-execution/resource-management/equipment-classes/equipment-class.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, map, tap, catchError, finalize, shareReplay, throwError, switchMap } from 'rxjs';

export interface EquipmentClassCreateRequest {
    name: string;
    description?: string;
}

export interface EquipmentClassUpdateRequest {
    id: string;
    name: string;
    description?: string;
}

export interface EquipmentClassListResponse {
    data: EquipmentClass[];
}

export interface EquipmentClassCapabilityCreateRequest {
    equipmentClassId: string;
    name: string;
    value: string;
    unitOfMeasure: string;
}

export interface EquipmentClassCapabilityUpdateRequest {
    equipmentClassId: string;
    name: string;
    value: string;
    unitOfMeasure: string;
}

export interface EquipmentClassCapabilityDeleteRequest {
    equipmentClassId: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class EquipmentClassService {
    private httpClient = inject(HttpClient);
    private readonly API_URL = `${environment.apiBaseUrl}/`;

    // State Management
    readonly loading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    // Data Managment
    private readonly _equipmentClasses = signal<EquipmentClass[]>([]);
    readonly equipmentClasses = this._equipmentClasses.asReadonly();

    private readonly _equipmentClass = signal<EquipmentClass | undefined>(undefined);
    readonly equipmentClass = this._equipmentClass.asReadonly();

    private readonly _latestVersion = signal<number | undefined>(undefined);
    readonly latestVersion = this._latestVersion.asReadonly();

    getAll(): Observable<EquipmentClass[]> {
        this.startRequest();
        return this.httpClient.get<EquipmentClassListResponse>(this.API_URL).pipe(
            map((res) => res.data),
            tap((data) => this._equipmentClasses.set(data)),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false)),
            shareReplay(1)
        );
    }

    getById(id: string | number): Observable<EquipmentClass> {
        return this.httpClient.get<EquipmentClass>(`${this.API_URL}/${id}`).pipe(tap((data) => this._equipmentClass.set(data)));
    }

    create(request: EquipmentClassCreateRequest): Observable<EquipmentClass> {
        this.startRequest();

        return this.httpClient.post<string>(this.API_URL, request).pipe(
            // switchMap "switches" the stream from the ID response to the GetById response
            switchMap((res) => this.getById(res)),

            tap((newEquipmentClass) => {
                // Now you are pushing the actual server-validated object into your list
                this._equipmentClasses.update((items) => [...items, newEquipmentClass]);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    update(id: string | number, content: EquipmentClassUpdateRequest): Observable<void> {
        this.startRequest();

        // We expect 'void' because of 204 No Content
        return this.httpClient.put<void>(`${this.API_URL}/${id}`, content).pipe(
            tap(() => {
                // Update the local signal using the data we sent to the server
                this._equipmentClasses.update((items) => items.map((item) => (item.id === id ? { ...item, ...content } : item)));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    delete(id: string | number): Observable<void> {
        this.startRequest();
        return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
            tap(() => {
                this._equipmentClasses.update((items) => items.filter((item) => item.id !== id));
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    createCapability(id: string | number, content: EquipmentClassCapabilityCreateRequest): Observable<EquipmentClass> {
        this.startRequest();

        return this.httpClient.post<void>(`${this.API_URL}/${id}/capabilities`, content).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedEquipmentClass) => {
                this.syncState(id, updatedEquipmentClass);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    updateCapability(id: string | number, content: EquipmentClassCapabilityUpdateRequest): Observable<EquipmentClass> {
        this.startRequest();

        return this.httpClient.put<void>(`${this.API_URL}/${id}/capabilties`, content).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedEquipmentClass) => {
                this.syncState(id, updatedEquipmentClass);
            }),
            catchError((err) => this.handleError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    deleteCapability(id: string | number, name: string): Observable<EquipmentClass> {
        var params = new HttpParams();
        params.append('name', name);

        this.startRequest();
        return this.httpClient.delete<void>(`${this.API_URL}/${id}/capabilties`, { params }).pipe(
            switchMap(() => this.getById(id)),
            tap((updatedEquipmentClass) => {
                this.syncState(id, updatedEquipmentClass);
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

    private syncState(id: string | number, updatedEquipmentClass: EquipmentClass): void {
        // 1. Update the single "currently viewed" definition signal
        this._equipmentClass.set(updatedEquipmentClass);

        // 2. Update the specific item in the list signal
        this._equipmentClasses.update((items) => items.map((item) => (item.id === id ? updatedEquipmentClass : item)));
    }
}
