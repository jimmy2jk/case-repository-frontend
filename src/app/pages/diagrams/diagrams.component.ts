import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DfdDiagramsService } from '../../services/dfd-diagrams.service';
import { DfdDiagramDto } from '../../models/api.models';

@Component({
  selector: 'app-diagrams',
  standalone: false,
  templateUrl: './diagrams.component.html'
})
export class DiagramsComponent implements OnInit {
  projectId!: number;
  diagrams: DfdDiagramDto[] = [];
  error?: string;

  name = '';
  level = 'Context';
  description = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diagramsService: DfdDiagramsService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.load();
  }

  load(): void {
    this.error = undefined;
    this.diagramsService.getForProject(this.projectId).subscribe({
      next: data => (this.diagrams = data),
      error: () => (this.error = 'Failed to load diagrams')
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
        this.load();
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
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete diagram')
    });
  }

  back(): void {
    this.router.navigate(['/projects']);
  }
}
