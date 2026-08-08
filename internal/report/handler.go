package report

import (
	"net/http"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles report-related HTTP requests.
type Handler struct {
}

// NewHandler creates a new report handler.
func NewHandler() *Handler {
	return &Handler{}
}

// GenerateCSVReport generates a CSV report.
func (h *Handler) GenerateCSVReport(c *gin.Context) {

	headers := []string{
		"Student ID",
		"Name",
		"Department",
		"Attendance %",
	}

	rows := [][]string{}

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

	response.Success(
		c,
		"CSV report generated successfully",
		gin.H{
			"file_path": filePath,
		},
	)
}

// GenerateExcelReport generates an Excel report.
func (h *Handler) GenerateExcelReport(c *gin.Context) {

	headers := []string{
		"Student ID",
		"Name",
		"Department",
		"Attendance %",
	}

	rows := [][]interface{}{}

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

	response.Success(
		c,
		"Excel report generated successfully",
		gin.H{
			"file_path": filePath,
		},
	)
}