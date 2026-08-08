package department

import (
	"errors"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

// Repository handles department database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new department repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// Create creates a new department.
func (r *Repository) Create(department *Department) error {
	return r.db.Create(department).Error
}

// GetAll returns all departments.
func (r *Repository) GetAll() ([]Department, error) {
	var departments []Department

	err := r.db.
		Order("id ASC").
		Find(&departments).Error

	return departments, err
}

// GetByID returns a department by ID.
func (r *Repository) GetByID(id uint) (*Department, error) {
	var department Department

	err := r.db.First(&department, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		return nil, err
	}

	return &department, nil
}

// Update updates an existing department.
func (r *Repository) Update(department *Department) error {
	return r.db.Save(department).Error
}

// Delete deletes a department.
func (r *Repository) Delete(department *Department) error {
	return r.db.Delete(department).Error
}

// GetByCode returns a department by its unique code.
func (r *Repository) GetByCode(code string) (*Department, error) {
	var department Department

	err := r.db.
		Where("code = ?", code).
		First(&department).Error

	if err != nil {
		return nil, err
	}

	return &department, nil
}