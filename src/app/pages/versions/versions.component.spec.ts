import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionsComponent } from './versions.component';

describe('VersionsComponent', () => {
  let component: VersionsComponent;
  let fixture: ComponentFixture<VersionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionsComponent]
    });
    fixture = TestBed.createComponent(VersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
