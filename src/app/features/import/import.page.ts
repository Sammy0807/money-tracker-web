import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ImportApi } from '../../core/api/import.api';

@Component({
  standalone: true,
  selector: 'app-import',
  imports: [NgFor, NgIf, DatePipe],
  template: `
    <h2>Data Import</h2>
    <button (click)="refresh()">Refresh</button>

    <div class="upload-section">
      <h3>Upload CSV File</h3>
      <input type="file" accept=".csv" (change)="onFileSelected($event)" />
      <button *ngIf="selectedFile" (click)="uploadFile()" [disabled]="uploading">
        {{uploading ? 'Uploading...' : 'Upload'}}
      </button>
    </div>

    <div *ngIf="jobs; else loading">
      <h3>Import Jobs</h3>
      <table>
        <tr><th>Filename</th><th>Status</th><th>Progress</th><th>Created</th><th>Actions</th></tr>
        <tr *ngFor="let job of jobs">
          <td>{{job.filename}}</td>
          <td>
            <span [class]="'status-' + job.status.toLowerCase()">
              {{job.status}}
            </span>
          </td>
          <td>{{(job.processedRows || job.processed || 0)}}/{{(job.totalRows || job.processed || 0)}}</td>
          <td>{{job.createdAt | date:'short'}}</td>
          <td>
            <button *ngIf="job.status === 'FAILED'" (click)="retryJob(job.id)">Retry</button>
            <button *ngIf="job.status === 'PROCESSING'" (click)="cancelJob(job.id)">Cancel</button>
          </td>
        </tr>
      </table>
    </div>

    <ng-template #loading>Loading…</ng-template>
  `,
  styles: [`
    .upload-section { margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; }
    .status-pending { color: orange; }
    .status-processing { color: blue; }
    .status-completed { color: green; }
    .status-failed { color: red; }
    button { margin: 0 4px; padding: 4px 8px; }
    input[type="file"] { margin-right: 1rem; }
  `]
})
export default class ImportPage implements OnInit, OnDestroy {
  api = inject(ImportApi);
  jobs: any = null;
  selectedFile: File | null = null;
  uploading = false;
  sub?: any;

  ngOnInit(){ this.refresh(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  refresh(){
    this.sub?.unsubscribe();
    this.sub = this.api.getJobs().subscribe(data => this.jobs = data);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  uploadFile() {
    if (!this.selectedFile) return;
    this.uploading = true;
    // Using dummy account ID for demo
    this.api.upload(this.selectedFile, 'dummy-account-id').subscribe({
      next: () => {
        this.uploading = false;
        this.selectedFile = null;
        this.refresh();
      },
      error: () => this.uploading = false
    });
  }

  retryJob(id: string) {
    this.api.retryJob(id).subscribe(() => this.refresh());
  }

  cancelJob(id: string) {
    this.api.cancelJob(id).subscribe(() => this.refresh());
  }
}
