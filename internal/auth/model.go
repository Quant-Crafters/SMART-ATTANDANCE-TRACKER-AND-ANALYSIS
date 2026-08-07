package auth

import "time"

// User represents a user in the system.
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`

	Name      string    `gorm:"type:varchar(100);not null" json:"name"`

	Email     string    `gorm:"type:varchar(100);unique;not null" json:"email"`

	Password  string    `gorm:"type:text;not null" json:"-"`

	Role      string    `gorm:"type:varchar(20);not null" json:"role"`

	CreatedAt time.Time `json:"created_at"`

	UpdatedAt time.Time `json:"updated_at"`
}