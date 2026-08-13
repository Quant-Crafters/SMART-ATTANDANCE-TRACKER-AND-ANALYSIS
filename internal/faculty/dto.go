package faculty

// CreateFacultyRequest represents faculty creation data.
type CreateFacultyRequest struct {
	FacultyID   string `json:"faculty_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone"`
	Department  string `json:"department"`
	Designation string `json:"designation"`
}

// UpdateFacultyRequest represents faculty update data.
type UpdateFacultyRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone"`
	Department  string `json:"department"`
	Designation string `json:"designation"`
}

// FacultyResponse represents faculty data returned by the API.
type FacultyResponse struct {
	ID          uint   `json:"id"`
	FacultyID   string `json:"faculty_id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Department  string `json:"department"`
	Designation string `json:"designation"`
	Status      bool   `json:"status"`
}