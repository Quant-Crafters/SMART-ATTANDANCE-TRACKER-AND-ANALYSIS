package department

// CreateDepartmentRequest represents department creation data.
type CreateDepartmentRequest struct {
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
}

// UpdateDepartmentRequest represents department update data.
type UpdateDepartmentRequest struct {
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
}

// DepartmentResponse represents department data returned by the API.
type DepartmentResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Status      bool   `json:"status"`
}