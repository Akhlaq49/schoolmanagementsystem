export interface Student {
  studentId?: number;  // Frontend uses this
  userId?: number;     // Backend returns this
  name: string;
  birthday?: Date;
  age?: number;
  sex?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  classId?: number;
  sectionId?: number;
  parentId?: number;
  roll?: string;
  session?: string;
  loginStatus?: string;
  class?: Class;
  section?: Section;
  parent?: Parent;
}

export interface Class {
  classId?: number;
  name: string;
  nameNumeric?: string;
  teacherId?: number;
}

export interface Section {
  sectionId?: number;
  name: string;
  classId?: number;
  teacherId?: number;
}

export interface Parent {
  parentId?: number;   // Frontend uses this
  userId?: number;     // Backend returns this
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  profession?: string;
}

