package notification

import (
	"errors"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

// Repository handles notification database operations.
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new notification repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// Create creates a new notification.
func (r *Repository) Create(notification *Notification) error {
	return r.db.Create(notification).Error
}

// GetAll returns all notifications.
func (r *Repository) GetAll() ([]Notification, error) {
	var notifications []Notification

	err := r.db.
		Order("created_at DESC").
		Find(&notifications).Error

	return notifications, err
}

// GetByID returns a notification by ID.
func (r *Repository) GetByID(id uint) (*Notification, error) {
	var notification Notification

	err := r.db.First(&notification, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		return nil, err
	}

	return &notification, nil
}

// Update updates a notification.
func (r *Repository) Update(notification *Notification) error {
	return r.db.Save(notification).Error
}

// Delete deletes a notification.
func (r *Repository) Delete(notification *Notification) error {
	return r.db.Delete(notification).Error
}

// GetByUserID returns notifications for a specific user.
func (r *Repository) GetByUserID(userID uint) ([]Notification, error) {
	var notifications []Notification

	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&notifications).Error

	return notifications, err
}