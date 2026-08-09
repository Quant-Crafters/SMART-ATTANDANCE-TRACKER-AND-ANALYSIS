package analytics

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/attendence"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/student"
)

// Repository handles analytics database queries.
type Repository struct{}

// NewRepository creates a new analytics repository.
func NewRepository() *Repository {
	return &Repository{}
}

// GetTotalAttendance returns total attendance records.
func (r *Repository) GetTotalAttendance() (int64, error) {
	var total int64

	err := config.DB.
		Model(&attendence.Attendance{}).
		Count(&total).Error

	return total, err
}

// GetPresentAttendance returns total present records.
func (r *Repository) GetPresentAttendance() (int64, error) {
	var total int64

	err := config.DB.
		Model(&attendence.Attendance{}).
		Where("status = ?", "present").
		Count(&total).Error

	return total, err
}

// GetAbsentAttendance returns total absent records.
func (r *Repository) GetAbsentAttendance() (int64, error) {
	var total int64

	err := config.DB.
		Model(&attendence.Attendance{}).
		Where("status = ?", "absent").
		Count(&total).Error

	return total, err
}

// GetStudentAttendance returns attendance statistics for a student.
func (r *Repository) GetStudentAttendance(studentID uint) (
	total int64,
	present int64,
	absent int64,
	err error,
) {
	db := config.DB

	if err = db.Model(&attendence.Attendance{}).
		Where("student_id = ?", studentID).
		Count(&total).Error; err != nil {
		return
	}

	if err = db.Model(&attendence.Attendance{}).
		Where(
			"student_id = ? AND status = ?",
			studentID,
			"present",
		).
		Count(&present).Error; err != nil {
		return
	}

	if err = db.Model(&attendence.Attendance{}).
		Where(
			"student_id = ? AND status = ?",
			studentID,
			"absent",
		).
		Count(&absent).Error; err != nil {
		return
	}

	return
}

// GetSubjectAttendance returns attendance statistics for a subject.
func (r *Repository) GetSubjectAttendance(subjectID uint) (
	total int64,
	present int64,
	absent int64,
	err error,
) {
	db := config.DB

	if err = db.Model(&attendence.Attendance{}).
		Where("subject_id = ?", subjectID).
		Count(&total).Error; err != nil {
		return
	}

	if err = db.Model(&attendence.Attendance{}).
		Where(
			"subject_id = ? AND status = ?",
			subjectID,
			"present",
		).
		Count(&present).Error; err != nil {
		return
	}

	if err = db.Model(&attendence.Attendance{}).
		Where(
			"subject_id = ? AND status = ?",
			subjectID,
			"absent",
		).
		Count(&absent).Error; err != nil {
		return
	}

	return
}

// GetTotalStudents returns total students.
func (r *Repository) GetTotalStudents() (int64, error) {
	var total int64

	err := config.DB.
		Model(&student.Student{}).
		Count(&total).Error

	return total, err
}