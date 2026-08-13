package analytics

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles analytics HTTP requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new analytics handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// GetAttendanceAnalytics handles overall attendance analytics.
func (h *Handler) GetAttendanceAnalytics(c *gin.Context) {
	data, err := h.service.GetAttendanceAnalytics()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch attendance analytics",
		)
		return
	}

	response.Success(
		c,
		"Attendance analytics fetched successfully",
		data,
	)
}

// GetStudentAnalytics handles student-wise analytics.
func (h *Handler) GetStudentAnalytics(c *gin.Context) {
	id, err := strconv.ParseUint(
		c.Param("student_id"),
		10,
		32,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid student ID",
		)
		return
	}

	data, err := h.service.GetStudentAnalytics(uint(id))
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch student analytics",
		)
		return
	}

	response.Success(
		c,
		"Student analytics fetched successfully",
		data,
	)
}

// GetSubjectAnalytics handles subject-wise analytics.
func (h *Handler) GetSubjectAnalytics(c *gin.Context) {
	id, err := strconv.ParseUint(
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

	data, err := h.service.GetSubjectAnalytics(uint(id))
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch subject analytics",
		)
		return
	}

	response.Success(
		c,
		"Subject analytics fetched successfully",
		data,
	)
}

// GetDashboardAnalytics handles dashboard analytics.
func (h *Handler) GetDashboardAnalytics(c *gin.Context) {
	data, err := h.service.GetDashboardAnalytics()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch dashboard analytics",
		)
		return
	}

	response.Success(
		c,
		"Dashboard analytics fetched successfully",
		data,
	)
}