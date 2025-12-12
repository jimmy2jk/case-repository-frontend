import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DfdVersionsService } from '../../services/dfd-versions.service';
import { DfdDiagramVersionDto } from '../../models/api.models';

@Component({
  selector: 'app-versions',
  standalone: false,
  templateUrl: './versions.component.html'
})
export class VersionsComponent implements OnInit {
  diagramId!: number;
  versions: DfdDiagramVersionDto[] = [];
  error?: string;

  constructor(private route: ActivatedRoute, private router: Router, private versionsService: DfdVersionsService) {}

  ngOnInit(): void {
    this.diagramId = Number(this.route.snapshot.paramMap.get('diagramId'));
    this.load();
  }

  load(): void {
    this.error = undefined;
    this.versionsService.getForDiagram(this.diagramId).subscribe({
      next: data => (this.versions = data),
      error: () => (this.error = 'Failed to load versions')
    });
  }

  openEditor(): void {
    this.router.navigate(['/diagrams', this.diagramId, 'editor']);
  }

  back(): void {
    this.router.navigate(['/projects']);
  }
}
