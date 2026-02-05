import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseCategory } from '../models/expense.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/api/expenses`;

  constructor(private http: HttpClient) {}

  // Category methods
  getAllExpenseCategories(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.apiUrl}/categories`);
  }

  getExpenseCategoryById(id: number): Observable<ExpenseCategory> {
    return this.http.get<ExpenseCategory>(`${this.apiUrl}/categories/${id}`);
  }

  createExpenseCategory(category: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(`${this.apiUrl}/categories`, category);
  }

  updateExpenseCategory(id: number, category: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.put<ExpenseCategory>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteExpenseCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Expense methods
  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

