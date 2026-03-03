import { Component, OnInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { ClassService } from '../../../core/services/class.service';
import { FamilyService } from '../../../core/services/family/family.service';
import { SectionService } from '../../../core/services/section.service';
import { AcademicSessionService } from '../../../core/services/academic-session.service';
import { Student, Class } from '../../../core/models/student.model';
import { CreateStudentDto, UpdateStudentDto } from '../../../core/models/create-student.dto';
import { Section } from '../../../core/models/section.model';
import { Family } from '../../../core/models/family.model';
import { AcademicSession } from '../../../core/models/academic-session.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="students-container">
      <app-loading [show]="loading" [message]="'Loading students...'"></app-loading>
      
      <div class="page-header-card" *ngIf="!addOnly">
        <div class="header-content">
          <div class="header-left">
            <div class="page-title-wrap">
              <h1 class="page-title"><i class="fa fa-user-graduate"></i> Active Students</h1>
              <p class="page-subtitle">Manage and browse your student records</p>
            </div>
          </div>
          <div class="header-actions">
            <a routerLink="/admin/students/drop" class="btn btn-outline">
              <i class="fa fa-user-times"></i> Drop Students
            </a>
            <a routerLink="/admin/students/add" class="btn btn-primary">
              <i class="fa fa-plus"></i> Add New Student
            </a>
          </div>
        </div>
      </div>

      <div class="filters-card" *ngIf="!addOnly">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterStudents()"
            placeholder="Search by name, email, or roll number..."
            class="modern-form-control search-input">
        </div>
        <div class="class-filter-box">
          <button type="button" class="class-filter-trigger" (click)="toggleClassFilter($event)" [class.open]="classFilterOpen">
            <i class="fa fa-book"></i>
            <span>{{ getSelectedClassName() }}</span>
            <i class="fa fa-chevron-down trigger-chevron"></i>
          </button>
          <div class="class-filter-dropdown" *ngIf="classFilterOpen" (click)="$event.stopPropagation()">
            <button type="button" class="class-filter-option" [class.selected]="selectedClassId === null" (click)="selectClass(null)">
              All Classes
            </button>
            <button type="button" class="class-filter-option" *ngFor="let cls of classes" [class.selected]="selectedClassId === cls.classId" (click)="selectClass(cls.classId)">
              {{ cls.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="addOnly || showAddForm || editingStudent" class="student-form-card">
        <div class="form-card-header">
          <div class="form-header-left">
            <button type="button" class="form-back-btn" (click)="cancelForm()" *ngIf="!addOnly">
              <i class="fa fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <h2 class="form-main-title">
              <i class="fa" [ngClass]="editingStudent ? 'fa-user-edit' : 'fa-user-plus'"></i>
              {{ editingStudent ? 'Edit Student' : 'New Student Details' }}
            </h2>
          </div>
        </div>
        <form (ngSubmit)="saveStudent()" class="student-form-body">
          <div class="form-section">
            <h3 class="section-label"><i class="fa fa-users"></i> Family</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Family</label>
                <select [(ngModel)]="studentForm.familyId" name="familyId" class="form-control" (change)="onFamilySelect()">
                  <option [ngValue]="undefined">-- Select Family --</option>
                  <option *ngFor="let f of families" [ngValue]="f.familyId">{{ f.fatherName }} ({{ f.fatherPhone || 'No phone' }})</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label"><i class="fa fa-user"></i> Personal Information</h3>
            <div class="form-row">
              <div class="form-group"><label>Name (English) *</label><input type="text" [(ngModel)]="studentForm.name" name="name" required class="form-control" placeholder="Name in English" [class.is-invalid]="submitted && !studentForm.name"></div>
              <div class="form-group"><label>Roll Num</label><input type="text" [(ngModel)]="studentForm.roll" name="roll" class="form-control"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>School/College Reg Num</label><input type="text" [(ngModel)]="studentForm.schoolRegNum" name="schoolRegNum" class="form-control"></div>
              <div class="form-group"><label>B-Form / CNIC</label><input type="text" [(ngModel)]="studentForm.bFormCnic" name="bFormCnic" class="form-control"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Class *</label><select [(ngModel)]="studentForm.classId" name="classId" required class="form-control" (change)="onClassChange()" [class.is-invalid]="submitted && !studentForm.classId"><option [ngValue]="undefined">-- Select Class --</option><option *ngFor="let cls of classes" [ngValue]="cls.classId">{{ cls.name }}</option></select></div>
              <div class="form-group"><label>Section</label><select [(ngModel)]="studentForm.sectionId" name="sectionId" class="form-control"><option [ngValue]="undefined">-- Select Section --</option><option *ngFor="let sec of sectionsByClass" [ngValue]="sec.sectionId">{{ sec.name }}</option></select></div>
              <div class="form-group"><label>Session</label><select [(ngModel)]="studentForm.session" name="session" class="form-control"><option value="">-- Select Session --</option><option *ngFor="let s of sessions" [ngValue]="s.name">{{ s.name }}</option></select></div>
              <div class="form-group"><label>Fee Type</label><select [(ngModel)]="studentForm.feeType" name="feeType" class="form-control"><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option></select></div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date Of Birth</label>
                <input type="text" [(ngModel)]="displayBirthday" name="birthday" class="form-control" placeholder="dd/mm/yyyy" maxlength="10" (ngModelChange)="onDateInputChange($event, 'birthday')" (blur)="parseAndFormatDate('birthday')">
              </div>
              <div class="form-group"><label>Gender</label><select [(ngModel)]="studentForm.sex" name="sex" class="form-control"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              <div class="form-group"><label>Religion</label><select [(ngModel)]="studentForm.religion" name="religion" class="form-control"><option value="">-- Select Religion --</option><option value="Islam">Islam</option><option value="Christianity">Christianity</option><option value="Hinduism">Hinduism</option><option value="Other">Other</option></select></div>
              <div class="form-group"><label>Blood Group</label><select [(ngModel)]="studentForm.bloodGroup" name="bloodGroup" class="form-control"><option value="">-- Select Blood Group --</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label"><i class="fa fa-graduation-cap"></i> Admission Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Admission Date</label>
                <input type="text" [(ngModel)]="displayAdmissionDate" name="admissionDate" class="form-control" placeholder="dd/mm/yyyy" maxlength="10" (ngModelChange)="onDateInputChange($event, 'admission')" (blur)="parseAndFormatDate('admission')">
              </div>
              <div class="form-group"><label>Fee</label><input type="number" [(ngModel)]="studentForm.fee" name="fee" class="form-control" min="0" step="0.01" placeholder="0"></div>
              <div class="form-group"><label>Fee Discount</label><input type="number" [(ngModel)]="studentForm.feeDiscount" name="feeDiscount" class="form-control" min="0" step="0.01"></div>
              <div class="form-group"><label>Transport Charges</label><input type="number" [(ngModel)]="studentForm.transportCharges" name="transportCharges" class="form-control" min="0" step="0.01"></div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label"><i class="fa fa-address-book"></i> Guardian / Parents Information</h3>
            <div class="form-row">
              <div class="form-group"><label>Father Name</label><input type="text" [(ngModel)]="studentForm.fatherName" name="fatherName" class="form-control"></div>
              <div class="form-group"><label>Guardian Name</label><input type="text" [(ngModel)]="studentForm.guardianName" name="guardianName" class="form-control"></div>
              <div class="form-group"><label>Father/Guardian CNIC</label><input type="text" [(ngModel)]="studentForm.fatherGuardianCnic" name="fatherGuardianCnic" class="form-control"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Father Occupation</label><input type="text" [(ngModel)]="studentForm.fatherOccupation" name="fatherOccupation" class="form-control"></div>
              <div class="form-group"><label>Father/Guardian Phone</label><input type="text" [(ngModel)]="studentForm.fatherGuardianPhone" name="fatherGuardianPhone" class="form-control"></div>
              <div class="form-group"><label>SMS Number (Father/Guardian)</label><input type="text" [(ngModel)]="studentForm.smsNumber" name="smsNumber" class="form-control"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Mother Name</label><input type="text" [(ngModel)]="studentForm.motherName" name="motherName" class="form-control"></div>
              <div class="form-group"><label>Phone Number</label><input type="text" [(ngModel)]="studentForm.motherPhone" name="motherPhone" class="form-control"></div>
              <div class="form-group"><label>CNIC</label><input type="text" [(ngModel)]="studentForm.motherCnic" name="motherCnic" class="form-control"></div>
            </div>
            <div class="form-row">
              <div class="form-group full-width"><label>Address</label><textarea [(ngModel)]="studentForm.address" name="address" class="form-control" rows="3" placeholder="Full address"></textarea></div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <h3 class="section-label inline-label"><i class="fa fa-camera"></i> Profile Photo</h3>
                <div class="upload-zone" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)" (click)="fileInput.click()" [class.dragover]="isDragging">
                  <input #fileInput type="file" accept="image/*" (change)="onFileSelect($event)" style="display: none">
                  <span *ngIf="!selectedFile"><i class="fa fa-cloud-upload-alt"></i> Drop image here or click to browse</span>
                  <span *ngIf="selectedFile" class="upload-selected"><i class="fa fa-check-circle"></i> {{ selectedFile.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label"><i class="fa fa-school"></i> Previous Institute Information</h3>
            <div class="form-row">
              <div class="form-group flex-2"><label>Previous Institute Name</label><input type="text" [(ngModel)]="studentForm.previousInstituteName" name="previousInstituteName" class="form-control"></div>
              <div class="form-group"><label>Passing Class</label><input type="text" [(ngModel)]="studentForm.passingClass" name="passingClass" class="form-control"></div>
              <div class="form-group"><label>Passing Percentage</label><input type="number" [(ngModel)]="studentForm.passingPercentage" name="passingPercentage" class="form-control" min="0" max="100" step="0.01"></div>
              <div class="form-group"><label>Passing Year</label><input type="number" [(ngModel)]="studentForm.passingYear" name="passingYear" class="form-control" min="1990" [max]="currentYear" placeholder="e.g. 2024"></div>
            </div>
            <div class="form-row">
              <div class="form-group full-width"><label>Institute Address</label><input type="text" [(ngModel)]="studentForm.instituteAddress" name="instituteAddress" class="form-control" placeholder="Full institute address"></div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label"><i class="fa fa-lock"></i> Account (Login)</h3>
            <div class="form-row">
              <div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="studentForm.email" name="email" class="form-control" placeholder="student@example.com" [class.is-invalid]="submitted && !studentForm.email"></div>
              <div class="form-group" *ngIf="!editingStudent"><label>Password *</label><input type="password" [(ngModel)]="studentForm.password" name="password" class="form-control" placeholder="Enter password" [class.is-invalid]="submitted && !studentForm.password"></div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving">
              <i class="fa fa-spinner fa-spin" *ngIf="saving"></i>
              <i class="fa fa-check" *ngIf="!saving"></i>
              {{ saving ? 'Saving...' : 'Save Student' }}
            </button>
            <button type="button" class="btn-cancel" (click)="cancelForm()" [disabled]="saving">
              <i class="fa fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Students Table -->
      <div class="modern-table-card" *ngIf="!addOnly">
        <div class="modern-table-header">
          <div class="modern-table-title">
            <i class="fa fa-table"></i>
            Students List
          </div>
          <div class="table-toolbar">
            <div class="show-entries">
              <span>Show</span>
              <select [(ngModel)]="pageSize" (ngModelChange)="pageSizeChange()" class="entries-select">
                <option *ngFor="let size of pageSizeOptions" [ngValue]="size">{{ size }}</option>
              </select>
              <span>entries</span>
            </div>
            <div class="modern-table-count">
              <i class="fa fa-users"></i>
              <span>Total: {{ filteredStudents.length }} student(s)</span>
            </div>
          </div>
        </div>
        <div class="modern-table-responsive table-scroll-wrapper">
          <table class="modern-table student-list-table">
            <thead>
              <tr>
                <th (click)="sortBy('roll')" class="sortable">
                  Roll No.
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'roll' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('name')" class="sortable">
                  Student Name
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'name' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('fatherName')" class="sortable">
                  Father Name
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'fatherName' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('phone')" class="sortable">
                  Contact No
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'phone' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('sex')" class="sortable">
                  Gender
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'sex' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('feeType')" class="sortable">
                  Free/Paid
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'feeType' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('class')" class="sortable">
                  Class
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'class' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th (click)="sortBy('section')" class="sortable">
                  Section
                  <i class="fa sort-icon" [ngClass]="sortColumn === 'section' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th class="action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of paginatedStudents; let i = index">
                <td>
                  <span *ngIf="student.roll" class="roll-badge">{{ student.roll }}</span>
                  <span *ngIf="!student.roll" class="text-muted">-</span>
                </td>
                <td>
                  <div class="student-name">
                    <strong>{{ student.name }}</strong>
                  </div>
                </td>
                <td>
                  <span *ngIf="student.fatherName || student.smsNumber" class="text-value">{{ student.fatherName || '-' }}</span>
                  <span *ngIf="!student.fatherName && !student.smsNumber" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="student.phone || student.smsNumber" class="phone-text">{{ student.phone || student.smsNumber }}</span>
                  <span *ngIf="!student.phone && !student.smsNumber" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="student.sex" class="text-value">{{ student.sex }}</span>
                  <span *ngIf="!student.sex" class="text-muted">-</span>
                </td>
                <td>
                  <span class="fee-type-badge" [class.fee-paid]="student.feeType === 'Paid'" [class.fee-unpaid]="student.feeType === 'Unpaid'">{{ student.feeType || 'Unpaid' }}</span>
                </td>
                <td>
                  <span *ngIf="student.class?.name" class="modern-badge modern-badge-primary">{{ student.class?.name }}</span>
                  <span *ngIf="!student.class?.name" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="student.section?.name" class="text-value">{{ student.section?.name }}</span>
                  <span *ngIf="!student.section?.name" class="text-muted">-</span>
                </td>
                <td>
                  <div class="action-dropdown-wrapper">
                    <button type="button" class="action-btn" (mousedown)="openActionMenu(student, $event)" title="Actions">
                      <i class="fa fa-ellipsis-v"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="paginatedStudents.length === 0 && !loading">
                <td colspan="9" class="modern-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No students found</p>
                  <span *ngIf="searchTerm">Try adjusting your search criteria</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="filteredStudents.length > 0">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ getPageEndIndex() }} of {{ filteredStudents.length }} entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First">
              <i class="fa fa-angle-double-left"></i>
            </button>
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous">
              <i class="fa fa-angle-left"></i>
            </button>
            <span class="page-numbers">
              <button *ngFor="let p of getPageNumbers()" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            </span>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" title="Next">
              <i class="fa fa-angle-right"></i>
            </button>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)" title="Last">
              <i class="fa fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Action menu overlay: rendered at root to avoid clipping by table/scroll containers -->
      <div class="action-menu-overlay" *ngIf="openActionMenuId !== null" (mousedown)="$event.stopPropagation()">
        <div class="action-menu"
             [style.top.px]="actionMenuPos.top"
             [style.left.px]="actionMenuPos.left"
             role="menu">
          <button type="button" class="action-menu-item" (click)="viewStudent(openActionStudent!); closeActionMenu()" role="menuitem">
            <i class="fa fa-eye"></i>
            <span>View</span>
          </button>
          <button type="button" class="action-menu-item" (click)="editStudent(openActionStudent!); closeActionMenu()" role="menuitem">
            <i class="fa fa-edit"></i>
            <span>Edit</span>
          </button>
          <button type="button" class="action-menu-item" *ngIf="openActionStudent?.status !== 'Dropped'" (click)="confirmDrop(openActionStudent!); closeActionMenu()" role="menuitem">
            <i class="fa fa-user-times"></i>
            <span>Drop</span>
          </button>
          <button type="button" class="action-menu-item action-menu-item-danger" (click)="confirmDelete(openActionStudent!); closeActionMenu()" role="menuitem">
            <i class="fa fa-trash"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>

      <app-confirm-dialog *ngIf="!addOnly"
        [show]="showDeleteConfirm"
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteStudent()"
        (cancelled)="showDeleteConfirm = false; studentToDelete = null">
      </app-confirm-dialog>
      <app-confirm-dialog *ngIf="!addOnly"
        [show]="showDropConfirm"
        title="Drop Student"
        message="Are you sure you want to mark this student as Dropped? They will be moved to the Drop Students list and can be reactivated later."
        confirmText="Drop"
        cancelText="Cancel"
        (confirmed)="dropStudent()"
        (cancelled)="showDropConfirm = false; studentToDrop = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .students-container {
      padding: 0;
      position: relative;
    }
    
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .header-left { display: flex; align-items: center; }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn-outline {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; color: var(--primary); background: transparent;
      border: 2px solid var(--primary); text-decoration: none; cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover { background: rgba(30,58,95,0.08); }
    
    .page-title-wrap { display: flex; flex-direction: column; gap: 0.25rem; }
    
    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .page-title i {
      color: var(--primary);
      font-size: 1.375rem;
    }
    
    .page-subtitle {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--text-tertiary);
      padding-left: 2.15rem;
    }
    
    .filters-card {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      padding: 1.25rem 1.5rem;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    
    .search-box {
      position: relative;
      flex: 1;
      min-width: 300px;
    }
    
    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      z-index: 1;
    }
    
    .search-input {
      padding-left: 3rem;
    }

    .class-filter-box {
      position: relative;
      min-width: 220px;
    }

    .class-filter-trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      min-height: 44px;
      padding: 0.6rem 1rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-primary);
      background: var(--bg-primary, #fff);
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .class-filter-trigger:hover {
      border-color: #cbd5e1;
    }

    .class-filter-trigger.open {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .class-filter-trigger i.fa-book {
      color: var(--text-tertiary);
      font-size: 0.95rem;
    }

    .class-filter-trigger span {
      flex: 1;
    }

    .trigger-chevron {
      color: var(--text-tertiary);
      font-size: 0.75rem;
      transition: transform 0.2s ease;
    }

    .class-filter-trigger.open .trigger-chevron {
      transform: rotate(180deg);
    }

    .class-filter-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      padding: 6px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      z-index: 1000;
    }

    .class-filter-option {
      display: block;
      width: 100%;
      padding: 10px 14px;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-primary);
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .class-filter-option:hover {
      background: #f1f5f9;
      color: var(--primary);
    }

    .class-filter-option.selected {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
    }
    
    .btn {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-md);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .btn-primary {
      background: var(--primary-gradient);
      color: var(--text-inverse);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn-secondary {
      background: var(--gray-600);
      color: var(--text-inverse);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: var(--gray-700);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .student-name strong {
      color: var(--text-primary);
      font-weight: 600;
    }
    
    .email-text {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    
    .phone-text {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    
    .id-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    
    .status-badge {
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .status-active { background: #d4edda; color: #155724; }
    .status-dropped { background: #f8d7da; color: #721c24; }
    .btn-drop { background: #fd7e14 !important; color: white !important; }
    .roll-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      background: var(--bg-secondary);
      border-radius: var(--radius-full);
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .text-muted {
      color: var(--text-tertiary);
      font-style: italic;
    }

    .text-value {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .show-entries {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .entries-select {
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color, #ddd);
      font-size: 0.9rem;
      background: white;
      min-width: 60px;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    .sortable:hover {
      color: var(--primary);
    }

    .sort-icon {
      margin-left: 0.35rem;
      opacity: 0.6;
      font-size: 0.75rem;
    }

    .action-col {
      min-width: 110px;
    }

    .action-dropdown-wrapper {
      position: relative;
      display: inline-flex;
      justify-content: center;
      z-index: 1;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8fafc;
      color: #334155;
      border-color: #cbd5e1;
    }

    .action-btn i {
      font-size: 1rem;
    }

    /* Overlay: full viewport, above table/scroll. pointer-events: none so clicks pass through except on menu */
    .action-menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
    }

    .action-menu-overlay .action-menu {
      pointer-events: auto;
    }

    .action-menu {
      position: fixed;
      min-width: 140px;
      padding: 6px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    }

    .action-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 6px;
      background: transparent;
      font-size: 0.9rem;
      color: #334155;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;
    }

    .action-menu-item:hover {
      background: #f1f5f9;
    }

    .action-menu-item i {
      width: 18px;
      color: #64748b;
      font-size: 0.875rem;
    }

    .action-menu-item:hover i {
      color: #334155;
    }

    .action-menu-item-danger:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    .action-menu-item-danger:hover i {
      color: #dc2626;
    }

    .fee-type-badge {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .fee-paid { background: #d4edda; color: #155724; }
    .fee-unpaid { background: #fff3cd; color: #856404; }

    .table-scroll-wrapper {
      overflow: visible !important;
    }

    .student-list-table {
      overflow: visible;
    }

    .student-list-table td,
    .student-list-table th {
      overflow: visible;
    }

    .student-list-table thead th {
      background: #f5f0e8;
      color: #5c4a2e;
      font-weight: 600;
      padding: 0.75rem 1rem;
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #fafbfc;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .page-btn, .page-num {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      min-width: 38px;
      color: #334155;
      transition: all 0.2s ease;
    }

    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: #f8fafc;
    }

    .page-num.active {
      background: var(--primary-gradient);
      color: white;
      border-color: transparent;
    }

    .page-num.active:hover {
      opacity: 0.95;
    }

    .page-numbers {
      display: flex;
      gap: 0.35rem;
    }
    
    .student-form-card {
      background: #fff;
      border-radius: 16px;
      padding: 0;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .form-card-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #f1f5f9;
      background: #fafbfc;
    }
    .form-header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .form-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .form-back-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: var(--text-primary); }
    .form-main-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .form-main-title i { color: var(--primary); }
    .student-form-body {
      padding: 2rem;
    }
    .form-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #fafbfc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }
    .form-section:last-of-type { margin-bottom: 0; }
    .form-section-grid { display: flex; gap: 2rem; flex-wrap: wrap; }
    .section-label {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .section-label i { color: var(--primary); font-size: 0.95rem; }
    .section-label.inline-label { margin-bottom: 0.75rem; padding-bottom: 0.5rem; }
    .upload-col { flex: 0 0 200px; }
    .fields-col { flex: 1; min-width: 400px; }
    .upload-zone {
      border: 2px dashed #cbd5e1;
      background: #fff;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      border-radius: 12px;
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .upload-zone:hover, .upload-zone.dragover {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.04);
      color: var(--primary);
    }
    .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .form-group { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group.flex-2 { flex: 2; }
    .form-group.full-width { flex: 1 1 100%; }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .student-form-card .form-control {
      width: 100%;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font-size: 0.9375rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .student-form-card .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .student-form-card .form-control.is-invalid { border-color: #dc2626; }
    .student-form-card select.form-control { cursor: pointer; }
    .form-actions {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary-gradient);
      color: #fff;
      padding: 0.65rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .btn-save:disabled { opacity: 0.7; cursor: default; transform: none; }
    .btn-cancel {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #fff;
      color: var(--text-secondary);
      padding: 0.65rem 1.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-cancel:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; color: var(--text-primary); }
    .btn-cancel:disabled { opacity: 0.7; cursor: default; }

    .upload-zone span { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
    .upload-zone .upload-selected { color: #059669; }
    .upload-zone .fa-cloud-upload-alt, .upload-zone .fa-check-circle { font-size: 1.5rem; }

    @media (max-width: 768px) {
      .page-header-card, .filters-card { padding: 1rem; }
      .header-content { flex-direction: column; align-items: flex-start; }
      .filters-card { flex-direction: column; }
      .search-box, .class-filter-box { width: 100%; min-width: auto; }
      .form-section-grid { flex-direction: column; }
      .upload-col { flex: none; }
      .fields-col { min-width: auto; }
      .form-card-header, .student-form-body { padding: 1rem; }
      .form-section { padding: 1rem; }
      .form-group { min-width: 100%; }
    }
  `]
})
export class StudentsComponent implements OnInit {
  @Input() addOnly: boolean = false;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  classes: Class[] = [];
  families: Family[] = [];
  sectionsByClass: Section[] = [];
  sessions: AcademicSession[] = [];
  selectedClassId: number | null = null;
  searchTerm: string = '';
  showAddForm: boolean = false;
  editingStudent: Student | null = null;
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  studentToDelete: number | null = null;
  showDropConfirm: boolean = false;
  studentToDrop: Student | null = null;
  isDragging: boolean = false;
  selectedFile: File | null = null;
  currentYear = new Date().getFullYear();
  displayBirthday: string = '';
  displayAdmissionDate: string = '';
  pageSizeOptions = [10, 25, 50, 100];
  pageSize = 10;
  currentPage = 1;
  sortColumn: 'roll' | 'name' | 'fatherName' | 'phone' | 'sex' | 'feeType' | 'class' | 'section' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
  }

  get paginatedStudents(): Student[] {
    const sorted = this.getSortedStudents();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  getSortedStudents(): Student[] {
    const list = [...this.filteredStudents];
    return list.sort((a, b) => {
      let vA: string | number | undefined;
      let vB: string | number | undefined;
      switch (this.sortColumn) {
        case 'roll': vA = a.roll ?? ''; vB = b.roll ?? ''; break;
        case 'name': vA = (a.name ?? '').toLowerCase(); vB = (b.name ?? '').toLowerCase(); break;
        case 'fatherName': vA = (a.fatherName ?? '').toLowerCase(); vB = (b.fatherName ?? '').toLowerCase(); break;
        case 'phone': vA = (a.phone ?? a.smsNumber ?? ''); vB = (b.phone ?? b.smsNumber ?? ''); break;
        case 'sex': vA = (a.sex ?? '').toLowerCase(); vB = (b.sex ?? '').toLowerCase(); break;
        case 'feeType': vA = (a.feeType ?? 'Unpaid').toLowerCase(); vB = (b.feeType ?? 'Unpaid').toLowerCase(); break;
        case 'class': vA = (a.class?.name ?? '').toLowerCase(); vB = (b.class?.name ?? '').toLowerCase(); break;
        case 'section': vA = (a.section?.name ?? '').toLowerCase(); vB = (b.section?.name ?? '').toLowerCase(); break;
        default: return 0;
      }
      const cmp = String(vA).localeCompare(String(vB), undefined, { numeric: true });
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  studentForm: Partial<Student> = {
    name: '',
    email: '',
    phone: '',
    classId: undefined,
    sectionId: undefined,
    roll: '',
    password: '',
    sex: 'Male',
    feeType: 'Paid',
    fee: undefined,
    feeDiscount: 0,
    transportCharges: 0,
    admissionDate: new Date().toISOString().slice(0, 10)
  };

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private familyService: FamilyService,
    private sectionService: SectionService,
    private academicSessionService: AcademicSessionService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadClasses();
    if (!this.addOnly) this.loadStudents();
    this.loadFamilies();
    this.loadSessions();
    if (this.addOnly) {
      this.showAddForm = true;
      this.syncDisplayDates();
    }
  }

  loadFamilies() {
    this.familyService.getAllFamilies().subscribe({
      next: (families) => { this.families = families; },
      error: () => { this.families = []; }
    });
  }

  loadSessions() {
    this.academicSessionService.getAll().subscribe({
      next: (sessions) => { this.sessions = sessions; },
      error: () => { this.sessions = []; }
    });
  }

  onFamilySelect() {
    const fid = this.studentForm.familyId;
    if (!fid) return;
    const fam = this.families.find(f => f.familyId === fid);
    if (fam) {
      this.studentForm.fatherName = fam.fatherName;
      this.studentForm.fatherGuardianCnic = fam.fatherCnic;
      this.studentForm.fatherGuardianPhone = fam.fatherPhone;
      this.studentForm.fatherOccupation = fam.fatherOccupation;
      this.studentForm.guardianName = fam.guardianName;
      this.studentForm.motherName = fam.motherName;
      this.studentForm.motherPhone = fam.motherPhone;
      this.studentForm.motherCnic = fam.motherCnic;
      this.studentForm.smsNumber = fam.smsNumber;
    }
  }

  onClassChange() {
    this.studentForm.sectionId = undefined;
    const cid = this.studentForm.classId;
    if (!cid) {
      this.sectionsByClass = [];
      this.studentForm.fee = undefined;
      return;
    }
    const cls = this.classes.find(c => c.classId === cid);
    if (cls?.fee != null) {
      this.studentForm.fee = cls.fee;
    }
    this.sectionService.getSectionsByClass(cid).subscribe({
      next: (sections) => { this.sectionsByClass = sections; },
      error: () => { this.sectionsByClass = []; }
    });
  }

  onDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging = false; }
  onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length && files[0].type.startsWith('image/')) { this.selectedFile = files[0]; }
  }
  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) { this.selectedFile = input.files[0]; }
  }

  onDateInputChange(val: string, field: 'birthday' | 'admission') {
    const formatted = this.formatDateInputValue(val);
    if (field === 'birthday') this.displayBirthday = formatted;
    else this.displayAdmissionDate = formatted;
  }

  formatDateInputValue(val: string): string {
    let s = (val || '').replace(/\D/g, '');
    if (s.length >= 2) s = s.slice(0, 2) + '/' + s.slice(2);
    if (s.length >= 5) s = s.slice(0, 5) + '/' + s.slice(5);
    return s.slice(0, 10);
  }

  parseAndFormatDate(field: 'birthday' | 'admission') {
    const val = field === 'birthday' ? this.displayBirthday : this.displayAdmissionDate;
    const parsed = this.parseDDMMYYYY(val);
    if (parsed) {
      const formatted = this.formatToDDMMYYYY(parsed);
      if (field === 'birthday') {
        this.displayBirthday = formatted;
        this.studentForm.birthday = parsed;
      } else {
        this.displayAdmissionDate = formatted;
        this.studentForm.admissionDate = parsed.toISOString().slice(0, 10);
      }
    }
  }

  formatToDDMMYYYY(val: Date | string | undefined): string {
    if (!val) return '';
    const d = typeof val === 'string' ? (val.includes('/') ? this.parseDDMMYYYY(val) : new Date(val)) : val;
    if (!d || isNaN((d as Date).getTime())) return '';
    const dt = d as Date;
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  }

  parseDDMMYYYY(val: string): Date | undefined {
    if (!val?.trim()) return undefined;
    const parts = val.trim().split('/');
    if (parts.length !== 3) return undefined;
    const d = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1, y = parseInt(parts[2], 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return undefined;
    const date = new Date(y, m, d);
    if (isNaN(date.getTime()) || date.getDate() !== d || date.getMonth() !== m) return undefined;
    return date;
  }

  syncDisplayDates() {
    this.displayBirthday = this.formatToDDMMYYYY(this.studentForm.birthday);
    const adm = this.studentForm.admissionDate;
    this.displayAdmissionDate = adm ? this.formatToDDMMYYYY(adm.includes('/') ? this.parseDDMMYYYY(adm) : new Date(adm)) : this.formatToDDMMYYYY(new Date());
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        this.notificationService.error('Failed to load classes');
        console.error('Error loading classes:', error);
      }
    });
  }

  loadStudents() {
    this.loading = true;
    this.studentService.getActiveStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = students;
        this.loading = false;
        const editId = this.route.snapshot.queryParamMap.get('edit');
        if (editId) {
          const s = students.find(x => String(x.studentId) === editId);
          if (s) this.editStudent(s);
        }
      },
      error: (error) => {
        this.notificationService.error('Failed to load students');
        console.error('Error loading students:', error);
        this.loading = false;
      }
    });
  }

  loadStudentsByClass() {
    if (this.selectedClassId) {
      this.loading = true;
      this.studentService.getActiveStudents().subscribe({
        next: (students) => {
          this.students = students.filter(s => s.classId === this.selectedClassId);
          this.filterStudents();
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Failed to load students');
          console.error('Error loading students by class:', error);
          this.loading = false;
        }
      });
    } else {
      this.loadStudents();
    }
  }

  filterStudents() {
    if (!this.searchTerm.trim()) {
      this.filteredStudents = this.students;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStudents = this.students.filter(student =>
        student.name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.roll?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  sortBy(col: 'roll' | 'name' | 'fatherName' | 'phone' | 'sex' | 'feeType' | 'class' | 'section') {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  pageSizeChange() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, this.currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else if (end === total) start = Math.max(1, total - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getPageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredStudents.length);
  }

  openActionMenuId: number | null = null;
  openActionStudent: Student | null = null;
  actionMenuPos = { top: 0, left: 0 };

  /**
   * Open action menu on mousedown. Menu is rendered in an overlay at component root
   * so it is never clipped by table or scroll containers.
   */
  openActionMenu(student: Student, event: MouseEvent) {
    event.stopPropagation();
    if (this.openActionMenuId === student.studentId) {
      this.closeActionMenu();
      this.cdr.detectChanges();
      return;
    }
    const btn = (event.currentTarget || event.target) as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 152;
    const menuHeight = 130;
    let left = rect.right - menuWidth;
    let top = rect.bottom + 4;
    if (left < 8) left = 8;
    if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 4;
    this.actionMenuPos = { top, left };
    this.openActionMenuId = student.studentId;
    this.openActionStudent = student;
    this.cdr.detectChanges();
  }

  closeActionMenu() {
    this.openActionMenuId = null;
    this.openActionStudent = null;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target?.closest('.action-dropdown-wrapper') || target?.closest('.action-menu-overlay') || target?.closest('.action-menu')) {
      return;
    }
    this.closeActionMenu();
    if (!target?.closest('.class-filter-box')) {
      this.classFilterOpen = false;
    }
  }

  classFilterOpen = false;

  toggleClassFilter(event: MouseEvent) {
    event.stopPropagation();
    this.classFilterOpen = !this.classFilterOpen;
  }

  selectClass(classId: number | null) {
    this.selectedClassId = classId;
    this.classFilterOpen = false;
    this.loadStudentsByClass();
  }

  getSelectedClassName(): string {
    if (!this.selectedClassId) return 'All Classes';
    const cls = this.classes.find(c => c.classId === this.selectedClassId);
    return cls?.name ?? 'All Classes';
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  saveStudent() {
    this.parseAndFormatDate('birthday');
    this.parseAndFormatDate('admission');
    this.submitted = true;
    
    if (!this.studentForm.name || !this.studentForm.classId) {
      this.notificationService.warning('Please fill in Name and Class (required fields)');
      return;
    }

    if (!this.editingStudent) {
      if (!this.studentForm.password) {
        this.notificationService.warning('Password is required for new students');
        return;
      }
      const email = (this.studentForm.email || '').trim();
      if (!email) {
        this.notificationService.warning('Email is required for login');
        return;
      }
      if (!this.isValidEmail(email)) {
        this.notificationService.warning('Please enter a valid email address');
        return;
      }
    }

    this.saving = true;
    const bday = this.studentForm.birthday as Date | string | undefined;
    const birthdayDate = !bday ? undefined : typeof bday === 'string'
      ? ((bday as string).includes('/') ? this.parseDDMMYYYY(bday as string) : new Date(bday))
      : bday;
    const admDate = this.studentForm.admissionDate;
    const admissionDateStr = typeof admDate === 'string'
      ? (admDate.includes('/') ? undefined : admDate)
      : admDate ? (admDate as Date).toISOString().slice(0, 10) : undefined;

    if (this.editingStudent) {
      const updateDto: UpdateStudentDto = {
        name: this.studentForm.name,
        email: this.studentForm.email,
        phone: this.studentForm.smsNumber || this.studentForm.fatherGuardianPhone || this.studentForm.phone,
        address: this.studentForm.address,
        classId: this.studentForm.classId,
        sectionId: this.studentForm.sectionId,
        roll: this.studentForm.roll,
        session: this.studentForm.session || undefined,
        sex: this.studentForm.sex,
        birthday: birthdayDate ? birthdayDate.toISOString().slice(0, 10) : undefined,
        familyId: this.studentForm.familyId,
        schoolRegNum: this.studentForm.schoolRegNum,
        bFormCnic: this.studentForm.bFormCnic,
        religion: this.studentForm.religion,
        bloodGroup: this.studentForm.bloodGroup,
        admission: {
          admissionDate: admissionDateStr,
          fee: this.studentForm.fee,
          feeType: this.studentForm.feeType,
          feeDiscount: this.studentForm.feeDiscount,
          transportCharges: this.studentForm.transportCharges
        }
      };
      if (!this.studentForm.familyId && (this.studentForm.fatherName || this.studentForm.smsNumber || this.studentForm.motherName)) {
        updateDto.family = {
          fatherName: this.studentForm.fatherName,
          fatherPhone: this.studentForm.fatherGuardianPhone,
          fatherCnic: this.studentForm.fatherGuardianCnic,
          fatherOccupation: this.studentForm.fatherOccupation,
          guardianName: this.studentForm.guardianName,
          motherName: this.studentForm.motherName,
          motherPhone: this.studentForm.motherPhone,
          motherCnic: this.studentForm.motherCnic,
          smsNumber: this.studentForm.smsNumber
        };
      }
      if (this.studentForm.previousInstituteName || this.studentForm.passingClass || this.studentForm.passingYear || this.studentForm.instituteAddress) {
        updateDto.previousInstitute = {
          previousInstituteName: this.studentForm.previousInstituteName,
          passingClass: this.studentForm.passingClass,
          passingPercentage: this.studentForm.passingPercentage,
          passingYear: this.studentForm.passingYear,
          instituteAddress: this.studentForm.instituteAddress
        };
      }

      this.studentService.updateStudent(this.editingStudent.studentId, updateDto).subscribe({
        next: () => {
          this.notificationService.success('Student updated successfully');
          if (!this.addOnly) this.loadStudents();
          this.cancelForm();
          this.saving = false;
          this.router.navigate(['/admin/students/active']);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to update student');
          console.error('Error updating student:', error);
          this.saving = false;
        }
      });
      return;
    }

    const createDto: CreateStudentDto = {
      name: this.studentForm.name,
      email: this.studentForm.email!,
      password: this.studentForm.password!,
      birthday: birthdayDate ? birthdayDate.toISOString().slice(0, 10) : undefined,
      sex: this.studentForm.sex,
      phone: this.studentForm.smsNumber || this.studentForm.fatherGuardianPhone || this.studentForm.phone,
      address: this.studentForm.address,
      classId: this.studentForm.classId,
      sectionId: this.studentForm.sectionId,
      roll: this.studentForm.roll,
      session: this.studentForm.session || undefined,
      familyId: this.studentForm.familyId,
      schoolRegNum: this.studentForm.schoolRegNum,
      bFormCnic: this.studentForm.bFormCnic,
      religion: this.studentForm.religion,
      bloodGroup: this.studentForm.bloodGroup,
      status: 'Active',
      admission: {
        admissionDate: admissionDateStr,
        fee: this.studentForm.fee,
        feeType: this.studentForm.feeType,
        feeDiscount: this.studentForm.feeDiscount,
        transportCharges: this.studentForm.transportCharges
      }
    };
    if (!this.studentForm.familyId && (this.studentForm.fatherName || this.studentForm.smsNumber || this.studentForm.motherName)) {
      createDto.family = {
        fatherName: this.studentForm.fatherName,
        fatherPhone: this.studentForm.fatherGuardianPhone,
        fatherCnic: this.studentForm.fatherGuardianCnic,
        fatherOccupation: this.studentForm.fatherOccupation,
        guardianName: this.studentForm.guardianName,
        motherName: this.studentForm.motherName,
        motherPhone: this.studentForm.motherPhone,
        motherCnic: this.studentForm.motherCnic,
        smsNumber: this.studentForm.smsNumber
      };
    }
    if (this.studentForm.previousInstituteName || this.studentForm.passingClass || this.studentForm.passingYear || this.studentForm.instituteAddress) {
      createDto.previousInstitute = {
        previousInstituteName: this.studentForm.previousInstituteName,
        passingClass: this.studentForm.passingClass,
        passingPercentage: this.studentForm.passingPercentage,
        passingYear: this.studentForm.passingYear,
        instituteAddress: this.studentForm.instituteAddress
      };
    }

    const operation = this.studentService.createStudent(createDto);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingStudent ? 'Student updated successfully' : 'Student created successfully'
        );
        if (!this.addOnly) this.loadStudents();
        if (this.addOnly) this.router.navigate(['/admin/students/active']);
        else this.cancelForm();
        this.saving = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to save student';
        this.notificationService.error(errorMsg);
        console.error('Error saving student:', error);
        this.saving = false;
      }
    });
  }

  viewStudent(student: Student) {
    this.router.navigate(['/admin/students/view', student.studentId]);
  }

  editStudent(student: Student) {
    this.editingStudent = student;
    this.studentForm = { ...student };
    this.showAddForm = true;
    this.submitted = false;
    this.syncDisplayDates();
    if (student.classId) {
      this.sectionService.getSectionsByClass(student.classId).subscribe({
        next: (sections) => { this.sectionsByClass = sections; },
        error: () => { this.sectionsByClass = []; }
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDrop(student: Student) {
    this.studentToDrop = student;
    this.showDropConfirm = true;
  }

  dropStudent() {
    if (!this.studentToDrop) return;
    const id = this.studentToDrop.studentId;
    this.studentToDrop = null;
    this.showDropConfirm = false;
    this.studentService.updateStudent(id, { status: 'Dropped' }).subscribe({
      next: () => {
        this.notificationService.success('Student marked as Dropped');
        this.loadStudents();
      },
      error: (err) => this.notificationService.error(err.error?.message || 'Failed to drop student')
    });
  }

  confirmDelete(student: Student) {
    this.studentToDelete = student.studentId;
    this.showDeleteConfirm = true;
  }

  deleteStudent() {
    if (!this.studentToDelete) return;

    this.loading = true;
    this.studentService.deleteStudent(this.studentToDelete).subscribe({
      next: () => {
        this.notificationService.success('Student deleted successfully');
        this.loadStudents();
        this.showDeleteConfirm = false;
        this.studentToDelete = null;
        this.loading = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to delete student';
        this.notificationService.error(errorMsg);
        console.error('Error deleting student:', error);
        this.showDeleteConfirm = false;
        this.studentToDelete = null;
        this.loading = false;
      }
    });
  }

  cancelForm() {
    if (this.addOnly) {
      this.router.navigate(['/admin/students/active']);
      return;
    }
    this.showAddForm = false;
    this.editingStudent = null;
    this.submitted = false;
    this.selectedFile = null;
    this.sectionsByClass = [];
    this.displayBirthday = '';
    this.displayAdmissionDate = this.formatToDDMMYYYY(new Date());
    this.studentForm = {
      name: '',
      email: '',
      phone: '',
      classId: undefined,
      sectionId: undefined,
      roll: '',
      password: '',
      sex: 'Male',
      feeType: 'Paid',
      fee: undefined,
      feeDiscount: 0,
      transportCharges: 0,
      admissionDate: new Date().toISOString().slice(0, 10)
    };
  }
}
