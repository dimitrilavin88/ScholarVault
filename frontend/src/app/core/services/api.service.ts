import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Student {
  id: string;
  districtId: string;
  firstName: string;
  lastName: string;
  dob: string;
  uniqueStudentIdentifier: string;
  district?: { id: string; name: string };
  parents?: { id: string; email: string }[];
  records?: Record[];
}

export interface Record {
  id: string;
  studentId: string;
  teacherId: string;
  gradeLevel: string;
  subject: string;
  fileUrl: string;
  notes: string | null;
  createdAt: string;
  teacher?: { id: string; email: string };
}

export interface Classroom {
  id: string;
  teacherId: string;
  schoolId: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getClassrooms() {
    return this.http.get<Classroom[]>(`${this.base}/classrooms`);
  }

  getClassroom(id: string) {
    return this.http.get<Classroom>(`${this.base}/classrooms/${id}`);
  }

  createClassroom(name: string) {
    return this.http.post<Classroom>(`${this.base}/classrooms`, { name });
  }

  updateClassroom(id: string, name: string) {
    return this.http.patch<Classroom>(`${this.base}/classrooms/${id}`, { name });
  }

  deleteClassroom(id: string) {
    return this.http.delete<void>(`${this.base}/classrooms/${id}`);
  }

  getClassroomStudents(classroomId: string) {
    return this.http.get<Student[]>(`${this.base}/classrooms/${classroomId}/students`);
  }

  addStudentToClassroom(classroomId: string, studentId: string) {
    return this.http.post<unknown>(`${this.base}/classrooms/${classroomId}/students`, { studentId });
  }

  removeStudentFromClassroom(classroomId: string, studentId: string) {
    return this.http.delete<void>(`${this.base}/classrooms/${classroomId}/students/${studentId}`);
  }

  getStudents() {
    return this.http.get<Student[]>(`${this.base}/students`);
  }

  getStudent(id: string) {
    return this.http.get<Student>(`${this.base}/students/${id}`);
  }

  getStudentWork(studentId: string) {
    return this.http.get<Record[]>(`${this.base}/students/${studentId}/work`);
  }

  uploadWork(studentId: string, formData: FormData) {
    return this.http.post<Record>(`${this.base}/students/${studentId}/work`, formData);
  }

  getFileDownloadUrl(studentId: string, recordId: string): string {
    return `${this.base}/students/${studentId}/records/${recordId}/file`;
  }

  getDistricts() {
    return this.http.get<District[]>(`${this.base}/districts`);
  }

  /** Districts in a given state (for transfer "new district" dropdown). */
  getDistrictsByState(state: string) {
    return this.http.get<District[]>(`${this.base}/districts`, {
      params: { state: state.trim() },
    });
  }

  /** Schools in a given district (for transfer "new school" dropdown). */
  getDistrictSchools(districtId: string) {
    return this.http.get<School[]>(`${this.base}/districts/${districtId}/schools`);
  }

  createTransfer(formData: FormData) {
    return this.http.post<Transfer>(`${this.base}/transfers`, formData);
  }

  getPendingTransfers() {
    return this.http.get<Transfer[]>(`${this.base}/transfers`);
  }

  getTransfer(id: string) {
    return this.http.get<Transfer>(`${this.base}/transfers/${id}`);
  }

  approveTransfer(id: string, notes?: string) {
    return this.http.patch<Transfer>(`${this.base}/transfers/${id}/approve`, { notes });
  }

  rejectTransfer(id: string, notes?: string) {
    return this.http.patch<Transfer>(`${this.base}/transfers/${id}/reject`, { notes });
  }
}

export interface District {
  id: string;
  name: string;
  state: string;
}

export interface School {
  id: string;
  districtId: string;
  name: string;
}

export interface Transfer {
  id: string;
  studentId: string;
  oldDistrictId: string;
  newDistrictId: string | null;
  oldSchoolId: string | null;
  newSchoolId: string | null;
  requestedById: string;
  approvedById: string | null;
  status: 'pending' | 'approved' | 'rejected';
  proofFileUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  oldDistrict?: District;
  newDistrict?: District | null;
  oldSchool?: School | null;
  newSchool?: School | null;
  requestedBy?: { id: string; email: string };
  approvedBy?: { id: string; email: string } | null;
}
