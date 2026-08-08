package faculty

import (
	"errors"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

// Repository handles faculty database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new faculty repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// Create creates a new faculty member.
func (r *Repository) Create(faculty *Faculty) error {
	return r.db.Create(faculty).Error
}

// GetAll returns all faculty members.
func (r *Repository) GetAll() ([]Faculty, error) {
	var faculties []Faculty

	err := r.db.
		Order("id ASC").
		Find(&faculties).Error

	return faculties, err
}

// GetByID returns a faculty member by ID.
func (r *Repository) GetByID(id uint) (*Faculty, error) {
	var faculty Faculty

	err := r.db.First(&faculty, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		return nil, err
	}

	return &faculty, nil
}

// GetByFacultyID returns a faculty member by faculty ID.
func (r *Repository) GetByFacultyID(facultyID string) (*Faculty, error) {
	var faculty Faculty

	err := r.db.
		Where("faculty_id = ?", facultyID).
		First(&faculty).Error

	if err != nil {
		return nil, err
	}

	return &faculty, nil
}

// GetByEmail returns a faculty member by email.
func (r *Repository) GetByEmail(email string) (*Faculty, error) {
	var faculty Faculty

	err := r.db.
		Where("email = ?", email).
		First(&faculty).Error

	if err != nil {
		return nil, err
	}

	return &faculty, nil
}

// Update updates an existing faculty member.
func (r *Repository) Update(faculty *Faculty) error {
	return r.db.Save(faculty).Error
}

// Delete deletes a faculty member.
func (r *Repository) Delete(faculty *Faculty) error {
	return r.db.Delete(faculty).Error
}