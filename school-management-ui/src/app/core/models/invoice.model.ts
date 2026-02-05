import { Student } from './student.model';

export interface Invoice {
  invoiceId: number;
  studentId: number;
  title: string;
  description?: string;
  amount: number;
  amountPaid: number;
  due: number;
  status: string;
  creationTimestamp: Date;
  student?: Student;
}

export interface Payment {
  paymentId?: number;
  invoiceId?: number;
  amount: number;
  timestamp: Date;
  paymentMethod?: string;
  transactionId?: string;
}

