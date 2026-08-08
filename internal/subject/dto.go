package subject

// CreateSubjectRequest represents subject creation data.
type CreateSubjectRequest struct {
	Name         string `json:"name" binding:"required"`
	Code         string `json:"code" binding:"required"`
	DepartmentID uint   `json:"department_id" binding:"required"`
	Semester     int    `json:"semester" binding:"required"`
	Credits      int    `json:"credits"`
}

// UpdateSubjectRequest represents subject update data.
type UpdateSubjectRequest struct {
	Name         string `json:"name" binding:"required"`
	Code         string `json:"code" binding:"required"`
	DepartmentID uint   `json:"department_id" binding:"required"`
	Semester     int    `json:"semester" binding:"required"`
	Credits      int    `json:"credits"`
}

// SubjectResponse represents subject data returned by the API.
type SubjectResponse struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Code         string `json:"code"`
	DepartmentID uint   `json:"department_id"`
	Semester     int    `json:"semester"`
	Credits      int    `json:"credits"`
	Status       bool   `json:"status"`
}