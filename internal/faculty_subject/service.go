package faculty_subject

import "errors"

// Service handles faculty-subject assignment business logic.
type Service struct {
	repository *Repository
}

// NewService creates a new faculty-subject service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
	}
}

// AssignSubject assigns a subject to a faculty member.
func (s *Service) AssignSubject(
	facultyID uint,
	subjectID uint,
) (*FacultySubject, error) {

	if facultyID == 0 {
		return nil, errors.New("faculty ID is required")
	}

	if subjectID == 0 {
		return nil, errors.New("subject ID is required")
	}

	existing, err := s.repository.GetByFacultyAndSubject(
		facultyID,
		subjectID,
	)

	if err != nil {
		return nil, err
	}

	// Prevent duplicate active assignment.
	if existing != nil {

		if existing.Status {
			return nil, errors.New(
				"subject is already assigned to this faculty",
			)
		}

		// Re-activate an inactive assignment.
		existing.Status = true

		if err := s.repository.Update(existing); err != nil {
			return nil, err
		}

		return existing, nil
	}

	// Create a new assignment.
	assignment := &FacultySubject{
		FacultyID: facultyID,
		SubjectID: subjectID,
		Status:    true,
	}

	if err := s.repository.CreateAssignment(assignment); err != nil {
		return nil, err
	}

	return assignment, nil
}

// GetFacultySubjects returns active assignment records.
func (s *Service) GetFacultySubjects(
	facultyID uint,
) ([]FacultySubject, error) {

	if facultyID == 0 {
		return nil, errors.New("faculty ID is required")
	}

	return s.repository.GetByFacultyID(facultyID)
}

// GetFacultySubjectsWithDetails returns active assigned
// subjects together with complete subject information.
func (s *Service) GetFacultySubjectsWithDetails(
	facultyID uint,
) ([]FacultySubjectResponse, error) {

	if facultyID == 0 {
		return nil, errors.New("faculty ID is required")
	}

	return s.repository.GetFacultySubjectsWithDetails(
		facultyID,
	)
}

// IsSubjectAssignedToFaculty checks whether a subject is
// currently assigned to a faculty member.
func (s *Service) IsSubjectAssignedToFaculty(
	facultyID uint,
	subjectID uint,
) (bool, error) {

	if facultyID == 0 {
		return false, errors.New("faculty ID is required")
	}

	if subjectID == 0 {
		return false, errors.New("subject ID is required")
	}

	assignment, err := s.repository.GetByFacultyAndSubject(
		facultyID,
		subjectID,
	)

	if err != nil {
		return false, err
	}

	return assignment != nil && assignment.Status, nil
}

// RemoveSubjectAssignment deactivates a faculty-subject assignment.
func (s *Service) RemoveSubjectAssignment(
	facultyID uint,
	subjectID uint,
) error {

	if facultyID == 0 {
		return errors.New("faculty ID is required")
	}

	if subjectID == 0 {
		return errors.New("subject ID is required")
	}

	assignment, err := s.repository.GetByFacultyAndSubject(
		facultyID,
		subjectID,
	)

	if err != nil {
		return err
	}

	if assignment == nil {
		return errors.New(
			"subject is not assigned to this faculty",
		)
	}

	assignment.Status = false

	return s.repository.Update(assignment)
}
