package attendence

import "time"

type Attendance struct {
	ID uint `gorm:"primaryKey" json:"id"`

	StudentID uint `json:"student_id"`
	SubjectID uint `json:"subject_id"`
	FacultyID uint `json:"faculty_id"`

	Date time.Time `json:"date"`

	Status string `json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}