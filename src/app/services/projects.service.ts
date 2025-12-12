import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ProjectCreateUpdateDto, ProjectDto } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private base = `${environment.apiBaseUrl}/api/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(this.base);
  }

  getById(id: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.base}/${id}`);
  }

  create(dto: ProjectCreateUpdateDto): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.base, dto);
  }

  update(id: number, dto: ProjectCreateUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
