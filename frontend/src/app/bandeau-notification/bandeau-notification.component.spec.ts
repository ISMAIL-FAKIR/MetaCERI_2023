import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandeauNotificationComponent } from './bandeau-notification.component';

describe('BandeauNotificationComponent', () => {
  let component: BandeauNotificationComponent;
  let fixture: ComponentFixture<BandeauNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BandeauNotificationComponent]
    });
    fixture = TestBed.createComponent(BandeauNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
