import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private  readonly api = inject(ApiService);
  private readonly endpoint= 'orders'; // <- cambia por tu endpoint

  getAll(page= 1, limit=10): Observable<any> {
     return this.api.get<Order[]>(this.endpoint, { page, limit });
  }

  getById(id: string | number): Observable<Order> {
    return this.api.get<Order>(`${this.endpoint}/${id}`);
  }

  create(payload: Order): Observable<Order> {
    return this.api.post<Order>(this.endpoint, payload);
  }

  update(id: string | number, payload: Order): Observable<Order> {
    return this.api.put<Order>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}

