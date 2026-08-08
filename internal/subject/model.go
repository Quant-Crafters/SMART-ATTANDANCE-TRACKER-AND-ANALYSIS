package subject

import "time"

// Subject represents an academic subject.
type Subject struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Code         string    `gorm:"uniqueIndex;not null" json:"code"`
	DepartmentID uint      `gorm:"not null;index" json:"department_id"`
	Semester     int       `gorm:"not null" json:"semester"`
	Credits      int       `json:"credits"`
	Status       bool      `gorm:"default:true" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}