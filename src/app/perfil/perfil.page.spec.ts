import { ComponentFixture, TestBed } from '@angular/core/testing';
import axios from 'axios';
import { PerfilPage } from './perfil.page';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the profile photo for the active user only', async () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' }),
    );
    localStorage.setItem('profilePhoto:1', 'photo-user-1');
    localStorage.setItem('profilePhoto:2', 'photo-user-2');
    spyOn(axios, 'get').and.returnValue(
      Promise.resolve({
        data: {
          success: true,
          data: { id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' },
        },
      } as never),
    );

    await component.ngOnInit();

    expect(component.profilePhoto).toBe('photo-user-1');
  });

  it('stores the profile photo under the active user key', async () => {
    component.userId = 7;

    await (component as any).saveProfilePhoto('data:image/jpeg;base64,photo');

    expect(localStorage.getItem('profilePhoto:7')).toBe('data:image/jpeg;base64,photo');
    expect(localStorage.getItem('profilePhoto')).toBeNull();
  });

  it('migrates the legacy shared photo into the active user key', async () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: 9, name: 'User 9', email: 'user9@example.com', role: 'admin' }),
    );
    localStorage.setItem('profilePhoto', 'legacy-photo');
    spyOn(axios, 'get').and.returnValue(
      Promise.resolve({
        data: {
          success: true,
          data: { id: 9, name: 'User 9', email: 'user9@example.com', role: 'admin' },
        },
      } as never),
    );

    await component.ngOnInit();

    expect(component.profilePhoto).toBe('legacy-photo');
    expect(localStorage.getItem('profilePhoto:9')).toBe('legacy-photo');
    expect(localStorage.getItem('profilePhoto')).toBeNull();
  });
});
