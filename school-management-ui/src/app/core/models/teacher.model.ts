export interface Teacher {
  teacherId?: number;  // Frontend uses this
  userId?: number;     // Backend returns this
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  departmentId?: number;
  designationId?: number;
  loginStatus?: string;
  department?: Department;
}

export interface Department {
  departmentId?: number;
  name: string;
}

