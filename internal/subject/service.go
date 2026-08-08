package subject

import (
	"errors"
	"strings"
)

// Service handles subject business logic.
type Service struct {
	repository *Repository
}

// NewService creates a new subject service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
	}
}

// CreateSubject creates a new subject.
func (s *Service) CreateSubject(req CreateSubjectRequest) (*Subject, error) {

	name := strings.TrimSpace(req.Name)
	code := strings.ToUpper(strings.TrimSpace(req.Code))

	if name == "" {
		return nil, errors.New("subject name is required")
	}

	if code == "" {
		return nil, errors.New("subject code is required")
	}

	if req.DepartmentID == 0 {
		return nil, errors.New("department ID is required")
	}

	if req.Semester < 1 || req.Semester > 8 {
		return nil, errors.New("semester must be between 1 and 8")
	}

	// Check duplicate subject code.
	existing, err := s.repository.GetByCode(code)
	if err == nil && existing != nil {
		return nil, errors.New("subject code already exists")
	}

	subject := &Subject{
		Name:         name,
		Code:         code,
		DepartmentID: req.DepartmentID,
		Semester:     req.Semester,
		Credits:      req.Credits,
		Status:       true,
	}

	if err := s.repository.Create(subject); err != nil {
		return nil, err
	}

	return subject, nil
}

// GetSubjects returns all subjects.
func (s *Service) GetSubjects() ([]Subject, error) {
	return s.repository.GetAll()
}

// GetSubjectByID returns a subject by ID.
func (s *Service) GetSubjectByID(id uint) (*Subject, error) {
	return s.repository.GetByID(id)
}

// UpdateSubject updates an existing subject.
func (s *Service) UpdateSubject(
	id uint,
	req UpdateSubjectRequest,
) (*Subject, error) {

	subject, err := s.repository.GetByID(id)
	if err != nil {
		return nil, err
	}

	if subject == nil {
		return nil, errors.New("subject not found")
	}

	name := strings.TrimSpace(req.Name)
	code := strings.ToUpper(strings.TrimSpace(req.Code))

	if name == "" {
		return nil, errors.New("subject name is required")
	}

	if code == "" {
		return nil, errors.New("subject code is required")
	}

	if req.DepartmentID == 0 {
		return nil, errors.New("department ID is required")
	}

	if req.Semester < 1 || req.Semester > 8 {
		return nil, errors.New("semester must be between 1 and 8")
	}

	// Check duplicate subject code.
	existing, err := s.repository.GetByCode(code)
	if err == nil && existing != nil && existing.ID != subject.ID {
		return nil, errors.New("subject code already exists")
	}

	subject.Name = name
	subject.Code = code
	subject.DepartmentID = req.DepartmentID
	subject.Semester = req.Semester
	subject.Credits = req.Credits

	if err := s.repository.Update(subject); err != nil {
		return nil, err
	}

	return subject, nil
}

// DeleteSubject deletes a subject by ID.
func (s *Service) DeleteSubject(id uint) error {

	subject, err := s.repository.GetByID(id)
	if err != nil {
		return err
	}

	if subject == nil {
		return errors.New("subject not found")
	}

	return s.repository.Delete(subject)
}