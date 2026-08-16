package faculty

import (
	"errors"
	"strings"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/password"
)

// Service handles faculty business logic.
type Service struct {
	repository *Repository
}

// NewService creates a new faculty service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
	}
}

// CreateFaculty creates a faculty profile and a faculty login account.
func (s *Service) CreateFaculty(
	req CreateFacultyRequest,
) (*Faculty, error) {

	facultyID := strings.TrimSpace(req.FacultyID)
	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	plainPassword := strings.TrimSpace(req.Password)

	if facultyID == "" {
		return nil, errors.New("faculty ID is required")
	}

	if name == "" {
		return nil, errors.New("faculty name is required")
	}

	if email == "" {
		return nil, errors.New("faculty email is required")
	}

	if plainPassword == "" {
		return nil, errors.New("faculty password is required")
	}

	if len(plainPassword) < 6 {
		return nil, errors.New(
			"faculty password must be at least 6 characters",
		)
	}

	// --------------------------------------------------
	// Check duplicate faculty ID
	// --------------------------------------------------

	existing, err := s.repository.GetByFacultyID(facultyID)

	if err == nil && existing != nil {
		return nil, errors.New(
			"faculty ID already exists",
		)
	}

	// --------------------------------------------------
	// Check duplicate faculty email
	// --------------------------------------------------

	existing, err = s.repository.GetByEmail(email)

	if err == nil && existing != nil {
		return nil, errors.New(
			"faculty email already exists",
		)
	}

	// --------------------------------------------------
	// Check duplicate authentication email
	// --------------------------------------------------

	userExists, err :=
		s.repository.UserEmailExists(email)

	if err != nil {
		return nil, err
	}

	if userExists {
		return nil, errors.New(
			"a user with this email already exists",
		)
	}

	// --------------------------------------------------
	// Hash password
	// --------------------------------------------------

	hashedPassword, err :=
		password.HashPassword(plainPassword)

	if err != nil {
		return nil, errors.New(
			"failed to hash faculty password",
		)
	}

	// --------------------------------------------------
	// Faculty profile
	// --------------------------------------------------

	faculty := &Faculty{
		FacultyID:   facultyID,
		Name:        name,
		Email:       email,
		Phone:       strings.TrimSpace(req.Phone),
		Department:  strings.TrimSpace(req.Department),
		Designation: strings.TrimSpace(req.Designation),
		Status:      true,
	}

	// --------------------------------------------------
	// Authentication user
	// --------------------------------------------------

	user := &auth.User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
		Role:     "faculty",
	}

	// --------------------------------------------------
	// Create both records in one transaction
	// --------------------------------------------------

	if err :=
		s.repository.CreateFacultyWithUser(
			faculty,
			user,
		); err != nil {
		return nil, err
	}

	return faculty, nil
}

// GetFaculties returns all faculty members.
func (s *Service) GetFaculties() ([]Faculty, error) {
	return s.repository.GetAll()
}

// GetFacultyByID returns a faculty member by ID.
func (s *Service) GetFacultyByID(
	id uint,
) (*Faculty, error) {
	return s.repository.GetByID(id)
}

// GetFacultyByEmail returns a faculty member by email.
func (s *Service) GetFacultyByEmail(
	email string,
) (*Faculty, error) {
	return s.repository.GetByEmail(email)
}

// UpdateFaculty updates an existing faculty member.
func (s *Service) UpdateFaculty(
	id uint,
	req UpdateFacultyRequest,
) (*Faculty, error) {

	faculty, err := s.repository.GetByID(id)

	if err != nil {
		return nil, err
	}

	if faculty == nil {
		return nil, errors.New(
			"faculty not found",
		)
	}

	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if name == "" {
		return nil, errors.New(
			"faculty name is required",
		)
	}

	if email == "" {
		return nil, errors.New(
			"faculty email is required",
		)
	}

	// Check duplicate faculty email.
	existing, err :=
		s.repository.GetByEmail(email)

	if err == nil &&
		existing != nil &&
		existing.ID != faculty.ID {
		return nil, errors.New(
			"faculty email already exists",
		)
	}

	// Check duplicate user email, excluding the current user.
	currentUser, err :=
		s.repository.GetUserByEmail(
			faculty.Email,
		)

	if err != nil {
		return nil, err
	}

	if currentUser != nil {

		otherUser, err :=
			s.repository.GetUserByEmail(
				email,
			)

		if err != nil {
			return nil, err
		}

		if otherUser != nil &&
			otherUser.ID != currentUser.ID {
			return nil, errors.New(
				"a user with this email already exists",
			)
		}
	}

	// Update faculty profile.
	faculty.Name = name
	faculty.Email = email
	faculty.Phone = strings.TrimSpace(req.Phone)
	faculty.Department = strings.TrimSpace(req.Department)
	faculty.Designation = strings.TrimSpace(req.Designation)

	// Update matching authentication user.
	if currentUser != nil {
		currentUser.Name = name
		currentUser.Email = email
	}

	if err :=
		s.repository.UpdateFacultyWithUser(
			faculty,
			currentUser,
		); err != nil {
		return nil, err
	}

	return faculty, nil
}

// DeleteFaculty deletes a faculty member and its login account.
func (s *Service) DeleteFaculty(id uint) error {

	faculty, err :=
		s.repository.GetByID(id)

	if err != nil {
		return err
	}

	if faculty == nil {
		return errors.New(
			"faculty not found",
		)
	}

	return s.repository.DeleteFacultyWithUser(
		faculty,
	)
}
