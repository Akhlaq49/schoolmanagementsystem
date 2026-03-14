import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { StudentService } from '../../../../core/services/student.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Student } from '../../../../core/models/student.model';
import { Attendance } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-attendance-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="checkin-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="checkin-card">
        <h2><i class="fa fa-check-circle"></i> Today's Attendance</h2>
        <p class="subtitle">Mark your attendance for today</p>

        <div class="date-time-row">
          <div class="date-box">
            <span class="label">Date</span>
            <span class="value">{{ todayDate }}</span>
          </div>
          <div class="time-box">
            <span class="label">Current Time</span>
            <span class="value live-clock">{{ currentTime }}</span>
          </div>
        </div>

        <div class="school-hours">
          <span class="label">School Hours (configurable)</span>
          <div class="hours-inputs">
            <div class="hours-item">
              <label>Start</label>
              <input type="time" [(ngModel)]="startTime" class="time-input">
            </div>
            <div class="hours-item">
              <label>End</label>
              <input type="time" [(ngModel)]="endTime" class="time-input">
            </div>
          </div>
          <span class="hours-value">{{ startTimeDisplay }} – {{ endTimeDisplay }}</span>
        </div>

        <div class="student-info" *ngIf="student">
          <span class="name">{{ student.name }}</span>
          <span class="class-info">{{ className }}</span>
        </div>

        <div class="status-section" *ngIf="!loading && student">
          <span class="status-label">Today's Status</span>
          <span class="status-badge" [ngClass]="getStatusClass()">{{ getStatusLabel() }}</span>
        </div>

        <div class="late-reason-box" *ngIf="canCheckIn() && isLateArrival">
          <label>Reason for being late <span class="required">*</span></label>
          <textarea [(ngModel)]="lateReason" placeholder="Please provide reason for arriving after start time"
                    class="form-control" rows="2"></textarea>
        </div>

        <div class="actions" *ngIf="!loading && student && !hasApprovedLeave">
          <button class="btn btn-pp" *ngIf="canCheckIn()" (click)="checkIn('PP')" [disabled]="saving">
            <i class="fa fa-user"></i> Mark PP (Physical Present)
          </button>
          <button class="btn btn-po" *ngIf="canCheckIn()" (click)="checkIn('PO')" [disabled]="saving">
            <i class="fa fa-video-camera"></i> Mark PO (Present Online)
          </button>
          <button class="btn btn-out" *ngIf="canCheckOut()" (click)="initCheckOut()" [disabled]="saving">
            <i class="fa fa-sign-out"></i> Check Out
          </button>
        </div>

        <div class="early-leave-box" *ngIf="showEarlyLeavePanel">
          <label>Reason for leaving early <span class="required">*</span></label>
          <textarea [(ngModel)]="earlyLeaveReason" placeholder="Please provide reason for leaving before end time"
                    class="form-control" rows="2"></textarea>
          <div class="panel-actions">
            <button class="btn btn-primary" (click)="doCheckOut()" [disabled]="saving || !earlyLeaveReason.trim()">
              Submit Check Out
            </button>
            <button class="btn btn-secondary" (click)="showEarlyLeavePanel = false; earlyLeaveReason = ''">
              Cancel
            </button>
          </div>
        </div>

        <div class="po-remarks" *ngIf="showPoRemarks">
          <label *ngIf="isLateArrival">Reason for being late <span class="required">*</span></label>
          <textarea *ngIf="isLateArrival" [(ngModel)]="lateReason" placeholder="Reason for arriving after start time"
                    class="form-control" rows="2"></textarea>
          <label>Platform / Link (optional)</label>
          <input type="text" [(ngModel)]="poRemarks" placeholder="e.g. Zoom, Google Meet link"
                 class="form-control" (keydown.enter)="submitPo()">
          <div class="po-actions">
            <button class="btn btn-primary" (click)="submitPo()" [disabled]="saving || (isLateArrival && !lateReason.trim())">Submit</button>
            <button class="btn btn-secondary" (click)="showPoRemarks = false; lateReason = ''">Cancel</button>
          </div>
        </div>

        <div class="on-leave-badge" *ngIf="hasApprovedLeave">
          <i class="fa fa-umbrella"></i> On Approved Leave
        </div>

        <p class="hint" *ngIf="canCheckIn() && !saving">
          Select PP if you are physically in school, or PO if attending online.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .checkin-container {
      padding: 1.5rem;
      max-width: 560px;
      margin: 0 auto;
    }
    .checkin-card {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .checkin-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      color: #0f2744;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .checkin-card h2 i { color: #1e3a5f; }
    .subtitle { margin: 0 0 1.5rem 0; color: #6a8cad; font-size: 0.9375rem; }
    .date-time-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .date-box, .time-box {
      flex: 1;
      background: #f7f9fc;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .date-box .label, .time-box .label {
      display: block;
      font-size: 0.75rem;
      color: #6a8cad;
      margin-bottom: 0.25rem;
    }
    .date-box .value, .time-box .value {
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f2744;
    }
    .live-clock { font-family: 'Consolas', monospace; letter-spacing: 0.05em; }
    .student-info {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
      border-radius: 12px;
      border-left: 4px solid #1e3a5f;
    }
    .student-info .name { font-size: 1.125rem; font-weight: 600; color: #0f2744; display: block; }
    .student-info .class-info { font-size: 0.875rem; color: #6a8cad; }
    .status-section {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .status-label { font-size: 0.9375rem; color: #6a8cad; }
    .status-badge {
      padding: 0.4rem 1rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
    .badge-leave { background: #ede9fe; color: #7c3aed; }
    .badge-holiday { background: #f3f4f6; color: #6b7280; }
    .badge-not-marked { background: #fef3c7; color: #d97706; }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-pp { background: #059669; color: #fff; }
    .btn-pp:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
    .btn-po { background: #2563eb; color: #fff; }
    .btn-po:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
    .btn-out { background: #6b7280; color: #fff; }
    .btn-out:hover:not(:disabled) { background: #4b5563; transform: translateY(-1px); }
    .btn-primary { background: #1e3a5f; color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
    .po-remarks {
      margin-top: 1rem;
      padding: 1rem;
      background: #f7f9fc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .po-remarks label { display: block; font-size: 0.875rem; margin-bottom: 0.5rem; color: #374151; }
    .po-remarks .form-control {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      margin-bottom: 0.75rem;
      box-sizing: border-box;
    }
    .po-actions { display: flex; gap: 0.5rem; }
    .school-hours {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f0fdf4;
      border-radius: 10px;
      border: 1px solid #bbf7d0;
      font-size: 0.9375rem;
    }
    .school-hours .label { display: block; font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.5rem; }
    .hours-inputs { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
    .hours-item label { display: block; font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.25rem; }
    .time-input {
      padding: 0.4rem 0.6rem;
      border: 2px solid #d9e2ec;
      border-radius: 6px;
      font-size: 0.9375rem;
    }
    .school-hours .hours-value { font-weight: 600; color: #059669; }
    .late-reason-box, .early-leave-box {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fffbeb;
      border-radius: 12px;
      border: 1px solid #fde68a;
    }
    .late-reason-box label, .early-leave-box label { display: block; font-size: 0.875rem; margin-bottom: 0.5rem; color: #92400e; font-weight: 500; }
    .required { color: #dc2626; }
    .late-reason-box .form-control, .early-leave-box .form-control {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      margin-bottom: 0.75rem;
      box-sizing: border-box;
    }
    .panel-actions { display: flex; gap: 0.5rem; }
    .on-leave-badge {
      padding: 1rem;
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      color: #7c3aed;
      font-weight: 600;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .hint { margin: 1rem 0 0 0; font-size: 0.8125rem; color: #6a8cad; }
  `]
})
export class AttendanceCheckinComponent implements OnInit, OnDestroy {
  student: Student | null = null;
  todayAttendance: Attendance | null = null;
  todayDate = '';
  currentTime = '--:--:--';
  loading = true;
  saving = false;
  showPoRemarks = false;
  showEarlyLeavePanel = false;
  poRemarks = '';
  lateReason = '';
  earlyLeaveReason = '';
  approvedLeaveDates: string[] = [];

  /** UI-only demo: Mark PP updates state locally, no backend call */
  readonly uiDemoMode = true;

  /** Configurable school hours (defaults; will come from API later) */
  startTime = '08:00';
  endTime = '15:00';

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  get startTimeDisplay(): string {
    return this.formatTimeDisplay(this.startTime);
  }

  get endTimeDisplay(): string {
    return this.formatTimeDisplay(this.endTime);
  }

  /** Current time is after start time */
  get isLateArrival(): boolean {
    return this.timeToMinutes(this.currentTime) > this.timeToMinutes(this.startTime);
  }

  /** Current time is before end time */
  get isEarlyLeave(): boolean {
    return this.timeToMinutes(this.currentTime) < this.timeToMinutes(this.endTime);
  }

  private formatTimeDisplay(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const h12 = h % 12 || 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  private timeToMinutes(t: string): number {
    const parts = t.split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    return h * 60 + m;
  }

  constructor(
    private auth: AuthService,
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

  get className(): string {
    if (!this.student) return '';
    const c = this.student.class?.name ?? '';
    const s = this.student.section?.name ?? '';
    return s ? `${c} - ${s}` : c || '—';
  }

  get hasApprovedLeave(): boolean {
    return this.approvedLeaveDates.includes(this.todayDate);
  }

  ngOnInit(): void {
    this.updateDateAndTime();
    this.clockInterval = setInterval(() => this.updateTime(), 1000);
    this.loadStudentAndAttendance();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private updateDateAndTime(): void {
    const now = new Date();
    this.todayDate = now.toISOString().split('T')[0];
    this.currentTime = now.toTimeString().split(' ')[0];
  }

  private updateTime(): void {
    this.currentTime = new Date().toTimeString().split(' ')[0];
  }

  private loadStudentAndAttendance(): void {
    const userId = this.auth.getUserId();
    if (this.uiDemoMode && !userId) {
      this.student = { studentId: 1, name: 'Demo Student', class: { classId: 1, name: 'Class 10' }, section: { sectionId: 1, name: 'A' } } as Student;
      this.todayAttendance = null;
      this.loading = false;
      return;
    }
    if (!userId) {
      this.loading = false;
      this.notify.error('Please log in');
      return;
    }

    this.studentService.getStudentById(userId).subscribe({
      next: (s) => {
        this.student = s;
        const studentId = (s as any).studentId ?? s.userId ?? userId;
        if (this.uiDemoMode) {
          this.todayAttendance = null;
          this.loading = false;
          return;
        }
        this.attendanceService.getTodayAttendance(studentId).subscribe({
          next: (att) => {
            this.todayAttendance = att ?? null;
            this.loading = false;
          },
          error: () => {
            this.todayAttendance = null;
            this.loading = false;
          }
        });
        this.loadLeaveDates(studentId);
      },
      error: () => {
        this.loading = false;
        this.notify.error('Could not load student profile');
      }
    });
  }

  private loadLeaveDates(studentId: number): void {
    this.attendanceService.getMyLeaves('student', studentId).subscribe({
      next: (leaves) => {
        this.approvedLeaveDates = leaves
          .filter(l => l.status === 'approved')
          .flatMap(l => this.dateRange(l.leaveFrom, l.leaveTo));
      },
      error: () => {}
    });
  }

  private dateRange(from: string, to: string): string[] {
    const start = new Date(from);
    const end = new Date(to);
    const out: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      out.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  canCheckIn(): boolean {
    if (this.uiDemoMode && this.student) return (this.todayAttendance?.status ?? 0) === 0;
    if (this.hasApprovedLeave || !this.student) return false;
    const s = this.todayAttendance?.status ?? 0;
    return s === 0; // Not marked
  }

  canCheckOut(): boolean {
    if (!this.todayAttendance?.timeIn || this.hasApprovedLeave) return false;
    if (this.todayAttendance.timeOut) return false; // Already checked out
    const s = this.todayAttendance.status ?? 0;
    return s === 1 || s === 2 || s === 7; // PP, PO, Late
  }

  getStatusLabel(): string {
    if (this.hasApprovedLeave) return 'On Leave';
    const s = this.todayAttendance?.status ?? 0;
    const map: Record<number, string> = {
      0: 'Not Marked',
      1: 'PP (Physical Present)',
      2: 'PO (Present Online)',
      3: 'Absent',
      4: 'Short Leave',
      5: 'Full Leave',
      6: 'Holiday',
      7: 'Late'
    };
    return map[s] ?? 'Unknown';
  }

  getStatusClass(): string {
    if (this.hasApprovedLeave) return 'badge-leave';
    const s = this.todayAttendance?.status ?? 0;
    const map: Record<number, string> = {
      0: 'badge-not-marked',
      1: 'badge-pp',
      2: 'badge-po',
      3: 'badge-absent',
      4: 'badge-leave',
      5: 'badge-leave',
      6: 'badge-holiday',
      7: 'badge-pp'
    };
    return map[s] ?? 'badge-not-marked';
  }

  checkIn(mode: 'PP' | 'PO'): void {
    if (!this.student) return;
    if (mode === 'PO') {
      this.showPoRemarks = true;
      return;
    }
    if (this.isLateArrival && !this.lateReason.trim()) {
      this.notify.warning('Please provide reason for being late');
      return;
    }
    this.doCheckIn(mode, this.lateReason.trim(), this.poRemarks.trim());
  }

  submitPo(): void {
    if (this.isLateArrival && !this.lateReason.trim()) {
      this.notify.warning('Please provide reason for being late');
      return;
    }
    this.doCheckIn('PO', this.lateReason.trim(), this.poRemarks.trim());
    this.showPoRemarks = false;
    this.poRemarks = '';
    this.lateReason = '';
  }

  private doCheckIn(mode: 'PP' | 'PO', lateReason: string, platformRemarks: string): void {
    if (!this.student) return;
    this.saving = true;
    const now = new Date();
    const timeIn = now.toTimeString().split(' ')[0];
    const remarks = [lateReason, platformRemarks].filter(Boolean).join(' | ') || undefined;

    if (this.uiDemoMode) {
      this.todayAttendance = {
        attendanceId: 0,
        studentId: (this.student as any).studentId ?? 0,
        status: mode === 'PP' ? 1 : 2,
        date: this.todayDate,
        timeIn,
        remarks,
        student: this.student
      } as Attendance;
      this.saving = false;
      this.notify.success(`Check-in successful (${mode}) [UI demo]`);
      return;
    }

    const studentId = (this.student as any).studentId ?? this.student.userId ?? this.auth.getUserId()!;
    this.attendanceService.checkIn({
      studentId,
      date: this.todayDate,
      mode,
      timeIn,
      remarks
    }).subscribe({
      next: (att) => {
        this.todayAttendance = att;
        this.saving = false;
        this.notify.success(`Check-in successful (${mode})`);
      },
      error: (err) => {
        this.saving = false;
        this.notify.error(err?.error?.message ?? 'Check-in failed');
      }
    });
  }

  initCheckOut(): void {
    if (!this.student) return;
    if (this.isEarlyLeave) {
      this.showEarlyLeavePanel = true;
      this.earlyLeaveReason = '';
    } else {
      this.doCheckOut();
    }
  }

  doCheckOut(): void {
    if (!this.student) return;
    if (this.showEarlyLeavePanel && this.isEarlyLeave && !this.earlyLeaveReason.trim()) {
      this.notify.warning('Please provide reason for leaving early');
      return;
    }
    this.saving = true;
    const timeOut = new Date().toTimeString().split(' ')[0];

    if (this.uiDemoMode) {
      this.todayAttendance = this.todayAttendance
        ? { ...this.todayAttendance, timeOut, remarks: (this.todayAttendance.remarks || '') + (this.earlyLeaveReason ? ` | Early: ${this.earlyLeaveReason}` : '') } as Attendance
        : null;
      this.saving = false;
      this.showEarlyLeavePanel = false;
      this.earlyLeaveReason = '';
      this.notify.success('Check-out successful [UI demo]');
      return;
    }

    const studentId = (this.student as any).studentId ?? this.student.userId ?? this.auth.getUserId()!;
    this.attendanceService.checkOut({
      studentId,
      date: this.todayDate,
      timeOut,
      remarks: this.earlyLeaveReason.trim() || undefined
    }).subscribe({
      next: (att) => {
        this.todayAttendance = att;
        this.saving = false;
        this.showEarlyLeavePanel = false;
        this.earlyLeaveReason = '';
        this.notify.success('Check-out successful');
      },
      error: (err) => {
        this.saving = false;
        this.notify.error(err?.error?.message ?? 'Check-out failed');
      }
    });
  }
}
