import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { ClassService } from '../../../core/services/class.service';
import { ParentInfo, WhatsAppMessageRequest } from '../../../core/models/whatsapp-message.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-whatsapp-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="whatsapp-container">
      <app-loading [show]="loading" [message]="'Loading parents...'"></app-loading>
      
      <div class="page-header">
        <div class="header-content">
          <h2><i class="fa fa-whatsapp"></i> WhatsApp Notifications</h2>
        </div>
      </div>

      <!-- Test Integration Section -->
      <div class="modern-form-card test-section">
        <h3>
          <i class="fa fa-flask"></i>
          Test WhatsApp Integration
        </h3>
        <p class="test-description">Test your WhatsApp integration by sending a message to a specific phone number.</p>
        <form (ngSubmit)="sendTestMessage()">
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-phone"></i>
                Test Phone Number <span class="required-indicator">*</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="testPhoneNumber" 
                name="testPhoneNumber" 
                required 
                class="modern-form-control"
                placeholder="e.g., +923012805749"
                [class.is-invalid]="testSubmitted && !testPhoneNumber">
              <div *ngIf="testSubmitted && !testPhoneNumber" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Phone number is required
              </div>
              <small class="form-help-text">Enter phone number in international format (e.g., +923012805749)</small>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-heading"></i>
                Test Title (Optional)
              </label>
              <input 
                type="text" 
                [(ngModel)]="testTitle" 
                name="testTitle" 
                class="modern-form-control"
                placeholder="Test Message Title">
            </div>
          </div>
          <div class="modern-form-group">
            <label>
              <i class="fa fa-comment"></i>
              Test Message <span class="required-indicator">*</span>
            </label>
            <textarea 
              [(ngModel)]="testMessage" 
              name="testMessage" 
              required 
              class="modern-form-control"
              rows="4"
              placeholder="Enter test message here..."
              [class.is-invalid]="testSubmitted && !testMessage"></textarea>
            <div *ngIf="testSubmitted && !testMessage" class="modern-invalid-feedback">
              <i class="fa fa-exclamation-circle"></i>
              Test message is required
            </div>
          </div>
          <div class="modern-form-actions">
            <button type="submit" class="btn btn-test" [disabled]="testing || !canSendTest()">
              <i class="fa" [class.fa-spinner]="testing" [class.fa-spin]="testing" [class.fa-paper-plane]="!testing"></i>
              <span *ngIf="testing">Sending Test...</span>
              <span *ngIf="!testing">Send Test Message</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="resetTestForm()" [disabled]="testing">
              <i class="fa fa-refresh"></i>
              Clear
            </button>
          </div>
        </form>
        <div class="test-result" *ngIf="testResult">
          <div class="result-header" [class.success]="testResult.success" [class.error]="!testResult.success">
            <i class="fa" [class.fa-check-circle]="testResult.success" [class.fa-times-circle]="!testResult.success"></i>
            <strong>{{ testResult.success ? 'Test Successful' : 'Test Failed' }}</strong>
          </div>
          <p class="result-message">{{ testResult.message }}</p>
          <div *ngIf="testResult.sentCount > 0" class="result-detail success">
            <i class="fa fa-check"></i> Message sent successfully
          </div>
          <div *ngIf="testResult.failedCount > 0" class="result-detail error">
            <i class="fa fa-exclamation-triangle"></i> Failed to send message
            <div *ngIf="testResult.failedNumbers.length > 0" class="failed-detail">
              Failed number: {{ testResult.failedNumbers.join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <div class="divider">
        <span>OR</span>
      </div>

      <div class="modern-form-card">
        <h3>
          <i class="fa fa-paper-plane"></i>
          Send Message to Parents
        </h3>
        <form (ngSubmit)="sendMessage()">
          <div class="modern-form-group">
            <label>
              <i class="fa fa-heading"></i>
              Title (Optional)
            </label>
            <input 
              type="text" 
              [(ngModel)]="messageForm.title" 
              name="title" 
              class="modern-form-control"
              placeholder="e.g., Important Notice, Meeting Reminder">
          </div>

          <div class="modern-form-group">
            <label>
              <i class="fa fa-filter"></i>
              Filter Recipients
            </label>
            <app-dropdown
              [(ngModel)]="selectedClassId"
              [options]="classOptions"
              placeholder="All Parents"
              [searchable]="true"
              (changed)="onClassChange()">
            </app-dropdown>
          </div>

          <div class="modern-form-group">
            <label>
              <i class="fa fa-users"></i>
              Select Recipients <span class="required-indicator">*</span>
            </label>
            <div class="recipients-section">
              <div class="select-all-section">
                <label class="checkbox-label">
                  <input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll()">
                  <span><strong>Select All ({{ filteredParents.length }} parents)</strong></span>
                </label>
              </div>
              <div class="parents-list" *ngIf="filteredParents.length > 0">
                <label *ngFor="let parent of filteredParents" class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [checked]="isSelected(parent.parentId)" 
                    (change)="toggleParent(parent.parentId)">
                  <span>{{ parent.name }}</span>
                  <span class="phone-badge" *ngIf="parent.phone">{{ parent.phone }}</span>
                  <span class="no-phone" *ngIf="!parent.phone">No phone</span>
                </label>
              </div>
              <p *ngIf="filteredParents.length === 0" class="text-muted">
                No parents found. Please check your filters.
              </p>
            </div>
          </div>

          <div class="modern-form-group">
            <label>
              <i class="fa fa-comment"></i>
              Message <span class="required-indicator">*</span>
            </label>
            <textarea 
              [(ngModel)]="messageForm.message" 
              name="message" 
              required 
              class="modern-form-control"
              rows="8"
              placeholder="Enter your message here..."
              [class.is-invalid]="submitted && !messageForm.message"></textarea>
            <div *ngIf="submitted && !messageForm.message" class="modern-invalid-feedback">
              <i class="fa fa-exclamation-circle"></i>
              Message is required
            </div>
            <div class="char-count">
              {{ messageForm.message.length }} characters
            </div>
          </div>

          <div class="selected-count" *ngIf="selectedParentIds.length > 0">
            <i class="fa fa-check-circle"></i>
            {{ selectedParentIds.length }} parent(s) selected
          </div>

          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="sending || !canSend()">
              <i class="fa" [class.fa-spinner]="sending" [class.fa-spin]="sending" [class.fa-paper-plane]="!sending"></i>
              <span *ngIf="sending">Sending...</span>
              <span *ngIf="!sending">Send via WhatsApp</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="resetForm()" [disabled]="sending">
              <i class="fa fa-refresh"></i>
              Reset
            </button>
          </div>
        </form>
      </div>

      <div class="info-card" *ngIf="lastResult">
        <h4>
          <i class="fa" [class.fa-check-circle]="lastResult.success" [class.fa-times-circle]="!lastResult.success"></i>
          {{ lastResult.success ? 'Message Sent' : 'Sending Failed' }}
        </h4>
        <p>{{ lastResult.message }}</p>
        <div *ngIf="lastResult.sentCount > 0" class="success-info">
          <i class="fa fa-check"></i> Successfully sent to {{ lastResult.sentCount }} parent(s)
        </div>
        <div *ngIf="lastResult.failedCount > 0" class="error-info">
          <i class="fa fa-exclamation-triangle"></i> Failed to send to {{ lastResult.failedCount }} parent(s)
          <div *ngIf="lastResult.failedNumbers.length > 0" class="failed-numbers">
            Failed numbers: {{ lastResult.failedNumbers.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .whatsapp-container {
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h2 i {
      color: #25D366;
    }

    .recipients-section {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 1rem;
      background: var(--bg-secondary);
      max-height: 300px;
      overflow-y: auto;
    }

    .select-all-section {
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 0.75rem;
    }

    .parents-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .checkbox-label:hover {
      background: rgba(37, 211, 102, 0.1);
    }

    .checkbox-label input[type="checkbox"] {
      cursor: pointer;
    }

    .phone-badge {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      background: #25D366;
      color: white;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .no-phone {
      margin-left: auto;
      color: var(--text-tertiary);
      font-style: italic;
      font-size: 0.875rem;
    }

    .char-count {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-tertiary);
      text-align: right;
    }

    .selected-count {
      padding: 1rem;
      background: rgba(37, 211, 102, 0.1);
      border-left: 4px solid #25D366;
      border-radius: 4px;
      margin-bottom: 1rem;
      color: #25D366;
      font-weight: 500;
    }

    .info-card {
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--primary);
    }

    .info-card h4 {
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .success-info {
      color: #10b981;
      margin-top: 0.5rem;
    }

    .error-info {
      color: #ef4444;
      margin-top: 0.5rem;
    }

    .failed-numbers {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .text-muted {
      color: var(--text-tertiary);
      font-style: italic;
    }

    .test-section {
      background: linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0.02) 100%);
      border: 2px dashed rgba(37, 211, 102, 0.3);
    }

    .test-description {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-size: 0.9375rem;
    }

    .form-help-text {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    .btn-test {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: white;
    }

    .btn-test:hover:not(:disabled) {
      background: linear-gradient(135deg, #128C7E 0%, #25D366 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 211, 102, 0.3);
    }

    .test-result {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }

    .result-header.success {
      color: #10b981;
    }

    .result-header.error {
      color: #ef4444;
    }

    .result-message {
      margin: 0.5rem 0;
      color: var(--text-secondary);
    }

    .result-detail {
      margin-top: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .result-detail.success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .result-detail.error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .failed-detail {
      margin-top: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 2rem 0;
      color: var(--text-tertiary);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-light);
    }

    .divider span {
      padding: 0 1rem;
      font-weight: 500;
      font-size: 0.875rem;
    }
  `]
})
export class WhatsAppNotificationsComponent implements OnInit {
  parents: ParentInfo[] = [];
  filteredParents: ParentInfo[] = [];
  classes: any[] = [];
  selectedClassId?: number;
  selectedParentIds: number[] = [];
  loading: boolean = false;
  sending: boolean = false;
  submitted: boolean = false;
  lastResult: any = null;

  // Test fields
  testPhoneNumber: string = '';
  testTitle: string = '';
  testMessage: string = '';
  testing: boolean = false;
  testSubmitted: boolean = false;
  testResult: any = null;

  messageForm: WhatsAppMessageRequest = {
    phoneNumbers: [],
    message: '',
    title: ''
  };

  get classOptions(): DropdownOption[] {
    return this.classes.map(c => ({ value: c.classId, label: c.name }));
  }

  constructor(
    private whatsAppService: WhatsAppService,
    private classService: ClassService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadParents();
    this.loadClasses();
  }

  loadParents() {
    this.loading = true;
    this.whatsAppService.getParents().subscribe({
      next: (parents) => {
        this.parents = parents.filter(p => p.phone && p.phone.trim() !== '');
        this.filteredParents = this.parents;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load parents');
        console.error('Error loading parents:', error);
        this.loading = false;
      }
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  onClassChange() {
    if (this.selectedClassId) {
      this.loading = true;
      this.whatsAppService.getParentsByClass(this.selectedClassId).subscribe({
        next: (parents) => {
          this.filteredParents = parents.filter(p => p.phone && p.phone.trim() !== '');
          this.selectedParentIds = [];
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Failed to load parents for selected class');
          console.error('Error loading parents by class:', error);
          this.loading = false;
        }
      });
    } else {
      this.filteredParents = this.parents;
      this.selectedParentIds = [];
    }
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedParentIds = [];
    } else {
      this.selectedParentIds = this.filteredParents.map(p => p.parentId);
    }
  }

  toggleParent(parentId: number) {
    const index = this.selectedParentIds.indexOf(parentId);
    if (index > -1) {
      this.selectedParentIds.splice(index, 1);
    } else {
      this.selectedParentIds.push(parentId);
    }
  }

  isSelected(parentId: number): boolean {
    return this.selectedParentIds.includes(parentId);
  }

  get allSelected(): boolean {
    return this.filteredParents.length > 0 && 
           this.selectedParentIds.length === this.filteredParents.length;
  }

  canSend(): boolean {
    return this.selectedParentIds.length > 0 && 
           this.messageForm.message.trim().length > 0;
  }

  sendMessage() {
    this.submitted = true;
    
    if (!this.canSend()) {
      this.notificationService.warning('Please select at least one parent and enter a message');
      return;
    }

    this.sending = true;
    this.messageForm.phoneNumbers = this.filteredParents
      .filter(p => this.selectedParentIds.includes(p.parentId))
      .map(p => p.phone)
      .filter(phone => phone && phone.trim() !== '');

    this.whatsAppService.sendMessage(this.messageForm).subscribe({
      next: (result) => {
        this.lastResult = result;
        if (result.success) {
          this.notificationService.success(`Message sent to ${result.sentCount} parent(s)`);
          if (result.failedCount > 0) {
            this.notificationService.warning(`${result.failedCount} message(s) failed`);
          }
        } else {
          this.notificationService.error(result.message);
        }
        this.sending = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to send WhatsApp messages');
        console.error('Error sending WhatsApp message:', error);
        this.sending = false;
      }
    });
  }

  resetForm() {
    this.messageForm = {
      phoneNumbers: [],
      message: '',
      title: ''
    };
    this.selectedParentIds = [];
    this.selectedClassId = undefined;
    this.filteredParents = this.parents;
    this.submitted = false;
    this.lastResult = null;
  }

  canSendTest(): boolean {
    return this.testPhoneNumber.trim().length > 0 && 
           this.testMessage.trim().length > 0;
  }

  sendTestMessage() {
    this.testSubmitted = true;
    
    if (!this.canSendTest()) {
      this.notificationService.warning('Please enter a phone number and test message');
      return;
    }

    this.testing = true;
    const testRequest: WhatsAppMessageRequest = {
      phoneNumbers: [this.testPhoneNumber.trim()],
      message: this.testMessage,
      title: this.testTitle || undefined
    };

    this.whatsAppService.sendMessage(testRequest).subscribe({
      next: (result) => {
        this.testResult = result;
        if (result.success) {
          this.notificationService.success('Test message sent successfully!');
        } else {
          this.notificationService.error(result.message || 'Test message failed');
        }
        this.testing = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to send test WhatsApp message');
        console.error('Error sending test WhatsApp message:', error);
        this.testResult = {
          success: false,
          message: error.error?.message || 'Failed to send test message',
          sentCount: 0,
          failedCount: 1,
          failedNumbers: [this.testPhoneNumber]
        };
        this.testing = false;
      }
    });
  }

  resetTestForm() {
    this.testPhoneNumber = '';
    this.testTitle = '';
    this.testMessage = '';
    this.testSubmitted = false;
    this.testResult = null;
  }
}
