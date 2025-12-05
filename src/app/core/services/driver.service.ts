import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Driver } from '../models';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly api = inject(ApiService);
  private readonly endpoint = `drivers`;

  getAll(page: number = 1, limit: number = 10): Observable<Driver[]> {
    return this.api.get<Driver[]>(this.endpoint, { page, limit });
  }

  getById(id: string): Observable<Driver> {
    return this.api.get<Driver>(`${this.endpoint}/${id}`);
  }

  create(driver: Driver): Observable<Driver> {
    return this.api.post<Driver>(this.endpoint, driver);
  }

  update(id: string, driver: Driver): Observable<Driver> {
    return this.api.put<Driver>(`${this.endpoint}/${id}`, driver);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getActiveDrivers(): Observable<Driver[]> {
    return this.api.get<Driver[]>(`${this.endpoint}/active`);
  }

  updateStatus(id: string, status: Driver['status']): Observable<Driver> {
    return this.api.patch<Driver>(`${this.endpoint}/${id}/status`, { status });
  }
}