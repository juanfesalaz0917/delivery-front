import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private  readonly api = inject(ApiService);
  private readonly endpoint= 'restaurants'; // <- cambia por tu endpoint

  getAll(page= 1, limit=10): Observable<any> {
     return this.api.get<Restaurant[]>(this.endpoint, { page, limit });
  }

  getById(id: string | number): Observable<Restaurant> {
    return this.api.get<Restaurant>(`${this.endpoint}/${id}`);
  }

  create(payload: Restaurant): Observable<Restaurant> {
    return this.api.post<Restaurant>(this.endpoint, payload);
  }

  update(id: string | number, payload: Restaurant): Observable<Restaurant> {
    return this.api.put<Restaurant>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}

