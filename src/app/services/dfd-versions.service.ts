import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DfdDiagramVersionCreateDto, DfdDiagramVersionDto } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DfdVersionsService {
  private api = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getForDiagram(diagramId: number): Observable<DfdDiagramVersionDto[]> {
    return this.http.get<DfdDiagramVersionDto[]>(`${this.api}/dfd-diagrams/${diagramId}/versions`);
  }

  getById(versionId: number): Observable<DfdDiagramVersionDto> {
    return this.http.get<DfdDiagramVersionDto>(`${this.api}/dfd-diagram-versions/${versionId}`);
  }

  create(diagramId: number, dto: DfdDiagramVersionCreateDto): Observable<DfdDiagramVersionDto> {
    return this.http.post<DfdDiagramVersionDto>(`${this.api}/dfd-diagrams/${diagramId}/versions`, dto);
  }
}
