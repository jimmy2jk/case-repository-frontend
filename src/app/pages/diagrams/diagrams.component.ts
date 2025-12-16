import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DfdDiagramsService } from '../../services/dfd-diagrams.service';
import { DfdDiagramDto } from '../../models/api.models';

// ✅ ДОДАЙ сервіс для проектів (назва може відрізнятись у тебе)
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-diagrams',
  standalone: false,
  templateUrl: './diagrams.component.html',
  styleUrls: ['./diagrams.component.css']
})
export class DiagramsComponent implements OnInit {
  projectId!: number;

  // ✅ НОВЕ: назва проекту
  projectName: string | null = null;

  diagrams: DfdDiagramDto[] = [];
  error?: string;

  name = '';
  level = 'Context';
  description = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diagramsService: DfdDiagramsService,
    private projectsService: ProjectsService // ✅ НОВЕ
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    // ✅ Завантажуємо і проект, і діаграми
    this.loadProject();
    this.loadDiagrams();
  }

  // ✅ НОВЕ: окремо діаграми (раніше було load())
  loadDiagrams(): void {
    this.error = undefined;
    this.diagramsService.getForProject(this.projectId).subscribe({
      next: data => (this.diagrams = data),
      error: () => (this.error = 'Failed to load diagrams')
    });
  }

  // ✅ НОВЕ: завантаження назви проекту
  loadProject(): void {
    this.projectsService.getById(this.projectId).subscribe({
      next: (p) => {
        this.projectName = p?.name ?? `Project ${this.projectId}`;
      },
      error: () => {
        // якщо проект не підвантажився — UI все одно буде ок
        this.projectName = `Project ${this.projectId}`;
      }
    });
  }

  create(): void {
    if (!this.name.trim()) return;

    this.diagramsService.create(this.projectId, {
      name: this.name.trim(),
      level: this.level.trim(),
      description: this.description || null
    }).subscribe({
      next: () => {
        this.name = '';
        this.description = '';
        this.loadDiagrams();
      },
      error: () => (this.error = 'Failed to create diagram')
    });
  }

  openVersions(diagramId: number): void {
    this.router.navigate(['/diagrams', diagramId, 'versions']);
  }

  openEditor(diagramId: number): void {
    this.router.navigate(['/diagrams', diagramId, 'editor']);
  }

  delete(diagramId: number): void {
    if (!confirm('Delete diagram?')) return;
    this.diagramsService.delete(diagramId).subscribe({
      next: () => this.loadDiagrams(),
      error: () => (this.error = 'Failed to delete diagram')
    });
  }

  back(): void {
    this.router.navigate(['/projects']);
  }
}
