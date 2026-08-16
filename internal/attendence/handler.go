package attendence

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles attendance HTTP requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new attendance handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// MarkAttendance handles creating an attendance record.
func (h *Handler) MarkAttendance(c *gin.Context) {

	var req CreateAttendanceRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(
			c,
			"Invalid attendance data",
		)
		return
	}

	// --------------------------------------------------
	// Get authenticated role
	// --------------------------------------------------

	role := strings.ToLower(
		strings.TrimSpace(
			c.GetString("role"),
		),
	)

	// --------------------------------------------------
	// Get authenticated faculty ID
	//
	// AuthMiddleware sets this only for faculty users.
	// --------------------------------------------------

	var authenticatedFacultyID uint

	if role == "faculty" {

		facultyIDValue, exists :=
			c.Get("faculty_id")

		if !exists {
			response.Error(
				c,
				http.StatusUnauthorized,
				"Authenticated faculty ID not found",
			)
			return
		}

		facultyID, ok :=
			facultyIDValue.(uint)

		if !ok || facultyID == 0 {
			response.Error(
				c,
				http.StatusUnauthorized,
				"Invalid authenticated faculty ID",
			)
			return
		}

		authenticatedFacultyID =
			facultyID
	}

	// --------------------------------------------------
	// Mark attendance
	// --------------------------------------------------

	attendance, err :=
		h.service.MarkAttendance(
			req,
			role,
			authenticatedFacultyID,
		)

	if err != nil {

		// Faculty is trying to use another faculty's subject.
		if errors.Is(
			err,
			ErrUnauthorizedSubject,
		) {
			response.Error(
				c,
				http.StatusForbidden,
				"You are not assigned to this subject",
			)
			return
		}

		response.Error(
			c,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	response.Created(
		c,
		"Attendance marked successfully",
		attendance,
	)
}

// GetAttendance returns attendance records.
func (h *Handler) GetAttendance(c *gin.Context) {

	records, err := h.service.GetAttendance()

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch attendance",
		)
		return
	}

	response.Success(
		c,
		"Attendance fetched successfully",
		records,
	)
}

// UpdateAttendance handles updating an attendance record.
func (h *Handler) UpdateAttendance(c *gin.Context) {

	id, err :=
		strconv.ParseUint(
			c.Param("id"),
			10,
			32,
		)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid attendance ID",
		)
		return
	}

	var req UpdateAttendanceRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(
			c,
			"Invalid attendance data",
		)
		return
	}

	attendance, err :=
		h.service.UpdateAttendance(
			uint(id),
			req,
		)

	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Attendance record not found",
		)
		return
	}

	response.Success(
		c,
		"Attendance updated successfully",
		attendance,
	)
}

// DeleteAttendance handles deleting an attendance record.
func (h *Handler) DeleteAttendance(c *gin.Context) {

	id, err :=
		strconv.ParseUint(
			c.Param("id"),
			10,
			32,
		)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid attendance ID",
		)
		return
	}

	if err :=
		h.service.DeleteAttendance(
			uint(id),
		); err != nil {

		response.Error(
			c,
			http.StatusNotFound,
			"Attendance record not found",
		)
		return
	}

	response.Success(
		c,
		"Attendance deleted successfully",
		nil,
	)
}

// GetAttendanceHistory returns attendance history for a student.
func (h *Handler) GetAttendanceHistory(c *gin.Context) {

	studentID, err :=
		strconv.ParseUint(
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

	records, err :=
		h.service.GetAttendanceHistory(
			uint(studentID),
		)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch attendance history",
		)
		return
	}

	response.Success(
		c,
		"Attendance history fetched successfully",
		records,
	)
}

// GetAttendancePercentage returns attendance percentage for a student.
func (h *Handler) GetAttendancePercentage(c *gin.Context) {

	studentID, err :=
		strconv.ParseUint(
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

	percentage, err :=
		h.service.GetAttendancePercentage(
			uint(studentID),
		)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to calculate attendance percentage",
		)
		return
	}

	response.Success(
		c,
		"Attendance percentage calculated successfully",
		gin.H{
			"student_id":         studentID,
			"attendance_percent": percentage,
		},
	)
}