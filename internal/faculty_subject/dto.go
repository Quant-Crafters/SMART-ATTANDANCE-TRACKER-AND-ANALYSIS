package faculty_subject

// AssignSubjectRequest represents a request to assign
// a subject to a faculty member.
type AssignSubjectRequest struct {
	FacultyID uint `json:"faculty_id" binding:"required"`
	SubjectID uint `json:"subject_id" binding:"required"`
}

// SubjectSummary represents the subject information
// shown to a faculty member.
type SubjectSummary struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Code         string `json:"code"`
	DepartmentID uint   `json:"department_id"`
	Semester     int    `json:"semester"`
	Credits      int    `json:"credits"`
	Status       bool   `json:"status"`
}

// FacultySubjectResponse represents a faculty-subject assignment
// together with the complete subject information.
type FacultySubjectResponse struct {
	ID        uint           `json:"id"`
	FacultyID uint           `json:"faculty_id"`
	SubjectID uint           `json:"subject_id"`
	Status    bool           `json:"status"`
	Subject   SubjectSummary `json:"subject"`
}
