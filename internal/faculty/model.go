package faculty

import "time"

// Faculty represents a faculty member.
type Faculty struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	FacultyID   string    `gorm:"uniqueIndex;not null" json:"faculty_id"`
	Name        string    `gorm:"not null" json:"name"`
	Email       string    `gorm:"uniqueIndex;not null" json:"email"`
	Phone       string    `json:"phone"`
	Department  string    `json:"department"`
	Designation string    `json:"designation"`
	Status      bool      `gorm:"default:true" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}