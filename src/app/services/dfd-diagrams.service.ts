import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DfdDiagramCreateUpdateDto, DfdDiagramDto } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DfdDiagramsService {
  private api = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getForProject(projectId: number): Observable<DfdDiagramDto[]> {
    return this.http.get<DfdDiagramDto[]>(`${this.api}/projects/${projectId}/dfd-diagrams`);
  }

  getById(id: number): Observable<DfdDiagramDto> {
    return this.http.get<DfdDiagramDto>(`${this.api}/dfd-diagrams/${id}`);
  }

  create(projectId: number, dto: DfdDiagramCreateUpdateDto): Observable<DfdDiagramDto> {
    return this.http.post<DfdDiagramDto>(`${this.api}/projects/${projectId}/dfd-diagrams`, dto);
  }

  update(id: number, dto: DfdDiagramCreateUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.api}/dfd-diagrams/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/dfd-diagrams/${id}`);
  }
}
