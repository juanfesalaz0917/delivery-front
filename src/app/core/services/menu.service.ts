import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private  readonly api = inject(ApiService);// el readonly se usa para que la propiedad no pueda ser reasignada
  private readonly endpoint= 'menus'; // <- cambia por tu endpoint

  //la inyeccion de dependencias se hace con inject en lugar de constructor, esto es una nueva forma en Angular 14+, un poco mas limpia
  getAll(page= 1, limit=10): Observable<any> {
     return this.api.get<Menu[]>(this.endpoint, { page, limit });
  }

  getByRestaurantId(id: string | number): Observable<Menu> {
    return this.api.get<Menu>(`${this.endpoint}/${id}`);
  }

  create(payload: Menu): Observable<Menu> {
    return this.api.post<Menu>(this.endpoint, payload);
  }

  update(id: string | number, payload: Menu): Observable<Menu> {
    return this.api.put<Menu>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}

