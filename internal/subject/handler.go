package subject

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles subject HTTP requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new subject handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// CreateSubject handles subject creation.
func (h *Handler) CreateSubject(c *gin.Context) {

	var req CreateSubjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Invalid subject data")
		return
	}

	subject, err := h.service.CreateSubject(req)
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
		"Subject created successfully",
		subject,
	)
}

// GetSubjects returns all subjects.
func (h *Handler) GetSubjects(c *gin.Context) {

	subjects, err := h.service.GetSubjects()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch subjects",
		)
		return
	}

	response.Success(
		c,
		"Subjects fetched successfully",
		subjects,
	)
}

// GetSubjectByID returns a subject by ID.
func (h *Handler) GetSubjectByID(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid subject ID",
		)
		return
	}

	subject, err := h.service.GetSubjectByID(uint(id))
	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Subject not found",
		)
		return
	}

	response.Success(
		c,
		"Subject fetched successfully",
		subject,
	)
}

// UpdateSubject handles subject updates.
func (h *Handler) UpdateSubject(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid subject ID",
		)
		return
	}

	var req UpdateSubjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(
			c,
			"Invalid subject data",
		)
		return
	}

	subject, err := h.service.UpdateSubject(
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
		"Subject updated successfully",
		subject,
	)
}

// DeleteSubject handles subject deletion.
func (h *Handler) DeleteSubject(c *gin.Context) {

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid subject ID",
		)
		return
	}

	if err := h.service.DeleteSubject(uint(id)); err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Subject not found",
		)
		return
	}

	response.Success(
		c,
		"Subject deleted successfully",
		nil,
	)
}