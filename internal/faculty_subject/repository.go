package faculty_subject

import (
	"errors"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

// Repository handles faculty-subject assignment database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new faculty-subject repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// CreateAssignment assigns a subject to a faculty member.
func (r *Repository) CreateAssignment(
	assignment *FacultySubject,
) error {
	return r.db.Create(assignment).Error
}

// GetByID returns an assignment by ID.
func (r *Repository) GetByID(
	id uint,
) (*FacultySubject, error) {

	var assignment FacultySubject

	err := r.db.
		First(&assignment, id).
		Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &assignment, nil
}

// GetByFacultyAndSubject checks whether a faculty member
// is assigned to a particular subject.
func (r *Repository) GetByFacultyAndSubject(
	facultyID uint,
	subjectID uint,
) (*FacultySubject, error) {

	var assignment FacultySubject

	err := r.db.
		Where(
			"faculty_id = ? AND subject_id = ?",
			facultyID,
			subjectID,
		).
		First(&assignment).
		Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &assignment, nil
}

// GetByFacultyID returns all active subject assignments
// for a faculty member.
func (r *Repository) GetByFacultyID(
	facultyID uint,
) ([]FacultySubject, error) {

	var assignments []FacultySubject

	err := r.db.
		Where(
			"faculty_id = ? AND status = ?",
			facultyID,
			true,
		).
		Order("id ASC").
		Find(&assignments).
		Error

	return assignments, err
}

// GetFacultySubjectsWithDetails returns active assigned
// subjects together with complete subject information.
func (r *Repository) GetFacultySubjectsWithDetails(
	facultyID uint,
) ([]FacultySubjectResponse, error) {

	type facultySubjectRow struct {
		ID            uint
		FacultyID     uint
		SubjectID     uint
		Status        bool
		SubjectName   string
		SubjectCode   string
		DepartmentID  uint
		Semester      int
		Credits       int
		SubjectStatus bool
	}

	var rows []facultySubjectRow

	err := r.db.
		Table("faculty_subjects fs").
		Select(`
			fs.id,
			fs.faculty_id,
			fs.subject_id,
			fs.status,
			s.name AS subject_name,
			s.code AS subject_code,
			s.department_id,
			s.semester,
			s.credits,
			s.status AS subject_status
		`).
		Joins(
			"JOIN subjects s ON s.id = fs.subject_id",
		).
		Where(
			"fs.faculty_id = ? AND fs.status = ?",
			facultyID,
			true,
		).
		Order("s.semester ASC, s.name ASC").
		Scan(&rows).
		Error

	if err != nil {
		return nil, err
	}

	assignments := make(
		[]FacultySubjectResponse,
		0,
		len(rows),
	)

	for _, row := range rows {
		assignments = append(
			assignments,
			FacultySubjectResponse{
				ID:        row.ID,
				FacultyID: row.FacultyID,
				SubjectID: row.SubjectID,
				Status:    row.Status,
				Subject: SubjectSummary{
					ID:           row.SubjectID,
					Name:         row.SubjectName,
					Code:         row.SubjectCode,
					DepartmentID: row.DepartmentID,
					Semester:     row.Semester,
					Credits:      row.Credits,
					Status:       row.SubjectStatus,
				},
			},
		)
	}

	return assignments, nil
}

// GetBySubjectID returns all active faculty assignments
// for a subject.
func (r *Repository) GetBySubjectID(
	subjectID uint,
) ([]FacultySubject, error) {

	var assignments []FacultySubject

	err := r.db.
		Where(
			"subject_id = ? AND status = ?",
			subjectID,
			true,
		).
		Order("id ASC").
		Find(&assignments).
		Error

	return assignments, err
}

// Update updates an existing assignment.
func (r *Repository) Update(
	assignment *FacultySubject,
) error {
	return r.db.Save(assignment).Error
}

// Delete removes a faculty-subject assignment.
func (r *Repository) Delete(
	assignment *FacultySubject,
) error {
	return r.db.Delete(assignment).Error
}
