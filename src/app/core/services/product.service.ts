import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product,} from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private  readonly api = inject(ApiService);
  private readonly endpoint= 'products'; // <- cambia por tu endpoint

  getAll(page= 1, limit=10): Observable<any> {
     return this.api.get<Product[]>(this.endpoint, { page, limit });
  }

  getById(id: string | number): Observable<Product> {
    return this.api.get<Product>(`${this.endpoint}/${id}`);
  }

  create(payload: Product): Observable<Product> {
    return this.api.post<Product>(this.endpoint, payload);
  }

  update(id: string | number, payload: Product): Observable<Product> {
    return this.api.put<Product>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}

