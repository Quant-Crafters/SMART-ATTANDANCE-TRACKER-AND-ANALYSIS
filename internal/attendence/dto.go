package attendence

import "time"

// CreateAttendanceRequest is used to mark attendance.
type CreateAttendanceRequest struct {
	StudentID uint      `json:"student_id" binding:"required"`
	SubjectID uint      `json:"subject_id" binding:"required"`
	FacultyID uint      `json:"faculty_id" binding:"required"`
	Date      time.Time `json:"date" binding:"required"`
	Status    string    `json:"status" binding:"required,oneof=present absent late"`
}

// UpdateAttendanceRequest is used to update attendance.
type UpdateAttendanceRequest struct {
	Status string `json:"status" binding:"required,oneof=present absent late"`
}

// AttendanceResponse represents attendance data returned by the API.
type AttendanceResponse struct {
	ID        uint      `json:"id"`
	StudentID uint      `json:"student_id"`
	SubjectID uint      `json:"subject_id"`
	FacultyID uint      `json:"faculty_id"`
	Date      time.Time `json:"date"`
	Status    string    `json:"status"`
}