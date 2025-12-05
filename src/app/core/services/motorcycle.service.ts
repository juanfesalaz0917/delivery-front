import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Motorcycle } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MotorcycleService {
  private readonly api = inject(ApiService);
  private readonly endpoint = `motorcycles`;

  getAll(page: number = 1, limit: number = 10): Observable<Motorcycle[]> {
    return this.api.get<Motorcycle[]>(this.endpoint, { page, limit });
  }

  getById(id: string): Observable<Motorcycle> {
    return this.api.get<Motorcycle>(`${this.endpoint}/${id}`);
  }

  create(motorcycle: Motorcycle): Observable<Motorcycle> {
    return this.api.post<Motorcycle>(this.endpoint, motorcycle);
  }

  update(id: string, motorcycle: Motorcycle): Observable<Motorcycle> {
    return this.api.put<Motorcycle>(`${this.endpoint}/${id}`, motorcycle);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getAvailableMotorcycles(): Observable<Motorcycle[]> {
    return this.api.get<Motorcycle[]>(`${this.endpoint}/available`);
  }

  getByDriverId(driverId: string): Observable<Motorcycle[]> {
    return this.api.get<Motorcycle[]>(`${this.endpoint}/driver/${driverId}`);
  }

  updateStatus(id: string, status: Motorcycle['status']): Observable<Motorcycle> {
    return this.api.patch<Motorcycle>(`${this.endpoint}/${id}/status`, { status });
  }
}