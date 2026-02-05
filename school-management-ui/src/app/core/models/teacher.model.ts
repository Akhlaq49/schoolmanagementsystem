export interface Teacher {
  teacherId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  password: string;
  departmentId?: number;
  designationId?: number;
  loginStatus: string;
  department?: Department;
}

export interface Department {
  departmentId: number;
  name: string;
}

