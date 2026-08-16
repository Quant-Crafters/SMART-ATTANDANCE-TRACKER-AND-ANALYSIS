package faculty

import (
	"errors"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
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
func (r *Repository) Create(
	faculty *Faculty,
) error {
	return r.db.Create(faculty).Error
}

// CreateFacultyWithUser creates a faculty profile
// and authentication user in one transaction.
func (r *Repository) CreateFacultyWithUser(
	faculty *Faculty,
	user *auth.User,
) error {

	return r.db.Transaction(
		func(tx *gorm.DB) error {

			if err := tx.Create(faculty).Error; err != nil {
				return err
			}

			if err := tx.Create(user).Error; err != nil {
				return err
			}

			return nil
		},
	)
}

// GetAll returns all faculty members.
func (r *Repository) GetAll() ([]Faculty, error) {

	var faculties []Faculty

	err := r.db.
		Order("id ASC").
		Find(&faculties).
		Error

	return faculties, err
}

// GetByID returns a faculty member by ID.
func (r *Repository) GetByID(
	id uint,
) (*Faculty, error) {

	var faculty Faculty

	err := r.db.
		First(&faculty, id).
		Error

	if err != nil {

		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, err
		}

		return nil, err
	}

	return &faculty, nil
}

// GetByFacultyID returns a faculty member by faculty ID.
func (r *Repository) GetByFacultyID(
	facultyID string,
) (*Faculty, error) {

	var faculty Faculty

	err := r.db.
		Where(
			"faculty_id = ?",
			facultyID,
		).
		First(&faculty).
		Error

	if err != nil {
		return nil, err
	}

	return &faculty, nil
}

// GetByEmail returns a faculty member by email.
func (r *Repository) GetByEmail(
	email string,
) (*Faculty, error) {

	var faculty Faculty

	err := r.db.
		Where(
			"email = ?",
			email,
		).
		First(&faculty).
		Error

	if err != nil {
		return nil, err
	}

	return &faculty, nil
}

// GetUserByEmail returns an authentication user by email.
func (r *Repository) GetUserByEmail(
	email string,
) (*auth.User, error) {

	var user auth.User

	err := r.db.
		Where(
			"email = ?",
			email,
		).
		First(&user).
		Error

	if err != nil {

		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, nil
		}

		return nil, err
	}

	return &user, nil
}

// UserEmailExists checks whether an authentication account
// already uses the supplied email.
func (r *Repository) UserEmailExists(
	email string,
) (bool, error) {

	var count int64

	err := r.db.
		Model(&auth.User{}).
		Where(
			"email = ?",
			email,
		).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// Update updates an existing faculty member.
func (r *Repository) Update(
	faculty *Faculty,
) error {
	return r.db.Save(faculty).Error
}

// UpdateFacultyWithUser updates both the faculty profile
// and authentication user in one transaction.
func (r *Repository) UpdateFacultyWithUser(
	faculty *Faculty,
	user *auth.User,
) error {

	return r.db.Transaction(
		func(tx *gorm.DB) error {

			if err := tx.Save(faculty).Error; err != nil {
				return err
			}

			if user != nil {
				if err := tx.Save(user).Error; err != nil {
					return err
				}
			}

			return nil
		},
	)
}

// Delete deletes a faculty member.
func (r *Repository) Delete(
	faculty *Faculty,
) error {
	return r.db.Delete(faculty).Error
}

// DeleteFacultyWithUser deletes both the faculty profile
// and matching authentication account.
func (r *Repository) DeleteFacultyWithUser(
	faculty *Faculty,
) error {

	return r.db.Transaction(
		func(tx *gorm.DB) error {

			if err := tx.
				Where(
					"email = ?",
					faculty.Email,
				).
				Delete(&auth.User{}).
				Error; err != nil {
				return err
			}

			if err := tx.
				Delete(faculty).
				Error; err != nil {
				return err
			}

			return nil
		},
	)
}
