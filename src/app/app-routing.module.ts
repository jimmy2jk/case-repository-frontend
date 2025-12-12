import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsComponent } from './pages/projects/projects.component';
import { DiagramsComponent } from './pages/diagrams/diagrams.component';
import { VersionsComponent } from './pages/versions/versions.component';
import { EditorComponent } from './pages/editor/editor.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:projectId/diagrams', component: DiagramsComponent },
  { path: 'diagrams/:diagramId/versions', component: VersionsComponent },
  { path: 'diagrams/:diagramId/editor', component: EditorComponent },
  { path: '**', redirectTo: 'projects' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
