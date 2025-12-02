import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { Customer } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'customers';

  getAll(page = 1, limit = 10): Observable<Customer[]> {
    return this.api.get<Customer[]>(this.endpoint, { page, limit });
  }

  getById(id: number): Observable<Customer> {
    return this.api.get<Customer>(`${this.endpoint}/${id}`);
  }

  create(customer: Customer): Observable<Customer> {
    return this.api.post<Customer>(this.endpoint, customer);
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.api.put<Customer>(`${this.endpoint}/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
