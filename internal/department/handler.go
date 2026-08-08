package department

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles department HTTP requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new department handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// CreateDepartment handles department creation.
func (h *Handler) CreateDepartment(c *gin.Context) {

	var req CreateDepartmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid department data")
		return
	}

	department, err := h.service.CreateDepartment(req)
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to create department",
		)
		return
	}

	response.Created(
		c,
		"Department created successfully",
		department,
	)
}

// GetDepartments returns all departments.
func (h *Handler) GetDepartments(c *gin.Context) {

	departments, err := h.service.GetDepartments()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch departments",
		)
		return
	}

	response.Success(
		c,
		"Departments fetched successfully",
		departments,
	)
}

// GetDepartmentByID returns a department by ID.
func (h *Handler) GetDepartmentByID(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid department ID",
		)
		return
	}

	department, err := h.service.GetDepartmentByID(uint(id))
	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Department not found",
		)
		return
	}

	response.Success(
		c,
		"Department fetched successfully",
		department,
	)
}

// UpdateDepartment handles department updates.
func (h *Handler) UpdateDepartment(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid department ID",
		)
		return
	}

	var req UpdateDepartmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(
			c,
			"Invalid department data",
		)
		return
	}

	department, err := h.service.UpdateDepartment(
		uint(id),
		req,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Department not found",
		)
		return
	}

	response.Success(
		c,
		"Department updated successfully",
		department,
	)
}

// DeleteDepartment handles department deletion.
func (h *Handler) DeleteDepartment(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid department ID",
		)
		return
	}

	if err := h.service.DeleteDepartment(uint(id)); err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Department not found",
		)
		return
	}

	response.Success(
		c,
		"Department deleted successfully",
		nil,
	)
}