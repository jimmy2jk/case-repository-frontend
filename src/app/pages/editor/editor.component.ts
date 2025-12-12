import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DfdVersionsService } from '../../services/dfd-versions.service';
import { createEmptyDfdModel, DfdDiagramModel, DfdNodeType } from '../../models/dfd.models';
import { DfdDiagramVersionDto } from '../../models/api.models';

type AnyNode = { id: string; name: string; x: number; y: number; description?: string };

type SvgFlowLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  mx: number;
  my: number;
};

@Component({
  selector: 'app-editor',
  standalone: false,
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit {
  diagramId!: number;
  model: DfdDiagramModel = createEmptyDfdModel();
  error?: string;

  // add node form
  nodeType: DfdNodeType = 'process';
  nodeName = '';
  nodeDesc = '';

  // add flow form
  flowFrom = '';
  flowTo = '';
  flowLabel = '';
  flowDesc = '';

  author = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private versionsService: DfdVersionsService
  ) {}

  ngOnInit(): void {
    this.diagramId = Number(this.route.snapshot.paramMap.get('diagramId'));

    this.error = undefined;
    // 1) пробуємо завантажити всі версії
    this.versionsService.getForDiagram(this.diagramId).subscribe({
      next: (versions: DfdDiagramVersionDto[]) => {
        if (!versions || versions.length === 0) {
          // якщо версій нема — порожня модель
          this.model = createEmptyDfdModel();
          return;
        }

        // 2) беремо останню версію (макс versionNumber)
        const last = versions.reduce((a, b) => (a.versionNumber > b.versionNumber ? a : b));

        // 3) парсимо JSON
        const loaded = this.tryParseModel(last.content);

        this.model = loaded ?? createEmptyDfdModel();

        if (!loaded) {
          this.error = 'Last version JSON is invalid. Opened empty model.';
        }
      },
      error: () => {
        // якщо API не доступне/помилка — хоча б відкриваємо пустий редактор
        this.model = createEmptyDfdModel();
        this.error = 'Failed to load last version. Opened empty model.';
      }
    });
  }


  get allNodes(): { type: DfdNodeType; id: string; name: string }[] {
    return [
      ...this.model.processes.map(n => ({ type: 'process' as const, id: n.id, name: n.name })),
      ...this.model.dataStores.map(n => ({ type: 'dataStore' as const, id: n.id, name: n.name })),
      ...this.model.externalEntities.map(n => ({ type: 'externalEntity' as const, id: n.id, name: n.name }))
    ];
  }

  private nextId(prefix: string, existingIds: string[]): string {
    let i = 1;
    while (existingIds.includes(`${prefix}${i}`)) i++;
    return `${prefix}${i}`;
  }

  addNode(): void {
    this.error = undefined;
    const name = this.nodeName.trim();
    if (!name) return;

    const x = 50 + Math.floor(Math.random() * 500);
    const y = 50 + Math.floor(Math.random() * 250);

    if (this.nodeType === 'process') {
      const id = this.nextId('P', this.model.processes.map(p => p.id));
      this.model.processes.push({ id, name, description: this.nodeDesc || undefined, x, y });
    } else if (this.nodeType === 'dataStore') {
      const id = this.nextId('D', this.model.dataStores.map(d => d.id));
      this.model.dataStores.push({ id, name, description: this.nodeDesc || undefined, x, y });
    } else {
      const id = this.nextId('E', this.model.externalEntities.map(e => e.id));
      this.model.externalEntities.push({ id, name, description: this.nodeDesc || undefined, x, y });
    }

    this.nodeName = '';
    this.nodeDesc = '';
  }

  deleteNode(type: DfdNodeType, id: string): void {
    if (!confirm('Delete node?')) return;

    if (type === 'process') this.model.processes = this.model.processes.filter(x => x.id !== id);
    if (type === 'dataStore') this.model.dataStores = this.model.dataStores.filter(x => x.id !== id);
    if (type === 'externalEntity') this.model.externalEntities = this.model.externalEntities.filter(x => x.id !== id);

    // delete flows referencing this node
    this.model.dataFlows = this.model.dataFlows.filter(f => !(f.fromId === id || f.toId === id));
  }

  addFlow(): void {
    this.error = undefined;

    if (!this.flowFrom || !this.flowTo || !this.flowLabel.trim()) return;

    const from = this.allNodes.find(n => n.id === this.flowFrom);
    const to = this.allNodes.find(n => n.id === this.flowTo);
    if (!from || !to) return;

    const existingIds = this.model.dataFlows.map(f => f.id);
    const id = this.nextId('F', existingIds);

    this.model.dataFlows.push({
      id,
      fromType: from.type,
      fromId: from.id,
      toType: to.type,
      toId: to.id,
      label: this.flowLabel.trim(),
      description: this.flowDesc || undefined
    });

    this.flowFrom = '';
    this.flowTo = '';
    this.flowLabel = '';
    this.flowDesc = '';
  }

  deleteFlow(id: string): void {
    if (!confirm('Delete flow?')) return;
    this.model.dataFlows = this.model.dataFlows.filter(f => f.id !== id);
  }

  saveAsNewVersion(): void {
    this.error = undefined;

    const content = JSON.stringify(this.model);

    this.versionsService.create(this.diagramId, {
      author: this.author || null,
      content
    }).subscribe({
      next: () => this.router.navigate(['/diagrams', this.diagramId, 'versions']),
      error: () => (this.error = 'Failed to save version')
    });
  }

  back(): void {
    this.router.navigate(['/diagrams', this.diagramId, 'versions']);
  }

  // helpers for simple "canvas" visualization
  getCanvasNodes(): { type: DfdNodeType; node: AnyNode }[] {
    return [
      ...this.model.processes.map(n => ({ type: 'process' as const, node: n })),
      ...this.model.dataStores.map(n => ({ type: 'dataStore' as const, node: n })),
      ...this.model.externalEntities.map(n => ({ type: 'externalEntity' as const, node: n }))
    ];
  }

  private tryParseModel(content: string): DfdDiagramModel | null {
    try {
      const parsed = JSON.parse(content);
      // мінімальна перевірка структури:
      if (!parsed || typeof parsed !== 'object') return null;
      if (!Array.isArray(parsed.processes)) return null;
      if (!Array.isArray(parsed.dataStores)) return null;
      if (!Array.isArray(parsed.externalEntities)) return null;
      if (!Array.isArray(parsed.dataFlows)) return null;
      return parsed as DfdDiagramModel;
    } catch {
      return null;
    }
  }

  private findNodeById(id: string): { x: number; y: number; name: string } | null {
    const p = this.model.processes.find(n => n.id === id);
    if (p) return { x: p.x, y: p.y, name: p.name };

    const d = this.model.dataStores.find(n => n.id === id);
    if (d) return { x: d.x, y: d.y, name: d.name };

    const e = this.model.externalEntities.find(n => n.id === id);
    if (e) return { x: e.x, y: e.y, name: e.name };

    return null;
  }

  get svgLines(): SvgFlowLine[] {
    const lines: SvgFlowLine[] = [];

    for (const f of this.model.dataFlows) {
      const from = this.findNodeById(f.fromId);
      const to = this.findNodeById(f.toId);
      if (!from || !to) continue;

      // Центри source і target
      const fromCenter = {
        x: from.x + this.nodeW / 2,
        y: from.y + this.nodeH / 2
      };

      const toCenter = {
        x: to.x + this.nodeW / 2,
        y: to.y + this.nodeH / 2
      };

      // Початок лінії — на краю source у напрямку до target
      const start = this.intersectRectEdge(
        from.x,
        from.y,
        this.nodeW,
        this.nodeH,
        fromCenter.x,
        fromCenter.y,
        toCenter.x,
        toCenter.y
      );

      // Кінець лінії — на краю target у напрямку від source
      const end = this.intersectRectEdge(
        to.x,
        to.y,
        this.nodeW,
        this.nodeH,
        toCenter.x,
        toCenter.y,
        fromCenter.x,
        fromCenter.y
      );

      const mx = (start.x + end.x) / 2;
      const my = (start.y + end.y) / 2;

      lines.push({
        id: f.id,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        mx,
        my,
        label: f.label
      });
    }

    return lines;
  }


  private readonly nodeW = 120;
  private readonly nodeH = 55;

  private centerOf(topLeftX: number, topLeftY: number) {
    return { cx: topLeftX + this.nodeW / 2, cy: topLeftY + this.nodeH / 2 };
  }

  private intersectRectEdge(
    rectX: number,
    rectY: number,
    rectW: number,
    rectH: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): { x: number; y: number } {
    // прямокутник: [left, right] x [top, bottom]
    const left = rectX;
    const right = rectX + rectW;
    const top = rectY;
    const bottom = rectY + rectH;

    const dx = toX - fromX;
    const dy = toY - fromY;

    // якщо точки майже співпали — повернемо центр
    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) {
      return { x: rectX + rectW / 2, y: rectY + rectH / 2 };
    }

    // Параметричний промінь: P(t) = (fromX,fromY) + t*(dx,dy), t>=0
    // Шукаємо мінімальний t, при якому P(t) перетинає одну з 4-х сторін прямокутника.
    const candidates: { t: number; x: number; y: number }[] = [];

    // x = left
    if (Math.abs(dx) > 1e-6) {
      const t = (left - fromX) / dx;
      const y = fromY + t * dy;
      if (t >= 0 && y >= top && y <= bottom) candidates.push({ t, x: left, y });
    }

    // x = right
    if (Math.abs(dx) > 1e-6) {
      const t = (right - fromX) / dx;
      const y = fromY + t * dy;
      if (t >= 0 && y >= top && y <= bottom) candidates.push({ t, x: right, y });
    }

    // y = top
    if (Math.abs(dy) > 1e-6) {
      const t = (top - fromY) / dy;
      const x = fromX + t * dx;
      if (t >= 0 && x >= left && x <= right) candidates.push({ t, x, y: top });
    }

    // y = bottom
    if (Math.abs(dy) > 1e-6) {
      const t = (bottom - fromY) / dy;
      const x = fromX + t * dx;
      if (t >= 0 && x >= left && x <= right) candidates.push({ t, x, y: bottom });
    }

    // Нам потрібний перетин, який знаходиться "попереду" від from і найближчий до from:
    candidates.sort((a, b) => a.t - b.t);

    // Якщо нічого не знайшли (рідко), повертаємо центр
    return candidates[0] ?? { x: rectX + rectW / 2, y: rectY + rectH / 2 };
  }

}
