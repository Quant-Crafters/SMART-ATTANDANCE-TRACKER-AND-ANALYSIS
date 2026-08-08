package report

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/go-pdf/fpdf"
)

// GeneratePDF creates a PDF attendance report.
func GeneratePDF(
	fileName string,
	title string,
	headers []string,
	rows [][]string,
) (string, error) {

	if fileName == "" {
		fileName = "attendance_report"
	}

	if title == "" {
		title = "Attendance Report"
	}

	// Create reports directory.
	reportDir := "uploads/reports"

	if err := os.MkdirAll(reportDir, 0755); err != nil {
		return "", fmt.Errorf(
			"failed to create report directory: %w",
			err,
		)
	}

	// Create PDF.
	pdf := fpdf.New(
		"Portrait",
		"mm",
		"A4",
		"",
	)

	pdf.SetTitle(title, false)

	pdf.AddPage()

	// Title.
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(
		190,
		10,
		title,
		"",
		1,
		"C",
		false,
		0,
		"",
	)

	pdf.Ln(5)

	// Table configuration.
	columnCount := len(headers)

	if columnCount == 0 {
		return "", fmt.Errorf("headers cannot be empty")
	}

	columnWidth := 190.0 / float64(columnCount)

	// Header.
	pdf.SetFont("Arial", "B", 10)

	for _, header := range headers {
		pdf.CellFormat(
			columnWidth,
			8,
			header,
			"1",
			0,
			"C",
			false,
			0,
			"",
		)
	}

	pdf.Ln(-1)

	// Rows.
	pdf.SetFont("Arial", "", 9)

	for _, row := range rows {

		for _, value := range row {
			pdf.CellFormat(
				columnWidth,
				8,
				value,
				"1",
				0,
				"C",
				false,
				0,
				"",
			)
		}

		pdf.Ln(-1)
	}

	// Generate unique file path.
	filePath := filepath.Join(
		reportDir,
		fmt.Sprintf(
			"%s_%s.pdf",
			fileName,
			time.Now().Format("20060102_150405"),
		),
	)

	// Save PDF.
	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", fmt.Errorf(
			"failed to save PDF report: %w",
			err,
		)
	}

	return filePath, nil
}