package analytics

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/ai"
)

// Service handles analytics business logic.
type Service struct {
	repository *Repository
	aiClient   *ai.Client
}

// NewService creates a new analytics service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
		aiClient:   ai.NewClient(),
	}
}

// AttendanceAnalytics represents overall attendance analytics.
type AttendanceAnalytics struct {
	TotalRecords   int64   `json:"total_records"`
	PresentRecords int64   `json:"present_records"`
	AbsentRecords  int64   `json:"absent_records"`
	AttendanceRate float64 `json:"attendance_rate"`
}

// StudentAnalytics represents student attendance analytics.
type StudentAnalytics struct {
	StudentID      uint    `json:"student_id"`
	TotalClasses   int64   `json:"total_classes"`
	PresentClasses int64   `json:"present_classes"`
	AbsentClasses  int64   `json:"absent_classes"`
	AttendanceRate float64 `json:"attendance_rate"`
	LowAttendance  bool    `json:"low_attendance"`
}

// SubjectAnalytics represents subject attendance analytics.
type SubjectAnalytics struct {
	SubjectID      uint    `json:"subject_id"`
	TotalClasses   int64   `json:"total_classes"`
	PresentRecords int64   `json:"present_records"`
	AbsentRecords  int64   `json:"absent_records"`
	AttendanceRate float64 `json:"attendance_rate"`
}

// DashboardAnalytics represents dashboard analytics.
type DashboardAnalytics struct {
	TotalStudents   int64   `json:"total_students"`
	TotalAttendance int64   `json:"total_attendance"`
	PresentToday    int64   `json:"present_today"`
	AbsentToday     int64   `json:"absent_today"`
	AttendanceRate  float64 `json:"attendance_rate"`
}

// GetAttendanceAnalytics returns overall attendance analytics.
func (s *Service) GetAttendanceAnalytics() (*AttendanceAnalytics, error) {
	total, err := s.repository.GetTotalAttendance()
	if err != nil {
		return nil, err
	}

	present, err := s.repository.GetPresentAttendance()
	if err != nil {
		return nil, err
	}

	absent, err := s.repository.GetAbsentAttendance()
	if err != nil {
		return nil, err
	}

	var rate float64

	if total > 0 {
		rate = float64(present) / float64(total) * 100
	}

	return &AttendanceAnalytics{
		TotalRecords:   total,
		PresentRecords: present,
		AbsentRecords:  absent,
		AttendanceRate: rate,
	}, nil
}

// GetStudentAnalytics returns analytics for a student.
func (s *Service) GetStudentAnalytics(
	studentID uint,
) (*StudentAnalytics, error) {

	total, present, absent, err :=
		s.repository.GetStudentAttendance(studentID)

	if err != nil {
		return nil, err
	}

	var rate float64

	if total > 0 {
		rate = float64(present) / float64(total) * 100
	}

	return &StudentAnalytics{
		StudentID:      studentID,
		TotalClasses:   total,
		PresentClasses: present,
		AbsentClasses:  absent,
		AttendanceRate: rate,
		LowAttendance:  rate < 75,
	}, nil
}

// GetSubjectAnalytics returns analytics for a subject.
func (s *Service) GetSubjectAnalytics(
	subjectID uint,
) (*SubjectAnalytics, error) {

	total, present, absent, err :=
		s.repository.GetSubjectAttendance(subjectID)

	if err != nil {
		return nil, err
	}

	var rate float64

	if total > 0 {
		rate = float64(present) / float64(total) * 100
	}

	return &SubjectAnalytics{
		SubjectID:      subjectID,
		TotalClasses:   total,
		PresentRecords: present,
		AbsentRecords:  absent,
		AttendanceRate: rate,
	}, nil
}

// GetDashboardAnalytics returns dashboard statistics.
func (s *Service) GetDashboardAnalytics() (*DashboardAnalytics, error) {
	totalStudents, err := s.repository.GetTotalStudents()
	if err != nil {
		return nil, err
	}

	totalAttendance, err := s.repository.GetTotalAttendance()
	if err != nil {
		return nil, err
	}

	present, err := s.repository.GetPresentAttendance()
	if err != nil {
		return nil, err
	}

	absent, err := s.repository.GetAbsentAttendance()
	if err != nil {
		return nil, err
	}

	var rate float64

	if totalAttendance > 0 {
		rate = float64(present) / float64(totalAttendance) * 100
	}

	return &DashboardAnalytics{
		TotalStudents:   totalStudents,
		TotalAttendance: totalAttendance,
		PresentToday:    present,
		AbsentToday:     absent,
		AttendanceRate:  rate,
	}, nil
}

// AI Service Integrations

func (s *Service) GetStudentAIPrediction(studentID string) (*ai.PredictionResponse, error) {
	return s.aiClient.PredictStudent(studentID)
}

func (s *Service) GetStudentAIPatterns(studentID string) (*ai.PatternResponse, error) {
	return s.aiClient.GetStudentPatterns(studentID)
}

func (s *Service) GetStudentAIAlerts(studentID string) (*ai.AlertsResponse, error) {
	return s.aiClient.GetStudentAlerts(studentID)
}

func (s *Service) GetFacultyAIAnalytics(facultyID string) (*ai.FacultyAnalyticsResponse, error) {
	return s.aiClient.GetFacultyAnalytics(facultyID)
}

func (s *Service) GenerateStudentAIReport(studentID string, formatType string) (*ai.ReportResponse, error) {
	return s.aiClient.GenerateStudentReport(studentID, formatType)
}