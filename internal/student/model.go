package student

import "time"

// Student represents a student in the system.
type Student struct {
	ID uint `gorm:"primaryKey" json:"id"`

	StudentID string `gorm:"type:varchar(20);unique;not null" json:"student_id"`

	Name string `gorm:"type:varchar(100);not null" json:"name"`

	Email string `gorm:"type:varchar(100);unique;not null" json:"email"`

	Phone string `gorm:"type:varchar(15)" json:"phone"`

	Department string `gorm:"type:varchar(100);not null" json:"department"`

	Semester int `gorm:"not null" json:"semester"`

	Section string `gorm:"type:varchar(10)" json:"section"`

	Year int `gorm:"not null" json:"year"`

	Status bool `gorm:"default:true" json:"status"`

	CreatedAt time.Time `json:"created_at"`

	UpdatedAt time.Time `json:"updated_at"`
}