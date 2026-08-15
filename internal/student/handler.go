package student

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/validator"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler creates a new student handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// CreateStudent handles student creation.
func (h *Handler) CreateStudent(c *gin.Context) {

	var req CreateStudentRequest

	// Read JSON body
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if err := validator.ValidateStruct(req); err != nil {
		response.ValidationError(c, validator.FormatValidationError(err))
		return
	}

	// Create student
	err := h.service.CreateStudent(req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create student")
		return
	}

	response.Success(c, "Student created successfully", nil)
}

// GetAllStudents handles fetching all students.
func (h *Handler) GetAllStudents(c *gin.Context) {

	students, err := h.service.GetAllStudents()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch students")
		return
	}

	response.Success(c, "Students fetched successfully", students)
}

// GetStudentByID handles fetching a single student.
func (h *Handler) GetStudentByID(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid student ID")
		return
	}

	student, err := h.service.GetStudentByID(uint(id))
	if err != nil {
		response.Error(c, http.StatusNotFound, "Student not found")
		return
	}

	response.Success(c, "Student fetched successfully", student)
}

// UpdateStudent handles updating a student.
func (h *Handler) UpdateStudent(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid student ID")
		return
	}

	var req UpdateStudentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = h.service.UpdateStudent(uint(id), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update student")
		return
	}

	response.Success(c, "Student updated successfully", nil)
}

// DeleteStudent handles deleting a student.
func (h *Handler) DeleteStudent(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid student ID")
		return
	}

	err = h.service.DeleteStudent(uint(id))
	if err != nil {
		response.Error(c, http.StatusNotFound, "Student not found")
		return
	}

	response.Success(c, "Student deleted successfully", nil)
}
// added by me
// GetMyStudent handles fetching the logged-in student's own record.
func (h *Handler) GetMyStudent(c *gin.Context) {

	email := c.GetString("email")

	if email == "" {
		response.Error(
			c,
			http.StatusUnauthorized,
			"User email not found",
		)
		return
	}

	student, err := h.service.GetStudentByEmail(email)
	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Student profile not found",
		)
		return
	}

	response.Success(
		c,
		"Student profile fetched successfully",
		student,
	)
}