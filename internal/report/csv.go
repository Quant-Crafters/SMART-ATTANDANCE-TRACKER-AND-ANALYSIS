package report

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// GenerateCSV creates a CSV report file.
func GenerateCSV(
	fileName string,
	headers []string,
	rows [][]string,
) (string, error) {

	if fileName == "" {
		fileName = "attendance_report"
	}

	// Create reports directory.
	reportDir := "uploads/reports"

	if err := os.MkdirAll(reportDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create report directory: %w", err)
	}

	// Add timestamp to avoid overwriting previous reports.
	filePath := filepath.Join(
		reportDir,
		fmt.Sprintf(
			"%s_%s.csv",
			fileName,
			time.Now().Format("20060102_150405"),
		),
	)

	file, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create CSV file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write headers.
	if err := writer.Write(headers); err != nil {
		return "", fmt.Errorf("failed to write CSV headers: %w", err)
	}

	// Write rows.
	for _, row := range rows {
		if err := writer.Write(row); err != nil {
			return "", fmt.Errorf("failed to write CSV row: %w", err)
		}
	}

	if err := writer.Error(); err != nil {
		return "", fmt.Errorf("failed to save CSV report: %w", err)
	}

	return filePath, nil
}