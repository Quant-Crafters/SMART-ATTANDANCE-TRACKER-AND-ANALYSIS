package faculty

import (
	"errors"
	"strings"
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

// CreateFaculty creates a new faculty member.
func (s *Service) CreateFaculty(req CreateFacultyRequest) (*Faculty, error) {

	facultyID := strings.TrimSpace(req.FacultyID)
	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if facultyID == "" {
		return nil, errors.New("faculty ID is required")
	}

	if name == "" {
		return nil, errors.New("faculty name is required")
	}

	if email == "" {
		return nil, errors.New("faculty email is required")
	}

	// Check duplicate faculty ID.
	existing, err := s.repository.GetByFacultyID(facultyID)
	if err == nil && existing != nil {
		return nil, errors.New("faculty ID already exists")
	}

	// Check duplicate email.
	existing, err = s.repository.GetByEmail(email)
	if err == nil && existing != nil {
		return nil, errors.New("faculty email already exists")
	}

	faculty := &Faculty{
		FacultyID:   facultyID,
		Name:       name,
		Email:      email,
		Phone:      strings.TrimSpace(req.Phone),
		Department: strings.TrimSpace(req.Department),
		Designation: strings.TrimSpace(req.Designation),
		Status:     true,
	}

	if err := s.repository.Create(faculty); err != nil {
		return nil, err
	}

	return faculty, nil
}

// GetFaculties returns all faculty members.
func (s *Service) GetFaculties() ([]Faculty, error) {
	return s.repository.GetAll()
}

// GetFacultyByID returns a faculty member by ID.
func (s *Service) GetFacultyByID(id uint) (*Faculty, error) {
	return s.repository.GetByID(id)
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
		return nil, errors.New("faculty not found")
	}

	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if name == "" {
		return nil, errors.New("faculty name is required")
	}

	if email == "" {
		return nil, errors.New("faculty email is required")
	}

	// Check duplicate email.
	existing, err := s.repository.GetByEmail(email)
	if err == nil && existing != nil && existing.ID != faculty.ID {
		return nil, errors.New("faculty email already exists")
	}

	faculty.Name = name
	faculty.Email = email
	faculty.Phone = strings.TrimSpace(req.Phone)
	faculty.Department = strings.TrimSpace(req.Department)
	faculty.Designation = strings.TrimSpace(req.Designation)

	if err := s.repository.Update(faculty); err != nil {
		return nil, err
	}

	return faculty, nil
}

// DeleteFaculty deletes a faculty member by ID.
func (s *Service) DeleteFaculty(id uint) error {

	faculty, err := s.repository.GetByID(id)
	if err != nil {
		return err
	}

	if faculty == nil {
		return errors.New("faculty not found")
	}

	return s.repository.Delete(faculty)
}