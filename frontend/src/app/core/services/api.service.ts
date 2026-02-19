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
  school?: { id: string; name: string; districtId: string };
  teacher?: { id: string; email: string };
}

export interface DistrictHomeroom {
  teacher: { id: string; email: string; firstName?: string | null; lastName?: string | null };
  classroom: { id: string; name: string };
}

export interface ClassTransferRequest {
  id: string;
  studentId: string;
  fromClassroomId: string;
  toClassroomId: string;
  requestedByTeacherId: string;
  status: 'pending' | 'accepted' | 'rejected';
  resolvedAt: string | null;
  resolvedByTeacherId: string | null;
  createdAt: string;
  student?: Student;
  fromClassroom?: Classroom & { teacher?: { id: string; email: string; firstName?: string | null; lastName?: string | null } };
  toClassroom?: Classroom & { teacher?: { id: string; email: string; firstName?: string | null; lastName?: string | null } };
  requestedBy?: { id: string; email: string; firstName?: string | null; lastName?: string | null };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getClassrooms() {
    return this.http.get<Classroom[]>(`${this.base}/classrooms`);
  }

  /** All classrooms in the teacher's school (for class transfer dropdown). */
  getClassroomsInMySchool() {
    return this.http.get<Classroom[]>(`${this.base}/classrooms/school-classrooms`);
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

  updateStudent(id: string, dto: { firstName?: string; lastName?: string; dob?: string; uniqueStudentIdentifier?: string }) {
    return this.http.patch<Student>(`${this.base}/students/${id}`, dto);
  }

  getStudentClassrooms(studentId: string) {
    return this.http.get<Classroom[]>(`${this.base}/students/${studentId}/classrooms`);
  }

  /** District admin: schools in my district */
  getMyDistrictSchools() {
    return this.http.get<School[]>(`${this.base}/district/schools`);
  }

  /** District admin: students in the district with no class assignment (pending enrollment). */
  getUnenrolledStudents() {
    return this.http.get<Student[]>(`${this.base}/district/unenrolled-students`);
  }

  /** District admin: grade levels in a school */
  getDistrictGradeLevels(schoolId: string) {
    return this.http.get<string[]>(`${this.base}/district/schools/${schoolId}/grade-levels`);
  }

  /** District admin: homerooms (teacher + classroom) at a grade in a school */
  getDistrictHomerooms(schoolId: string, gradeLevel: string) {
    return this.http.get<DistrictHomeroom[]>(`${this.base}/district/schools/${schoolId}/grade-levels/${encodeURIComponent(gradeLevel)}/homerooms`);
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

  getTransfersForRelease() {
    return this.http.get<Transfer[]>(`${this.base}/transfers/release`);
  }

  getTransfersForAccept() {
    return this.http.get<Transfer[]>(`${this.base}/transfers/accept`);
  }

  getTransfer(id: string) {
    return this.http.get<Transfer>(`${this.base}/transfers/${id}`);
  }

  releaseTransfer(id: string, notes?: string) {
    return this.http.patch<Transfer>(`${this.base}/transfers/${id}/release`, { notes });
  }

  acceptTransfer(id: string, notes?: string) {
    return this.http.patch<Transfer>(`${this.base}/transfers/${id}/accept`, { notes });
  }

  rejectTransfer(id: string, notes?: string) {
    return this.http.patch<Transfer>(`${this.base}/transfers/${id}/reject`, { notes });
  }

  /** Class transfer (within same school): create request. */
  createClassTransfer(dto: { studentId: string; fromClassroomId: string; toClassroomId: string }) {
    return this.http.post<ClassTransferRequest>(`${this.base}/class-transfers`, dto);
  }

  /** Class transfer: requests awaiting my acceptance. */
  getClassTransferIncoming() {
    return this.http.get<ClassTransferRequest[]>(`${this.base}/class-transfers/incoming`);
  }

  acceptClassTransfer(id: string) {
    return this.http.patch<ClassTransferRequest>(`${this.base}/class-transfers/${id}/accept`, {});
  }

  rejectClassTransfer(id: string) {
    return this.http.patch<ClassTransferRequest>(`${this.base}/class-transfers/${id}/reject`, {});
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
  releasedById: string | null;
  status: 'pending_release' | 'released' | 'approved' | 'rejected';
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
  releasedBy?: { id: string; email: string } | null;
}
