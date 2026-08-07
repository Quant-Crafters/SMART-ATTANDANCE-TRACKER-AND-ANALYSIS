package auth

import (
	"errors"

	jwtutil "github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/jwt"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/password"
)

type Service struct {
	repo *Repository
}

// NewService creates a new auth service.
func NewService() *Service {
	return &Service{
		repo: NewRepository(),
	}
}

// Login authenticates a user.
func (s *Service) Login(req LoginRequest) (*LoginResponse, error) {

	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	err = password.CheckPassword(user.Password, req.Password)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	token, err := jwtutil.GenerateToken(
		user.ID,
		user.Email,
		user.Role,
	)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}