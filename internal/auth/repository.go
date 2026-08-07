package auth

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new auth repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// FindByEmail finds a user by email.
func (r *Repository) FindByEmail(email string) (*User, error) {

	var user User

	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Create inserts a new user.
func (r *Repository) Create(user *User) error {
	return r.db.Create(user).Error
}