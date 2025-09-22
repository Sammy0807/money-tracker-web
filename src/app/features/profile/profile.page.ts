import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgIf, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApi } from '../../core/api/user.api';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [NgIf, JsonPipe, FormsModule],
  template: `
    <h2>User Profile</h2>
    <button (click)="refresh()">Refresh</button>

    <div *ngIf="user; else loading">
      <div class="profile-section">
        <h3>Basic Information</h3>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" [(ngModel)]="user.email" readonly />
        </div>
        <div class="form-group">
          <label>Name:</label>
          <input type="text" [(ngModel)]="user.name" />
        </div>
        <div class="form-group">
          <label>Locale:</label>
          <input type="text" [(ngModel)]="user.locale" />
        </div>
        <div class="form-group">
          <label>Currency:</label>
          <input type="text" [(ngModel)]="user.currency" />
        </div>
        <div class="form-group">
          <label>Timezone:</label>
          <input type="text" [(ngModel)]="user.timezone" />
        </div>
        <button (click)="updateProfile()" [disabled]="updating">
          {{updating ? 'Updating...' : 'Update Profile'}}
        </button>
      </div>

      <div class="profile-section">
        <h3>Preferences</h3>
        <div *ngIf="preferences">
          <div class="form-group">
            <label>Default Currency:</label>
            <select [(ngModel)]="preferences.currency">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="preferences.notifications.email" />
              Email Notifications
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="preferences.notifications.push" />
              Push Notifications
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="preferences.notifications.lowBalance" />
              Low Balance Alerts
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="preferences.notifications.budgetAlerts" />
              Budget Alerts
            </label>
          </div>
          <button (click)="updatePreferences()" [disabled]="updating">
            {{updating ? 'Updating...' : 'Update Preferences'}}
          </button>
        </div>
      </div>

      <div class="profile-section">
        <h3>Feature Flags</h3>
        <div *ngIf="featureFlags">
          <pre>{{featureFlags | json}}</pre>
        </div>
      </div>

      <div class="profile-section danger-zone">
        <h3>Data Export</h3>
        <button (click)="exportData()" [disabled]="exporting">
          {{exporting ? 'Exporting...' : 'Export My Data'}}
        </button>
      </div>
    </div>

    <ng-template #loading>Loading…</ng-template>
  `,
  styles: [`
    .profile-section {
      margin: 2rem 0;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-group {
      margin: 1rem 0;
      display: flex;
      flex-direction: column;
      max-width: 300px;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    .form-group input, .form-group select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }
    .danger-zone {
      border-color: #dc3545;
    }
    .danger-zone h3 {
      color: #dc3545;
    }
    button {
      padding: 0.5rem 1rem;
      margin: 0.5rem 0;
    }
    pre {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 3px;
      overflow-x: auto;
    }
  `]
})
export default class ProfilePage implements OnInit, OnDestroy {
  api = inject(UserApi);
  user: any = null;
  preferences: any = null;
  featureFlags: any = null;
  updating = false;
  exporting = false;
  sub1?: any;
  sub2?: any;
  sub3?: any;

  ngOnInit(){ this.refresh(); }
  ngOnDestroy(){
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
  }

  refresh(){
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
    this.sub1 = this.api.getCurrentUser().subscribe(data => this.user = data);
    this.sub2 = this.api.getPreferences().subscribe(data => this.preferences = data);
    this.sub3 = this.api.getFeatureFlags().subscribe(data => this.featureFlags = data);
  }

  updateProfile() {
    if (!this.user) return;
    this.updating = true;
    this.api.updateCurrentUser(this.user).subscribe({
      next: (data) => {
        this.user = data;
        this.updating = false;
      },
      error: () => this.updating = false
    });
  }

  updatePreferences() {
    if (!this.preferences) return;
    this.updating = true;
    this.api.updatePreferences(this.preferences).subscribe({
      next: (data) => {
        this.preferences = data;
        this.updating = false;
      },
      error: () => this.updating = false
    });
  }

  exportData() {
    this.exporting = true;
    this.api.exportData().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-financial-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => this.exporting = false
    });
  }
}
