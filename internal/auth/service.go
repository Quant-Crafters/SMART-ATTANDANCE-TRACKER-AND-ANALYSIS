package auth

import (
	"errors"
	"strings"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/student"
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

// Register creates a new student user and student profile.
func (s *Service) Register(req RegisterRequest) (*User, error) {

	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	role := strings.ToLower(strings.TrimSpace(req.Role))

	if name == "" {
		return nil, errors.New("name is required")
	}

	if email == "" {
		return nil, errors.New("email is required")
	}

	if req.Password == "" {
		return nil, errors.New("password is required")
	}

	// Public registration is only for students.
	if role != "student" {
		return nil, errors.New("public registration is allowed only for students")
	}

	// Student-specific fields.
	studentID := strings.TrimSpace(req.StudentID)
	phone := strings.TrimSpace(req.Phone)
	department := strings.TrimSpace(req.Department)
	section := strings.TrimSpace(req.Section)

	if studentID == "" {
		return nil, errors.New("student_id is required")
	}

	if department == "" {
		return nil, errors.New("department is required")
	}

	if req.Semester < 1 || req.Semester > 8 {
		return nil, errors.New("semester must be between 1 and 8")
	}

	if section == "" {
		return nil, errors.New("section is required")
	}

	if req.Year < 1 || req.Year > 4 {
		return nil, errors.New("year must be between 1 and 4")
	}

	// Check whether email already exists.
	existingUser, err := s.repo.FindByEmail(email)

	if err == nil && existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Hash password.
	hashedPassword, err := password.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Create authentication user.
	user := &User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
		Role:     "student",
	}

	// Create student academic profile.
	studentProfile := &student.Student{
		StudentID:  studentID,
		Name:       name,
		Email:      email,
		Phone:      phone,
		Department: department,
		Semester:   req.Semester,
		Section:    section,
		Year:       req.Year,
		Status:     true,
	}

	// Create both records in one database transaction.
	if err := s.repo.CreateStudentRegistration(
		user,
		studentProfile,
	); err != nil {
		return nil, err
	}

	// Never return password.
	user.Password = ""

	return user, nil
}