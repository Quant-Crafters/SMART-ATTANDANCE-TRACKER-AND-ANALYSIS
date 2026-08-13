package subject

import (
	"errors"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

// Repository handles subject database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new subject repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// Create creates a new subject.
func (r *Repository) Create(subject *Subject) error {
	return r.db.Create(subject).Error
}

// GetAll returns all subjects.
func (r *Repository) GetAll() ([]Subject, error) {
	var subjects []Subject

	err := r.db.
		Order("id ASC").
		Find(&subjects).Error

	return subjects, err
}

// GetByID returns a subject by ID.
func (r *Repository) GetByID(id uint) (*Subject, error) {
	var subject Subject

	err := r.db.First(&subject, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		return nil, err
	}

	return &subject, nil
}

// GetByCode returns a subject by its unique code.
func (r *Repository) GetByCode(code string) (*Subject, error) {
	var subject Subject

	err := r.db.
		Where("code = ?", code).
		First(&subject).Error

	if err != nil {
		return nil, err
	}

	return &subject, nil
}

// GetByDepartmentID returns all subjects for a department.
func (r *Repository) GetByDepartmentID(
	departmentID uint,
) ([]Subject, error) {

	var subjects []Subject

	err := r.db.
		Where("department_id = ?", departmentID).
		Order("semester ASC, name ASC").
		Find(&subjects).Error

	return subjects, err
}

// Update updates an existing subject.
func (r *Repository) Update(subject *Subject) error {
	return r.db.Save(subject).Error
}

// Delete deletes a subject.
func (r *Repository) Delete(subject *Subject) error {
	return r.db.Delete(subject).Error
}