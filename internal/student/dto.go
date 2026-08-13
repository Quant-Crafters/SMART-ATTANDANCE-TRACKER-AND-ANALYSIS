package student

// CreateStudentRequest represents student creation request.
type CreateStudentRequest struct {
	StudentID string `json:"student_id" validate:"required"`
	Name       string `json:"name" validate:"required"`
	Email      string `json:"email" validate:"required,email"`
	Phone      string `json:"phone"`
	Department string `json:"department" validate:"required"`
	Semester   int    `json:"semester" validate:"required,min=1,max=8"`
	Section    string `json:"section" validate:"required"`
	Year       int    `json:"year" validate:"required,min=1,max=4"`
}

// UpdateStudentRequest represents student update request.
type UpdateStudentRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Department string `json:"department"`
	Semester   int    `json:"semester"`
	Section    string `json:"section"`
	Year       int    `json:"year"`
	Status     bool   `json:"status"`
}