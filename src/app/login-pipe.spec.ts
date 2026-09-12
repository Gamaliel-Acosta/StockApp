import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';

import { LoginPipe } from './login-pipe';

describe('LoginPipe', () => {
  let component: LoginPipe;
  let fixture: ComponentFixture<LoginPipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPipe],
      providers: [provideZonelessChangeDetection(), provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
