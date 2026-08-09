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


// GetSubjectWiseAttendance returns subject-wise attendance for a student.
func (r *Repository) GetSubjectWiseAttendance(
	studentID uint,
) ([]SubjectAttendanceResponse, error) {

	var records []SubjectAttendanceResponse

	err := r.db.
		Table("attendance a").
		Select(`
			a.subject_id AS subject_id,
			s.name AS subject_name,
			s.code AS subject_code,
			COUNT(a.id) AS total_classes,
			COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present,
			COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent,
			COUNT(CASE WHEN a.status = 'late' THEN 1 END) AS late,
			ROUND(
				100.0 * COUNT(CASE WHEN a.status = 'present' THEN 1 END)
				/ NULLIF(COUNT(a.id), 0),
				2
			) AS attendance_percent
		`).
		Joins("JOIN subjects s ON s.id = a.subject_id").
		Where("a.student_id = ?", studentID).
		Group("a.subject_id, s.name, s.code").
		Order("s.code").
		Scan(&records).Error

	return records, err
}