package auth

// LoginRequest represents login request payload.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginResponse represents login response payload.
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
// RegisterRequest represents user registration request.
// RegisterRequest represents user registration request.
// RegisterRequest represents user registration request.
type RegisterRequest struct {
	Name       string `json:"name" validate:"required"`
	Email      string `json:"email" validate:"required,email"`
	Password   string `json:"password" validate:"required,min=6"`
	Role       string `json:"role" validate:"required"`

	// Student-specific fields.
	StudentID  string `json:"student_id"`
	Phone      string `json:"phone"`
	Department string `json:"department"`
	Semester   int    `json:"semester"`
	Section    string `json:"section"`
	Year       int    `json:"year"`
}