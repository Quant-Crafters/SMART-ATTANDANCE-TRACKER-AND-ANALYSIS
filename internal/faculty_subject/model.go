package faculty_subject

import "time"

// FacultySubject represents the assignment of a subject to a faculty member.
type FacultySubject struct {
	ID uint `gorm:"primaryKey" json:"id"`

	FacultyID uint `gorm:"not null;index;uniqueIndex:idx_faculty_subject" json:"faculty_id"`

	SubjectID uint `gorm:"not null;index;uniqueIndex:idx_faculty_subject" json:"subject_id"`

	Status bool `gorm:"default:true" json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
