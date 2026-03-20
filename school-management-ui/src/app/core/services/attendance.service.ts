import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAttendanceDailySummary, AdminAttendanceReportsResponse, AdminAttendanceReportType, Attendance, AttendanceCalendarItem, AttendanceCorrection, ClassAttendanceSheetItem, CheckInRequest, CheckOutRequest, CreateCorrectionRequest, LeaveApplication, MonthlyGridResponse, StaffAttendance, StaffAttendanceBulkRequest, StaffAttendanceHistory, UpsertAttendanceCalendarItemRequest, UpdateAttendanceRequest } from '../models/attendance.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/api/attendance`;
  private adminAttendanceUrl = `${environment.apiUrl}/api/admin/attendance`;

  constructor(private http: HttpClient) {}

  getAttendance(date: string, classId?: number, sectionId?: number): Observable<Attendance[]> {
    let params = new HttpParams().set('date', date);
    if (classId) params = params.set('classId', classId.toString());
    if (sectionId) params = params.set('sectionId', sectionId.toString());

    return this.http.get<Attendance[]>(this.apiUrl, { params });
  }

  getAttendanceById(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
  }

  getAttendanceReport(studentId: number, month: number, year: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/report/${studentId}`, {
      params: { month: month.toString(), year: year.toString() }
    });
  }

  /** Student: today's attendance status */
  getTodayAttendance(studentId: number): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${this.apiUrl}/today/${studentId}`);
  }

  /** Student: check-in (PP or PO) */
  checkIn(req: CheckInRequest): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/checkin`, req);
  }

  /** Student: check-out */
  checkOut(req: CheckOutRequest): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.apiUrl}/checkout`, req);
  }

  /** Leave applications: list own */
  getMyLeaves(applicantType: 'student' | 'teacher' | 'staff', applicantId: number): Observable<LeaveApplication[]> {
    const params = new HttpParams()
      .set('applicantType', applicantType)
      .set('applicantId', applicantId.toString());
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/leaves`, { params });
  }

  /** Admin: list all leave applications */
  getAllLeaves(applicantType?: string, status?: string): Observable<LeaveApplication[]> {
    let params = new HttpParams();
    if (applicantType) params = params.set('applicantType', applicantType);
    if (status) params = params.set('status', status);
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/leaves/all`, { params });
  }

  /** Admin: approve or reject leave */
  reviewLeave(id: number, status: 'approved' | 'rejected', reviewerRemarks?: string): Observable<LeaveApplication> {
    return this.http.patch<LeaveApplication>(`${this.apiUrl}/leaves/${id}/review`, {
      status,
      reviewerRemarks
    });
  }

  /** Apply leave */
  applyLeave(dto: Partial<LeaveApplication>): Observable<LeaveApplication> {
    return this.http.post<LeaveApplication>(`${this.apiUrl}/leaves`, dto);
  }

  /** Update pending leave */
  updateLeave(id: number, dto: Partial<LeaveApplication>): Observable<LeaveApplication> {
    return this.http.put<LeaveApplication>(`${this.apiUrl}/leaves/${id}`, dto);
  }

  /** Cancel pending leave */
  cancelLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leaves/${id}`);
  }

  createAttendance(attendance: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(this.apiUrl, attendance);
  }

  updateAttendance(id: number, attendance: Attendance): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/${id}`, attendance);
  }

  /** Edit attendance (partial update) */
  editAttendance(id: number, dto: UpdateAttendanceRequest): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.apiUrl}/${id}`, dto);
  }

  deleteAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Attendance correction: create request */
  createCorrection(dto: CreateCorrectionRequest): Observable<AttendanceCorrection> {
    return this.http.post<AttendanceCorrection>(`${environment.apiUrl}/api/attendance-correction`, dto);
  }

  /** Attendance correction: get my requests (student) */
  getMyCorrections(studentId: number): Observable<AttendanceCorrection[]> {
    return this.http.get<AttendanceCorrection[]>(`${environment.apiUrl}/api/attendance-correction/student/${studentId}`);
  }

  /** Attendance correction: get my requests (teacher) */
  getMyTeacherCorrections(): Observable<AttendanceCorrection[]> {
    return this.http.get<AttendanceCorrection[]>(`${environment.apiUrl}/api/attendance-correction/teacher/me`);
  }

  /** Attendance correction: get pending (admin) */
  getPendingCorrections(): Observable<AttendanceCorrection[]> {
    return this.http.get<AttendanceCorrection[]>(`${environment.apiUrl}/api/attendance-correction/pending`);
  }

  /** Attendance correction: review (approve/reject) */
  reviewCorrection(id: number, status: 'approved' | 'rejected', reviewerRemarks?: string): Observable<AttendanceCorrection> {
    return this.http.patch<AttendanceCorrection>(`${environment.apiUrl}/api/attendance-correction/${id}/review`, {
      status,
      reviewerRemarks
    });
  }

  /** Teacher: get today's attendance */
  getTeacherTodayAttendance(): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${environment.apiUrl}/api/teacher-attendance/today`);
  }

  /** Teacher: get this month's attendance */
  getTeacherThisMonthAttendance(month?: number, year?: number): Observable<Attendance[]> {
    let params = new HttpParams();
    if (month != null) params = params.set('month', month.toString());
    if (year != null) params = params.set('year', year.toString());
    return this.http.get<Attendance[]>(`${environment.apiUrl}/api/teacher-attendance/this-month`, { params });
  }

  /** Teacher: check-in */
  teacherCheckIn(dto: { date: string; timeIn: string; remarks?: string }): Observable<Attendance> {
    return this.http.post<Attendance>(`${environment.apiUrl}/api/teacher-attendance/checkin`, dto);
  }

  /** Teacher: check-out */
  teacherCheckOut(dto: { date: string; timeOut: string; remarks?: string }): Observable<Attendance> {
    return this.http.patch<Attendance>(`${environment.apiUrl}/api/teacher-attendance/checkout`, dto);
  }

  /** Bulk save class attendance (generic – admin or teacher) */
  bulkSaveAttendance(dto: {
    date: string;
    classId: number;
    sectionId?: number;
    records: { studentId: number; status: number; timeIn?: string | null; timeOut?: string | null; remarks?: string; leaveReason?: string }[];
  }): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.apiUrl}/bulk`, dto);
  }

  /** Admin: get class attendance for a date (list of attendance records). */
  getAdminClassAttendance(date: string, classId: number, sectionId?: number): Observable<Attendance[]> {
    let params = new HttpParams().set('date', date).set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get<Attendance[]>(`${this.adminAttendanceUrl}/class`, { params });
  }

  /** Admin: get class attendance sheet (one row per student with attendance merged). */
  getAdminClassAttendanceSheet(date: string, classId: number, sectionId?: number): Observable<ClassAttendanceSheetItem[]> {
    let params = new HttpParams().set('date', date).set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get<ClassAttendanceSheetItem[]>(`${this.adminAttendanceUrl}/class/sheet`, { params });
  }

  /** Admin: bulk save class attendance. */
  saveAdminClassAttendance(dto: {
    date: string;
    classId: number;
    sectionId?: number;
    records: { studentId: number; status: number; timeIn?: string | null; timeOut?: string | null; remarks?: string; leaveReason?: string }[];
  }): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.adminAttendanceUrl}/class`, dto);
  }

  /** Admin: load staff attendance for a date. */
  getAdminStaffAttendance(date: string): Observable<StaffAttendance[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<StaffAttendance[]>(`${this.adminAttendanceUrl}/staff`, { params });
  }

  /** Admin: bulk save staff attendance. */
  saveAdminStaffAttendance(dto: StaffAttendanceBulkRequest): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.adminAttendanceUrl}/staff`, dto);
  }

  /** Admin: staff attendance history. */
  getAdminStaffAttendanceHistory(staffId: number): Observable<StaffAttendanceHistory[]> {
    return this.http.get<StaffAttendanceHistory[]>(`${this.adminAttendanceUrl}/staff/history/${staffId}`);
  }

  /** Admin: shared attendance calendar items by year. */
  getAdminAttendanceCalendarItems(year: number): Observable<AttendanceCalendarItem[]> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<AttendanceCalendarItem[]>(`${this.adminAttendanceUrl}/calendar`, { params });
  }

  /** Admin: create a calendar item. */
  createAdminAttendanceCalendarItem(dto: UpsertAttendanceCalendarItemRequest): Observable<AttendanceCalendarItem> {
    return this.http.post<AttendanceCalendarItem>(`${this.adminAttendanceUrl}/calendar`, dto);
  }

  /** Admin: update a calendar item. */
  updateAdminAttendanceCalendarItem(id: number, dto: UpsertAttendanceCalendarItemRequest): Observable<AttendanceCalendarItem> {
    return this.http.put<AttendanceCalendarItem>(`${this.adminAttendanceUrl}/calendar/${id}`, dto);
  }

  /** Admin: delete a calendar item. */
  deleteAdminAttendanceCalendarItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminAttendanceUrl}/calendar/${id}`);
  }

  /** Admin: daily summary for a date. */
  getAdminAttendanceDailySummary(date: string): Observable<AdminAttendanceDailySummary> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AdminAttendanceDailySummary>(`${this.adminAttendanceUrl}/daily`, { params });
  }

  /** Admin: send reminders for the selected date. */
  sendAdminAttendanceDailyReminders(date: string): Observable<{ count: number; message: string }> {
    return this.http.post<{ count: number; message: string }>(`${this.adminAttendanceUrl}/daily/reminders`, {
      date
    });
  }

  /** Admin: export daily summary CSV. */
  exportAdminAttendanceDailySummaryCsv(date: string): Observable<Blob> {
    const params = new HttpParams().set('date', date);
    return this.http.get(`${this.adminAttendanceUrl}/daily/export`, {
      params,
      responseType: 'blob'
    });
  }

  /** Admin: monthly attendance grid. */
  getAdminMonthlyGrid(month: number, year: number, classId?: number | null, sectionId?: number | null): Observable<MonthlyGridResponse> {
    let params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    if (classId != null) params = params.set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get<MonthlyGridResponse>(`${this.adminAttendanceUrl}/monthly/grid`, { params });
  }

  /** Admin: export monthly grid as CSV. */
  exportAdminMonthlyGridCsv(month: number, year: number, classId?: number | null, sectionId?: number | null): Observable<Blob> {
    let params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    if (classId != null) params = params.set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get(`${this.adminAttendanceUrl}/monthly/grid/export`, {
      params,
      responseType: 'blob'
    });
  }

  /** Admin: attendance reports (table + analytics). */
  getAdminAttendanceReports(
    dateFrom: string,
    dateTo: string,
    reportType: AdminAttendanceReportType,
    classId?: number | null,
    sectionId?: number | null
  ): Observable<AdminAttendanceReportsResponse> {
    let params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo)
      .set('reportType', reportType);
    if (classId != null) params = params.set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get<AdminAttendanceReportsResponse>(`${this.adminAttendanceUrl}/reports`, { params });
  }

  /** Admin: attendance reports generate action. */
  generateAdminAttendanceReports(dto: {
    dateFrom: string;
    dateTo: string;
    classId?: number | null;
    sectionId?: number | null;
    reportType: AdminAttendanceReportType;
  }): Observable<AdminAttendanceReportsResponse> {
    return this.http.post<AdminAttendanceReportsResponse>(`${this.adminAttendanceUrl}/reports/generate`, dto);
  }

  /** Admin: export filtered reports list CSV. */
  exportAdminAttendanceReportsCsv(
    dateFrom: string,
    dateTo: string,
    reportType: AdminAttendanceReportType,
    classId?: number | null,
    sectionId?: number | null
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo)
      .set('reportType', reportType);
    if (classId != null) params = params.set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get(`${this.adminAttendanceUrl}/reports/export`, {
      params,
      responseType: 'blob'
    });
  }

  /** Admin: export one report row CSV by id. */
  exportAdminAttendanceSingleReportCsv(
    reportId: number,
    dateFrom: string,
    dateTo: string,
    reportType: AdminAttendanceReportType,
    classId?: number | null,
    sectionId?: number | null
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo)
      .set('reportType', reportType);
    if (classId != null) params = params.set('classId', classId.toString());
    if (sectionId != null) params = params.set('sectionId', sectionId.toString());
    return this.http.get(`${this.adminAttendanceUrl}/reports/export/${reportId}`, {
      params,
      responseType: 'blob'
    });
  }
}

