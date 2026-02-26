import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Family } from '../../models/family.model';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private apiUrl = `${environment.apiUrl}/api/families`;

  constructor(private http: HttpClient) {}

  getAllFamilies(): Observable<Family[]> {
    return this.http.get<Family[]>(this.apiUrl);
  }

  createFamily(family: Family): Observable<Family> {
    return this.http.post<Family>(this.apiUrl, family);
  }
}

