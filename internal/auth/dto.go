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