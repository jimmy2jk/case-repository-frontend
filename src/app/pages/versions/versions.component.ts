import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DfdVersionsService } from '../../services/dfd-versions.service';
import { DfdDiagramsService } from '../../services/dfd-diagrams.service';
import { DfdDiagramVersionDto } from '../../models/api.models';

@Component({
  selector: 'app-versions',
  standalone: false,
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsComponent implements OnInit {
  diagramId!: number;

  // ✅ НОВЕ: дані діаграми
  diagramName: string | null = null;
  diagramLevel: string | null = null;

  versions: DfdDiagramVersionDto[] = [];
  error?: string;

  latestVersionNumber: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private versionsService: DfdVersionsService,
    private diagramsService: DfdDiagramsService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.diagramId = Number(this.route.snapshot.paramMap.get('diagramId'));

    this.loadDiagram();   // 👈 нове
    this.loadVersions();
  }

  // ============================
  // Load diagram meta
  // ============================
  loadDiagram(): void {
    this.diagramsService.getById(this.diagramId).subscribe({
      next: d => {
        this.diagramName = d.name;
        this.diagramLevel = d.level;
      },
      error: () => {
        this.diagramName = `Diagram ${this.diagramId}`;
        this.diagramLevel = null;
      }
    });
  }

  // ============================
  // Load versions
  // ============================
  loadVersions(): void {
    this.error = undefined;
    this.versionsService.getForDiagram(this.diagramId).subscribe({
      next: data => {
        this.versions = data ?? [];

        const nums = this.versions
          .map(v => Number(v.versionNumber))
          .filter(n => !Number.isNaN(n));

        this.latestVersionNumber = nums.length ? Math.max(...nums) : null;
      },
      error: () => (this.error = 'Failed to load versions')
    });
  }

  openEditor(): void {
    this.router.navigate(['/diagrams', this.diagramId, 'editor']);
  }

  back(): void {
    this.location.back();
  }

  openVersion(v: DfdDiagramVersionDto): void {
    this.router.navigate(['/diagrams', this.diagramId, 'editor'], {
      queryParams: { v: v.versionNumber }
    });
  }
}
