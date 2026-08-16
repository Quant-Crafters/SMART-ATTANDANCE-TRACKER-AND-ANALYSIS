package faculty_subject

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles faculty-subject assignment HTTP requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new faculty-subject handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// AssignSubject assigns a subject to a faculty member.
// Admin only.
func (h *Handler) AssignSubject(c *gin.Context) {

	var req AssignSubjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(
			c,
			"Invalid faculty-subject assignment data",
		)
		return
	}

	assignment, err := h.service.AssignSubject(
		req.FacultyID,
		req.SubjectID,
	)

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
		"Subject assigned to faculty successfully",
		assignment,
	)
}

// GetMySubjects returns detailed subjects assigned to
// the currently authenticated faculty member.
func (h *Handler) GetMySubjects(c *gin.Context) {

	facultyIDValue, exists := c.Get("faculty_id")

	if !exists {
		response.Error(
			c,
			http.StatusUnauthorized,
			"Faculty ID not found",
		)
		return
	}

	facultyID, ok := facultyIDValue.(uint)

	if !ok || facultyID == 0 {
		response.Error(
			c,
			http.StatusUnauthorized,
			"Invalid faculty ID",
		)
		return
	}

	// IMPORTANT:
	// Use the detailed method here.
	subjects, err := h.service.GetFacultySubjectsWithDetails(
		facultyID,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch assigned subjects",
		)
		return
	}

	response.Success(
		c,
		"Assigned subjects fetched successfully",
		subjects,
	)
}

// GetFacultySubjects returns detailed subjects assigned
// to a specific faculty member.
// Admin only.
func (h *Handler) GetFacultySubjects(c *gin.Context) {

	facultyID, err := strconv.ParseUint(
		c.Param("faculty_id"),
		10,
		32,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid faculty ID",
		)
		return
	}

	// IMPORTANT:
	// Use the detailed method here too.
	subjects, err := h.service.GetFacultySubjectsWithDetails(
		uint(facultyID),
	)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch faculty subjects",
		)
		return
	}

	response.Success(
		c,
		"Faculty subjects fetched successfully",
		subjects,
	)
}

// RemoveSubjectAssignment removes a subject assignment.
// Admin only.
func (h *Handler) RemoveSubjectAssignment(c *gin.Context) {

	facultyID, err := strconv.ParseUint(
		c.Param("faculty_id"),
		10,
		32,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid faculty ID",
		)
		return
	}

	subjectID, err := strconv.ParseUint(
		c.Param("subject_id"),
		10,
		32,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid subject ID",
		)
		return
	}

	err = h.service.RemoveSubjectAssignment(
		uint(facultyID),
		uint(subjectID),
	)

	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			err.Error(),
		)
		return
	}

	response.Success(
		c,
		"Subject assignment removed successfully",
		nil,
	)
}
