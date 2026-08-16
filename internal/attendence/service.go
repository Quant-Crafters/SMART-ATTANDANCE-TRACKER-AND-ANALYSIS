package attendence

import (
	"errors"
	"fmt"
	"time"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/faculty_subject"
)

// ErrUnauthorizedSubject is returned when a faculty member
// tries to mark attendance for a subject they are not assigned to.
var ErrUnauthorizedSubject = errors.New(
	"faculty is not assigned to this subject",
)

// Service handles attendance business logic.
type Service struct {
	repository *Repository
}

// NewService creates a new attendance service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
	}
}

// MarkAttendance creates a new attendance record.
//
// Admin:
// - Uses the faculty_id supplied in the request.
//
// Faculty:
// - Uses the authenticated faculty_id from middleware.
// - Ignores the faculty_id supplied by the frontend.
// - Verifies that the faculty is assigned to the selected subject.
func (s *Service) MarkAttendance(
	req CreateAttendanceRequest,
	role string,
	authenticatedFacultyID uint,
) (*Attendance, error) {

	role = normalizeRole(role)

	// --------------------------------------------------
	// Basic validation
	// --------------------------------------------------

	if req.StudentID == 0 {
		return nil, errors.New("student ID is required")
	}

	if req.SubjectID == 0 {
		return nil, errors.New("subject ID is required")
	}

	if req.Date.IsZero() {
		req.Date = time.Now()
	}

	// --------------------------------------------------
	// ADMIN
	// --------------------------------------------------

	if role == "admin" {

		if req.FacultyID == 0 {
			return nil, errors.New("faculty ID is required")
		}

		attendance := &Attendance{
			StudentID: req.StudentID,
			SubjectID: req.SubjectID,
			FacultyID: req.FacultyID,
			Date:      req.Date,
			Status:    req.Status,
		}

		if err := s.repository.Create(attendance); err != nil {
			return nil, err
		}

		return attendance, nil
	}

	// --------------------------------------------------
	// FACULTY
	// --------------------------------------------------

	if role == "faculty" {

		if authenticatedFacultyID == 0 {
			return nil, errors.New(
				"authenticated faculty ID not found",
			)
		}

		// Never trust req.FacultyID from the frontend.
		// Use the faculty ID resolved from the JWT.
		authorizedFacultyID := authenticatedFacultyID

		facultySubjectService := faculty_subject.NewService()

		assigned, err := facultySubjectService.
			IsSubjectAssignedToFaculty(
				authorizedFacultyID,
				req.SubjectID,
			)

		if err != nil {
			return nil, err
		}

		if !assigned {
			return nil, ErrUnauthorizedSubject
		}

		attendance := &Attendance{
			StudentID: req.StudentID,
			SubjectID: req.SubjectID,
			FacultyID: authorizedFacultyID,
			Date:      req.Date,
			Status:    req.Status,
		}

		if err := s.repository.Create(attendance); err != nil {
			return nil, err
		}

		return attendance, nil
	}

	return nil, fmt.Errorf(
		"unsupported attendance role: %s",
		role,
	)
}

// GetAttendance returns all attendance records.
func (s *Service) GetAttendance() ([]Attendance, error) {
	return s.repository.GetAll()
}

// UpdateAttendance updates an attendance record.
func (s *Service) UpdateAttendance(
	id uint,
	req UpdateAttendanceRequest,
) (*Attendance, error) {

	attendance, err := s.repository.GetByID(id)
	if err != nil {
		return nil, err
	}

	if attendance == nil {
		return nil, fmt.Errorf(
			"attendance record not found",
		)
	}

	attendance.Status = req.Status

	if err := s.repository.Update(attendance); err != nil {
		return nil, err
	}

	return attendance, nil
}

// DeleteAttendance deletes an attendance record.
func (s *Service) DeleteAttendance(id uint) error {

	attendance, err := s.repository.GetByID(id)
	if err != nil {
		return err
	}

	if attendance == nil {
		return fmt.Errorf(
			"attendance record not found",
		)
	}

	return s.repository.Delete(attendance)
}

// GetAttendanceHistory returns attendance history for a student.
func (s *Service) GetAttendanceHistory(
	studentID uint,
) ([]Attendance, error) {
	return s.repository.GetByStudentID(studentID)
}

// GetAttendancePercentage calculates attendance percentage.
// GetAttendancePercentage calculates attendance percentage.
func (s *Service) GetAttendancePercentage(
	studentID uint,
) (float64, error) {

	total, present, err :=
		s.repository.GetAttendanceCounts(studentID)

	if err != nil {
		return 0, err
	}

	if total == 0 {
		return 0, nil
	}

	percentage := (float64(present) / float64(total)) * 100

	return percentage, nil
}

// normalizeRole normalizes the authenticated role.
func normalizeRole(role string) string {

	switch role {
	case "ADMIN", "admin":
		return "admin"

	case "FACULTY", "faculty":
		return "faculty"

	default:
		return role
	}
}
