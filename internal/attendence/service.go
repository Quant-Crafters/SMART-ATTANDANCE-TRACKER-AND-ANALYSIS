package attendence

import (
	"fmt"
	"time"
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
func (s *Service) MarkAttendance(
	req CreateAttendanceRequest,
) (*Attendance, error) {

	attendance := &Attendance{
		StudentID: req.StudentID,
		SubjectID: req.SubjectID,
		FacultyID: req.FacultyID,
		Date:      req.Date,
		Status:    req.Status,
	}

	if attendance.Date.IsZero() {
		attendance.Date = time.Now()
	}

	if err := s.repository.Create(attendance); err != nil {
		return nil, err
	}

	return attendance, nil
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
		return nil, fmt.Errorf("attendance record not found")
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
		return fmt.Errorf("attendance record not found")
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
func (s *Service) GetAttendancePercentage(
	studentID uint,
) (float64, error) {

	total, present, err := s.repository.GetAttendanceCounts(studentID)
	if err != nil {
		return 0, err
	}

	if total == 0 {
		return 0, nil
	}

	return (float64(present) / float64(total)) * 100, nil
}