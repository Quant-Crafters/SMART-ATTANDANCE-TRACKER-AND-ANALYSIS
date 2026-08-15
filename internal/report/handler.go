package report

import (
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

// AttendanceReportRow represents one student in the report.
type AttendanceReportRow struct {
	StudentID  string  `json:"student_id"`
	Name       string  `json:"name"`
	Department string  `json:"department"`
	Attendance float64 `json:"attendance"`
}

// getAttendanceReportData gets real student attendance data.
func (h *Handler) getAttendanceReportData() ([]AttendanceReportRow, error) {

	var rows []AttendanceReportRow

	err := config.DB.Raw(`
		SELECT
			s.student_id,
			s.name,
			s.department,
			COALESCE(
				ROUND(
					100.0 *
					COUNT(
						CASE
							WHEN a.status = 'present' THEN 1
						END
					)
					/ NULLIF(COUNT(a.id), 0),
					2
				),
				0
			) AS attendance
		FROM students s
		LEFT JOIN attendance a
			ON a.student_id = s.id
		GROUP BY
			s.id,
			s.student_id,
			s.name,
			s.department
		ORDER BY
			s.student_id
	`).Scan(&rows).Error

	return rows, err
}

// GenerateCSVReport generates and downloads a CSV attendance report.
func (h *Handler) GenerateCSVReport(c *gin.Context) {

	data, err := h.getAttendanceReportData()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch report data",
		)
		return
	}

	headers := []string{
		"Student ID",
		"Name",
		"Department",
		"Attendance %",
	}

	rows := make([][]string, 0, len(data))

	for _, item := range data {
		rows = append(rows, []string{
			item.StudentID,
			item.Name,
			item.Department,
			formatPercentage(item.Attendance),
		})
	}

	filePath, err := GenerateCSV(
		"attendance_report",
		headers,
		rows,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to generate CSV report",
		)
		return
	}

	// Tell browser this is a CSV file.
	c.Header(
		"Content-Type",
		"text/csv; charset=utf-8",
	)

	c.FileAttachment(
		filePath,
		filepath.Base(filePath),
	)
}

// GenerateExcelReport generates and downloads an Excel attendance report.
func (h *Handler) GenerateExcelReport(c *gin.Context) {

	data, err := h.getAttendanceReportData()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch report data",
		)
		return
	}

	headers := []string{
		"Student ID",
		"Name",
		"Department",
		"Attendance %",
	}

	rows := make([][]interface{}, 0, len(data))

	for _, item := range data {
		rows = append(rows, []interface{}{
			item.StudentID,
			item.Name,
			item.Department,
			item.Attendance,
		})
	}

	filePath, err := GenerateExcel(
		"attendance_report",
		"Attendance",
		headers,
		rows,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to generate Excel report",
		)
		return
	}

	// Tell browser this is an Excel file.
	c.Header(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	)

	c.FileAttachment(
		filePath,
		filepath.Base(filePath),
	)
}

// GeneratePDFReport generates and downloads a PDF attendance report.
func (h *Handler) GeneratePDFReport(c *gin.Context) {

	data, err := h.getAttendanceReportData()
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch report data",
		)
		return
	}

	headers := []string{
		"Student ID",
		"Name",
		"Department",
		"Attendance %",
	}

	rows := make([][]string, 0, len(data))

	for _, item := range data {
		rows = append(rows, []string{
			item.StudentID,
			item.Name,
			item.Department,
			formatPercentage(item.Attendance),
		})
	}

	filePath, err := GeneratePDF(
		"attendance_report",
		"Attendance Report",
		headers,
		rows,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to generate PDF report",
		)
		return
	}

	// Tell browser this is a PDF file.
	c.Header(
		"Content-Type",
		"application/pdf",
	)

	c.FileAttachment(
		filePath,
		filepath.Base(filePath),
	)
}

// formatPercentage formats attendance as a percentage string.
func formatPercentage(value float64) string {
	return fmt.Sprintf("%.2f%%", value)
}