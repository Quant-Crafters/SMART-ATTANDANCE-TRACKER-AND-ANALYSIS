package department

import (
	"errors"
	"strings"
)

// Service handles department business logic.
type Service struct {
	repository *Repository
}

// NewService creates a new department service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
	}
}

// CreateDepartment creates a new department.
func (s *Service) CreateDepartment(req CreateDepartmentRequest) (*Department, error) {

	name := strings.TrimSpace(req.Name)
	code := strings.ToUpper(strings.TrimSpace(req.Code))

	if name == "" {
		return nil, errors.New("department name is required")
	}

	if code == "" {
		return nil, errors.New("department code is required")
	}

	// Check duplicate department code.
	existing, err := s.repository.GetByCode(code)
	if err == nil && existing != nil {
		return nil, errors.New("department code already exists")
	}

	department := &Department{
		Name:        name,
		Code:        code,
		Description: strings.TrimSpace(req.Description),
		Status:      true,
	}

	if err := s.repository.Create(department); err != nil {
		return nil, err
	}

	return department, nil
}

// GetDepartments returns all departments.
func (s *Service) GetDepartments() ([]Department, error) {
	return s.repository.GetAll()
}

// GetDepartmentByID returns a department by ID.
func (s *Service) GetDepartmentByID(id uint) (*Department, error) {
	return s.repository.GetByID(id)
}

// UpdateDepartment updates an existing department.
func (s *Service) UpdateDepartment(
	id uint,
	req UpdateDepartmentRequest,
) (*Department, error) {

	department, err := s.repository.GetByID(id)
	if err != nil {
		return nil, err
	}

	if department == nil {
		return nil, errors.New("department not found")
	}

	name := strings.TrimSpace(req.Name)
	code := strings.ToUpper(strings.TrimSpace(req.Code))

	if name == "" {
		return nil, errors.New("department name is required")
	}

	if code == "" {
		return nil, errors.New("department code is required")
	}

	// Check whether another department already uses this code.
	existing, err := s.repository.GetByCode(code)
	if err == nil && existing != nil && existing.ID != department.ID {
		return nil, errors.New("department code already exists")
	}

	department.Name = name
	department.Code = code
	department.Description = strings.TrimSpace(req.Description)

	if err := s.repository.Update(department); err != nil {
		return nil, err
	}

	return department, nil
}

// DeleteDepartment deletes a department by ID.
func (s *Service) DeleteDepartment(id uint) error {

	department, err := s.repository.GetByID(id)
	if err != nil {
		return err
	}

	if department == nil {
		return errors.New("department not found")
	}

	return s.repository.Delete(department)
}