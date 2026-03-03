export interface CreateStudentDto {
  name: string;
  email: string;
  password: string;
  birthday?: string;
  sex?: string;
  phone?: string;
  address?: string;
  classId?: number;
  sectionId?: number;
  roll?: string;
  session?: string;
  familyId?: number;
  schoolRegNum?: string;
  bFormCnic?: string;
  religion?: string;
  bloodGroup?: string;
  status?: string;
  family?: FamilyDto;
  admission?: AdmissionDto;
  previousInstitute?: PreviousInstituteDto;
}

export interface FamilyDto {
  fatherName?: string;
  fatherPhone?: string;
  fatherCnic?: string;
  fatherOccupation?: string;
  guardianName?: string;
  motherName?: string;
  motherPhone?: string;
  motherCnic?: string;
  smsNumber?: string;
}

export interface AdmissionDto {
  admissionDate?: string;
  fee?: number;
  feeType?: string;
  feeDiscount?: number;
  transportCharges?: number;
}

export interface PreviousInstituteDto {
  previousInstituteName?: string;
  passingClass?: string;
  passingPercentage?: number;
  passingYear?: number;
  instituteAddress?: string;
}

export interface UpdateStudentDto {
  name?: string;
  email?: string;
  birthday?: string;
  sex?: string;
  phone?: string;
  address?: string;
  classId?: number;
  sectionId?: number;
  roll?: string;
  session?: string;
  familyId?: number;
  schoolRegNum?: string;
  bFormCnic?: string;
  religion?: string;
  bloodGroup?: string;
  status?: string;
  family?: FamilyDto;
  admission?: AdmissionDto;
  previousInstitute?: PreviousInstituteDto;
}
