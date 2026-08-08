package attendence

import (
	"gorm.io/gorm"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
)

// Repository handles attendance database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new attendance repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// Create creates a new attendance record.
func (r *Repository) Create(attendance *Attendance) error {
	return r.db.Create(attendance).Error
}

// GetAll returns all attendance records.
func (r *Repository) GetAll() ([]Attendance, error) {

	var records []Attendance

	err := r.db.
		Order("date DESC").
		Find(&records).Error

	return records, err
}

// GetByID returns an attendance record by ID.
func (r *Repository) GetByID(id uint) (*Attendance, error) {

	var attendance Attendance

	err := r.db.
		First(&attendance, id).
		Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}

		return nil, err
	}

	return &attendance, nil
}

// Update updates an attendance record.
func (r *Repository) Update(attendance *Attendance) error {
	return r.db.Save(attendance).Error
}

// Delete deletes an attendance record.
func (r *Repository) Delete(attendance *Attendance) error {
	return r.db.Delete(attendance).Error
}

// GetByStudentID returns attendance history for a student.
func (r *Repository) GetByStudentID(studentID uint) ([]Attendance, error) {

	var records []Attendance

	err := r.db.
		Where("student_id = ?", studentID).
		Order("date DESC").
		Find(&records).Error

	return records, err
}

// GetAttendanceCounts returns total and present attendance counts.
func (r *Repository) GetAttendanceCounts(studentID uint) (int64, int64, error) {

	var total int64
	var present int64

	err := r.db.
		Model(&Attendance{}).
		Where("student_id = ?", studentID).
		Count(&total).Error

	if err != nil {
		return 0, 0, err
	}

	err = r.db.
		Model(&Attendance{}).
		Where(
			"student_id = ? AND status = ?",
			studentID,
			"present",
		).
		Count(&present).Error

	if err != nil {
		return 0, 0, err
	}

	return total, present, nil
}