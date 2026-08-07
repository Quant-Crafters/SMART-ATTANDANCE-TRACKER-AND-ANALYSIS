package jwt

import "github.com/golang-jwt/jwt/v5"

// Claims represents the JWT payload.
type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`

	jwt.RegisteredClaims
}