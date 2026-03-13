import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../core/models/student.model';

@Component({
  selector: 'app-student-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="student-view-container">
      <div class="view-header">
        <button type="button" class="btn-back" (click)="goBack()">
          <i class="fa fa-arrow-left"></i>
          <span>Back to Students</span>
        </button>
        <div class="header-actions">
          <span class="status-badge" [class.status-active]="student?.status !== 'Dropped'" [class.status-dropped]="student?.status === 'Dropped'">
            {{ student?.status || 'Active' }}
          </span>
          <a [routerLink]="['/admin/students/active']" [queryParams]="{ edit: student.userId ?? student.studentId }" class="btn-edit" *ngIf="student">
            <i class="fa fa-edit"></i>
            Edit Student
          </a>
        </div>
      </div>

      <div class="view-content" *ngIf="student">
        <div class="profile-card">
          <div class="profile-avatar">
            <i class="fa fa-user-graduate"></i>
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ student.name }}</h1>
            <div class="profile-meta">
              <span class="meta-item" *ngIf="student.class"><i class="fa fa-book"></i> {{ student.class.name }}</span>
              <span class="meta-item" *ngIf="student.section"><i class="fa fa-layer-group"></i> {{ student.section.name }}</span>
              <span class="meta-item" *ngIf="student.roll"><i class="fa fa-hashtag"></i> Roll: {{ student.roll }}</span>
              <span class="meta-item" *ngIf="student.session"><i class="fa fa-calendar"></i> {{ student.session }}</span>
            </div>
          </div>
        </div>

        <div class="tabs">
          <button
            type="button"
            class="tab-button"
            [class.active]="activeTab === 'personal'"
            (click)="activeTab = 'personal'">
            <i class="fa fa-user"></i>
            <span>Personal</span>
          </button>
          <button
            type="button"
            class="tab-button"
            [class.active]="activeTab === 'admission'"
            (click)="activeTab = 'admission'">
            <i class="fa fa-graduation-cap"></i>
            <span>Admission & Fee</span>
          </button>
          <button
            type="button"
            class="tab-button"
            [class.active]="activeTab === 'family'"
            (click)="activeTab = 'family'">
            <i class="fa fa-users"></i>
            <span>Family</span>
          </button>
          <button
            type="button"
            class="tab-button"
            [class.active]="activeTab === 'previous'"
            (click)="activeTab = 'previous'">
            <i class="fa fa-school"></i>
            <span>Previous Institute</span>
          </button>
        </div>

        <div class="tab-panels">
          <div *ngIf="activeTab === 'personal'" class="details-grid">
            <div class="detail-card">
              <h3 class="card-title"><i class="fa fa-user"></i> Personal Information</h3>
              <div class="detail-list">
                <div class="detail-row"><span class="label">Date of Birth</span><span class="value">{{ formatDate(student.birthday) }}</span></div>
                <div class="detail-row"><span class="label">Gender</span><span class="value">{{ student.sex || '-' }}</span></div>
                <div class="detail-row"><span class="label">Religion</span><span class="value">{{ student.religion || '-' }}</span></div>
                <div class="detail-row"><span class="label">Blood Group</span><span class="value">{{ student.bloodGroup || '-' }}</span></div>
                <div class="detail-row"><span class="label">Email</span><span class="value">{{ student.email || '-' }}</span></div>
                <div class="detail-row"><span class="label">Phone</span><span class="value">{{ student.phone || student.smsNumber || '-' }}</span></div>
                <div class="detail-row"><span class="label">Address</span><span class="value">{{ student.address || '-' }}</span></div>
              </div>
            </div>

            <div class="detail-card">
              <h3 class="card-title"><i class="fa fa-id-card"></i> Registration & Documents</h3>
              <div class="detail-list">
                <div class="detail-row"><span class="label">School Reg No.</span><span class="value">{{ student.schoolRegNum || '-' }}</span></div>
                <div class="detail-row"><span class="label">B-Form / CNIC</span><span class="value">{{ student.bFormCnic || '-' }}</span></div>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab === 'admission'" class="details-grid">
            <div class="detail-card">
              <h3 class="card-title"><i class="fa fa-graduation-cap"></i> Admission & Fee Details</h3>
              <div class="detail-list">
                <div class="detail-row"><span class="label">Admission Date</span><span class="value">{{ formatDate(student.admissionDate) }}</span></div>
                <div class="detail-row"><span class="label">Fee</span><span class="value">{{ student.fee != null ? (student.fee | currency:'PKR') : '-' }}</span></div>
                <div class="detail-row">
                  <span class="label">Fee Type</span>
                  <span class="value">
                    <span class="fee-badge" [class.fee-paid]="student.feeType === 'Paid'" [class.fee-unpaid]="student.feeType !== 'Paid'">
                      {{ student.feeType || 'Unpaid' }}
                    </span>
                  </span>
                </div>
                <div class="detail-row"><span class="label">Fee Discount</span><span class="value">{{ student.feeDiscount != null ? (student.feeDiscount | currency:'PKR') : '-' }}</span></div>
                <div class="detail-row"><span class="label">Transport Charges</span><span class="value">{{ student.transportCharges != null ? (student.transportCharges | currency:'PKR') : '-' }}</span></div>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab === 'family'" class="details-grid">
            <div class="detail-card">
              <h3 class="card-title"><i class="fa fa-users"></i> Guardian / Family Information</h3>
              <div class="detail-list">
                <div class="detail-row"><span class="label">Father Name</span><span class="value">{{ student.fatherName || '-' }}</span></div>
                <div class="detail-row"><span class="label">Guardian Name</span><span class="value">{{ student.guardianName || '-' }}</span></div>
                <div class="detail-row"><span class="label">Father/Guardian CNIC</span><span class="value">{{ student.fatherGuardianCnic || '-' }}</span></div>
                <div class="detail-row"><span class="label">Father Occupation</span><span class="value">{{ student.fatherOccupation || '-' }}</span></div>
                <div class="detail-row"><span class="label">Contact</span><span class="value">{{ student.smsNumber || student.fatherGuardianPhone || '-' }}</span></div>
                <div class="detail-row"><span class="label">Mother Name</span><span class="value">{{ student.motherName || '-' }}</span></div>
                <div class="detail-row"><span class="label">Mother Phone</span><span class="value">{{ student.motherPhone || '-' }}</span></div>
                <div class="detail-row"><span class="label">Mother CNIC</span><span class="value">{{ student.motherCnic || '-' }}</span></div>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab === 'previous'">
            <div class="details-grid" *ngIf="hasPreviousInstitute(student)">
              <div class="detail-card detail-card-full">
                <h3 class="card-title"><i class="fa fa-school"></i> Previous Institute</h3>
                <div class="detail-list">
                  <div class="detail-row"><span class="label">Institute Name</span><span class="value">{{ student.previousInstituteName || '-' }}</span></div>
                  <div class="detail-row"><span class="label">Passing Class</span><span class="value">{{ student.passingClass || '-' }}</span></div>
                  <div class="detail-row"><span class="label">Passing Year</span><span class="value">{{ student.passingYear || '-' }}</span></div>
                  <div class="detail-row"><span class="label">Passing Percentage</span><span class="value">{{ student.passingPercentage != null ? student.passingPercentage + '%' : '-' }}</span></div>
                  <div class="detail-row"><span class="label">Institute Address</span><span class="value">{{ student.instituteAddress || '-' }}</span></div>
                </div>
              </div>
            </div>
            <div class="no-data" *ngIf="!hasPreviousInstitute(student)">
              <i class="fa fa-info-circle"></i>
              <p>No previous institute information recorded for this student.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading">
        <i class="fa fa-spinner fa-spin"></i>
        <p>Loading student details...</p>
      </div>

      <div class="error-state" *ngIf="!loading && !student">
        <i class="fa fa-exclamation-circle"></i>
        <p>{{ error ? 'Failed to load student details.' : 'Student not found.' }}</p>
        <button type="button" class="btn-back" (click)="goBack()">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .student-view-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.5rem 0;
    }

    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-back:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-dropped {
      background: #fee2e2;
      color: #991b1b;
    }

    .btn-edit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #fff;
      background: var(--primary-gradient);
      border: none;
      border-radius: 10px;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-edit:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      margin-bottom: 2rem;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
    }

    .profile-name {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .profile-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }

    .meta-item i {
      color: var(--primary);
      font-size: 0.875rem;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .tab-button {
      border: none;
      background: transparent;
      padding: 0.5rem 0.9rem;
      border-radius: 999px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-tertiary);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
    }

    .tab-button i {
      font-size: 0.8rem;
    }

    .tab-button.active {
      background: var(--primary-gradient);
      color: #fff;
      box-shadow: 0 2px 8px rgba(79,70,229,0.35);
    }

    .tab-button:not(.active):hover {
      background: #f1f5f9;
      color: var(--text-secondary);
    }

    .tab-panels {
      margin-top: 0.5rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .detail-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .detail-card-full {
      grid-column: 1 / -1;
    }

    .card-title {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .card-title i {
      color: var(--primary);
      font-size: 1rem;
    }

    .detail-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f8fafc;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row .label {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      font-weight: 500;
      flex-shrink: 0;
    }

    .detail-row .value {
      font-size: 0.9375rem;
      color: var(--text-primary);
      text-align: right;
    }

    .fee-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .fee-paid {
      background: #d1fae5;
      color: #065f46;
    }

    .fee-unpaid {
      background: #fef3c7;
      color: #92400e;
    }

    .no-data {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-tertiary);
      font-size: 0.9rem;
    }

    .no-data i {
      font-size: 1.4rem;
      margin-bottom: 0.4rem;
      display: block;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-tertiary);
    }

    .loading-state i, .error-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .error-state .btn-back {
      margin-top: 1rem;
    }
  `]
})
export class StudentViewComponent implements OnInit {
  student: Student | null = null;
  loading = true;
  error = false;
  activeTab: 'personal' | 'admission' | 'family' | 'previous' = 'personal';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentService.getStudentById(+id).subscribe({
        next: (s) => {
          this.student = s;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
    } else {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/admin/students/active']);
  }

  formatDate(val: Date | string | undefined): string {
    if (!val) return '-';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  hasPreviousInstitute(s: Student): boolean {
    return !!(s.previousInstituteName || s.passingClass || s.passingYear || s.passingPercentage != null || s.instituteAddress);
  }
}
