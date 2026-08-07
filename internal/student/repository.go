package student

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new student repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// Create inserts a new student.
func (r *Repository) Create(student *Student) error {
	return r.db.Create(student).Error
}

// GetAll returns all students.
func (r *Repository) GetAll() ([]Student, error) {

	var students []Student

	err := r.db.Find(&students).Error
	if err != nil {
		return nil, err
	}

	return students, nil
}


// GetByID returns a student by ID.
func (r *Repository) GetByID(id uint) (*Student, error) {

	var student Student

	err := r.db.First(&student, id).Error
	if err != nil {
		return nil, err
	}

	return &student, nil
}

// Update updates a student.
func (r *Repository) Update(student *Student) error {

	return r.db.Save(student).Error
}

// Delete removes a student.
func (r *Repository) Delete(student *Student) error {

	return r.db.Delete(student).Error
}