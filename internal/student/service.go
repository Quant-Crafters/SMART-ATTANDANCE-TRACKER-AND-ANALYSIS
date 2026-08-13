package student

type Service struct {
	repo *Repository
}

// NewService creates a new student service.
func NewService() *Service {
	return &Service{
		repo: NewRepository(),
	}
}

// CreateStudent creates a new student.
func (s *Service) CreateStudent(req CreateStudentRequest) error {

	student := Student{
		StudentID: req.StudentID,
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		Department: req.Department,
		Semester:   req.Semester,
		Section:    req.Section,
		Year:       req.Year,
		Status:     true,
	}

	return s.repo.Create(&student)
}

// GetAllStudents returns all students.
func (s *Service) GetAllStudents() ([]Student, error) {

	return s.repo.GetAll()
}

// GetStudentByID returns a student by ID.
func (s *Service) GetStudentByID(id uint) (*Student, error) {

	return s.repo.GetByID(id)
}

// UpdateStudent updates an existing student.
func (s *Service) UpdateStudent(id uint, req UpdateStudentRequest) error {

	student, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	student.Name = req.Name
	student.Email = req.Email
	student.Phone = req.Phone
	student.Department = req.Department
	student.Semester = req.Semester
	student.Section = req.Section
	student.Year = req.Year
	student.Status = req.Status

	return s.repo.Update(student)
}

// DeleteStudent deletes a student by ID.
func (s *Service) DeleteStudent(id uint) error {

	student, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	return s.repo.Delete(student)
}