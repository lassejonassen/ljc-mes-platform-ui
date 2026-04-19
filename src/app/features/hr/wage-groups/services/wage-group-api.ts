import { WageGroup, WageGroupListResponse } from '@/app/shared/models/wage-group.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, shareReplay, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WageGroupApi {
    private httpClient = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7170/api/wage-groups';

    // State Management
    readonly loading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    // Data Management
    private readonly _wageGroups = signal<WageGroup[]>([]);
    readonly wageGroups = this._wageGroups.asReadonly();

    getAll(): Observable<WageGroup[]> {
        this.error.set(null);
        this.loading.set(true);

        return this.httpClient.get<WageGroupListResponse>(this.API_URL).pipe(
            map((res) => res.data), // Transform the response immediately
            tap((data) => this._wageGroups.set(data)),
            catchError((err) => {
                const msg = this.getErrorMessage(err);
                this.error.set(msg);
                console.error('WageGroup Fetch Error:', err);
                return throwError(() => new Error(msg));
            }),
            finalize(() => this.loading.set(false)),
            shareReplay(1) // Prevent multiple network calls for late subscribers
        );
    }

    getById(id: string): Observable<WageGroup> {
        this.error.set(null);
        this.loading.set(true);

        return this.httpClient.get<WageGroup>(`${this.API_URL}/${id}`).pipe(
            catchError((err) => {
                const msg = this.getErrorMessage(err);
                this.error.set(msg);
                console.error('WageGroup Fetch Error:', err);
                return throwError(() => new Error(msg));
            }),
            finalize(() => this.loading.set(false)),
            shareReplay(1) // Prevent multiple network calls for late subscribers
        );
    }

    private getErrorMessage(error: any): string {
        return error?.error?.message || error?.message || 'An unknown error occurred';
    }
}
