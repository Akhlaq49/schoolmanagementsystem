import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, ExpenseCategory } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses-container">
      <div class="page-header">
        <h2>Expense Management</h2>
        <div>
          <button class="btn btn-primary" (click)="showCategoryForm = true">
            <i class="fa fa-plus"></i> Add Category
          </button>
          <button class="btn btn-primary" (click)="showExpenseForm = true" style="margin-left: 1rem;">
            <i class="fa fa-plus"></i> Add Expense
          </button>
        </div>
      </div>

      <!-- Category Form -->
      <div *ngIf="showCategoryForm || editingCategory" class="form-card">
        <h3>{{ editingCategory ? 'Edit Category' : 'Add Expense Category' }}</h3>
        <form (ngSubmit)="saveCategory()">
          <div class="form-group">
            <label>Category Name *</label>
            <input type="text" [(ngModel)]="categoryForm.name" name="name" required class="form-control">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelCategoryForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Expense Form -->
      <div *ngIf="showExpenseForm || editingExpense" class="form-card">
        <h3>{{ editingExpense ? 'Edit Expense' : 'Add Expense' }}</h3>
        <form (ngSubmit)="saveExpense()">
          <div class="form-row">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="expenseForm.title" name="title" required class="form-control">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select [(ngModel)]="expenseForm.expenseCategoryId" name="categoryId" required class="form-control">
                <option value="">Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.expenseCategoryId">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount *</label>
              <input type="number" [(ngModel)]="expenseForm.amount" name="amount" required class="form-control" step="0.01">
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select [(ngModel)]="expenseForm.paymentMethod" name="method" class="form-control">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="expenseForm.description" name="description" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelExpenseForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Categories Table -->
      <div class="table-card" style="margin-bottom: 2rem;">
        <h3>Expense Categories</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories">
              <td>{{ category.expenseCategoryId }}</td>
              <td>{{ category.name }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editCategory(category)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteCategory(category.expenseCategoryId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Expenses Table -->
      <div class="table-card">
        <h3>Expenses</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let expense of expenses">
              <td>{{ expense.paymentId }}</td>
              <td>{{ expense.title || '-' }}</td>
              <td>{{ expense.expenseCategoryId || '-' }}</td>
              <td>{{ expense.amount | currency }}</td>
              <td>{{ expense.paymentMethod || '-' }}</td>
              <td>{{ expense.timestamp | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editExpense(expense)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteExpense(expense.paymentId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="expenses.length === 0">
              <td colspan="7" class="text-center">No expenses found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .expenses-container {
      padding: 2rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    .btn-edit {
      background: #3498db;
      color: white;
      margin-right: 0.5rem;
    }
    .btn-delete {
      background: #e74c3c;
      color: white;
    }
    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .table-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table thead {
      background: #667eea;
      color: white;
    }
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .data-table tbody tr:hover {
      background: #f8f9fa;
    }
    .text-center {
      text-align: center;
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses: any[] = [];
  categories: ExpenseCategory[] = [];
  showCategoryForm: boolean = false;
  showExpenseForm: boolean = false;
  editingCategory: ExpenseCategory | null = null;
  editingExpense: any = null;
  
  categoryForm: Partial<ExpenseCategory> = {
    name: ''
  };

  expenseForm: any = {
    title: '',
    expenseCategoryId: undefined,
    amount: 0,
    paymentMethod: 'cash',
    description: '',
    paymentType: 'expense'
  };

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadExpenses();
    this.loadCategories();
  }

  loadExpenses() {
    this.expenseService.getAllExpenses().subscribe(expenses => {
      this.expenses = expenses;
    });
  }

  loadCategories() {
    this.expenseService.getAllExpenseCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  saveCategory() {
    if (this.editingCategory) {
      this.expenseService.updateExpenseCategory(this.editingCategory.expenseCategoryId, this.categoryForm as ExpenseCategory)
        .subscribe(() => {
          this.loadCategories();
          this.cancelCategoryForm();
        });
    } else {
      this.expenseService.createExpenseCategory(this.categoryForm as ExpenseCategory)
        .subscribe(() => {
          this.loadCategories();
          this.cancelCategoryForm();
        });
    }
  }

  saveExpense() {
    if (this.editingExpense) {
      this.expenseService.updateExpense(this.editingExpense.paymentId, this.expenseForm)
        .subscribe(() => {
          this.loadExpenses();
          this.cancelExpenseForm();
        });
    } else {
      this.expenseService.createExpense(this.expenseForm)
        .subscribe(() => {
          this.loadExpenses();
          this.cancelExpenseForm();
        });
    }
  }

  editCategory(category: ExpenseCategory) {
    this.editingCategory = category;
    this.categoryForm = { ...category };
    this.showCategoryForm = true;
  }

  editExpense(expense: any) {
    this.editingExpense = expense;
    this.expenseForm = { ...expense };
    this.showExpenseForm = true;
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.expenseService.deleteExpenseCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  deleteExpense(id: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(() => {
        this.loadExpenses();
      });
    }
  }

  cancelCategoryForm() {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm = { name: '' };
  }

  cancelExpenseForm() {
    this.showExpenseForm = false;
    this.editingExpense = null;
    this.expenseForm = {
      title: '',
      expenseCategoryId: undefined,
      amount: 0,
      paymentMethod: 'cash',
      description: '',
      paymentType: 'expense'
    };
  }
}

