package analytics

import (
	"log"
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

// AI Engine Gateway Handlers

// GetStudentAIPrediction proxies AI prediction request.
func (h *Handler) GetStudentAIPrediction(c *gin.Context) {
	studentID := c.Param("student_id")
	if studentID == "" {
		response.Error(c, http.StatusBadRequest, "Student ID parameter required")
		return
	}

	data, err := h.service.GetStudentAIPrediction(studentID)
	if err != nil {
		log.Printf("AI Prediction Error for student_id=%s: %v", studentID, err)
		response.Error(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	response.Success(c, "AI student prediction fetched successfully", data)
}

// GetStudentAIPatterns proxies AI pattern analysis request.
func (h *Handler) GetStudentAIPatterns(c *gin.Context) {
	studentID := c.Param("student_id")
	if studentID == "" {
		response.Error(c, http.StatusBadRequest, "Student ID parameter required")
		return
	}

	data, err := h.service.GetStudentAIPatterns(studentID)
	if err != nil {
		log.Printf("AI Patterns Error for student_id=%s: %v", studentID, err)
		response.Error(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	response.Success(c, "AI student patterns fetched successfully", data)
}

// GetStudentAIAlerts proxies AI smart alerts request.
func (h *Handler) GetStudentAIAlerts(c *gin.Context) {
	studentID := c.Param("student_id")
	if studentID == "" {
		response.Error(c, http.StatusBadRequest, "Student ID parameter required")
		return
	}

	data, err := h.service.GetStudentAIAlerts(studentID)
	if err != nil {
		log.Printf("AI Alerts Error for student_id=%s: %v", studentID, err)
		response.Error(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	response.Success(c, "AI student alerts fetched successfully", data)
}

// GetFacultyAIAnalytics proxies AI faculty classroom analytics request.
func (h *Handler) GetFacultyAIAnalytics(c *gin.Context) {
	facultyID := c.Param("faculty_id")
	if facultyID == "" {
		response.Error(c, http.StatusBadRequest, "Faculty ID parameter required")
		return
	}

	data, err := h.service.GetFacultyAIAnalytics(facultyID)
	if err != nil {
		log.Printf("AI Faculty Analytics Error for faculty_id=%s: %v", facultyID, err)
		response.Error(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	response.Success(c, "AI faculty analytics fetched successfully", data)
}

// GenerateStudentAIReport proxies AI student report generation request.
func (h *Handler) GenerateStudentAIReport(c *gin.Context) {
	studentID := c.Param("student_id")
	if studentID == "" {
		response.Error(c, http.StatusBadRequest, "Student ID parameter required")
		return
	}
	formatType := c.DefaultQuery("format_type", "PDF")

	data, err := h.service.GenerateStudentAIReport(studentID, formatType)
	if err != nil {
		log.Printf("AI Report Generation Error for student_id=%s: %v", studentID, err)
		response.Error(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	response.Success(c, "AI student report generated successfully", data)
}