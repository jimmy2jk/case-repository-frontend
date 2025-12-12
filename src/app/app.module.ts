import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

import { ProjectsComponent } from './pages/projects/projects.component';
import { DiagramsComponent } from './pages/diagrams/diagrams.component';
import { VersionsComponent } from './pages/versions/versions.component';
import { EditorComponent } from './pages/editor/editor.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    DiagramsComponent,
    VersionsComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
