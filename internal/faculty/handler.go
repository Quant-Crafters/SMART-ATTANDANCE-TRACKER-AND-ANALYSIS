package faculty

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles faculty HTTP requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new faculty handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// CreateFaculty handles faculty creation.
func (h *Handler) CreateFaculty(c *gin.Context) {

	var req CreateFacultyRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid faculty data")
		return
	}

	faculty, err := h.service.CreateFaculty(req)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	response.Created(
		c,
		"Faculty created successfully",
		faculty,
	)
}

// GetFaculties returns all faculty members.
func (h *Handler) GetFaculties(c *gin.Context) {

	faculties, err := h.service.GetFaculties()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch faculty",
		)
		return
	}

	response.Success(
		c,
		"Faculty fetched successfully",
		faculties,
	)
}

// GetFacultyByID returns a faculty member by ID.
func (h *Handler) GetFacultyByID(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid faculty ID",
		)
		return
	}

	faculty, err := h.service.GetFacultyByID(uint(id))
	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Faculty not found",
		)
		return
	}

	response.Success(
		c,
		"Faculty fetched successfully",
		faculty,
	)
}

// UpdateFaculty handles faculty updates.
func (h *Handler) UpdateFaculty(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid faculty ID",
		)
		return
	}

	var req UpdateFacultyRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(
			c,
			"Invalid faculty data",
		)
		return
	}

	faculty, err := h.service.UpdateFaculty(
		uint(id),
		req,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	response.Success(
		c,
		"Faculty updated successfully",
		faculty,
	)
}

// DeleteFaculty handles faculty deletion.
func (h *Handler) DeleteFaculty(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid faculty ID",
		)
		return
	}

	if err := h.service.DeleteFaculty(uint(id)); err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Faculty not found",
		)
		return
	}

	response.Success(
		c,
		"Faculty deleted successfully",
		nil,
	)
}