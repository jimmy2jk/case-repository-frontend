import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { ProjectDto } from '../../models/api.models';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {
  projects: ProjectDto[] = [];
  error?: string;

  name = '';
  description = '';

  constructor(private projectsService: ProjectsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = undefined;
    this.projectsService.getAll().subscribe({
      next: data => (this.projects = data),
      error: err => (this.error = 'Failed to load projects')
    });
  }

  create(): void {
    if (!this.name.trim()) return;

    this.projectsService.create({ name: this.name.trim(), description: this.description || null }).subscribe({
      next: () => {
        this.name = '';
        this.description = '';
        this.load();
      },
      error: () => (this.error = 'Failed to create project')
    });
  }

  open(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'diagrams']);
  }

  delete(projectId: number): void {
    if (!confirm('Delete project?')) return;
    this.projectsService.delete(projectId).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete project')
    });
  }
}
