package report

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/xuri/excelize/v2"
)

// GenerateExcel creates an Excel report.
func GenerateExcel(
	fileName string,
	sheetName string,
	headers []string,
	rows [][]interface{},
) (string, error) {

	if fileName == "" {
		fileName = "attendance_report"
	}

	if sheetName == "" {
		sheetName = "Report"
	}

	// Create reports directory.
	reportDir := "uploads/reports"

	if err := os.MkdirAll(reportDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create report directory: %w", err)
	}

	// Create Excel workbook.
	file := excelize.NewFile()
	defer file.Close()

	// Rename default sheet.
	defaultSheet := file.GetSheetName(0)

	if defaultSheet != sheetName {
		file.SetSheetName(defaultSheet, sheetName)
	}

	// Write headers.
	for column, header := range headers {

		cell, err := excelize.CoordinatesToCellName(column+1, 1)
		if err != nil {
			return "", fmt.Errorf("failed to create header cell: %w", err)
		}

		if err := file.SetCellValue(
			sheetName,
			cell,
			header,
		); err != nil {
			return "", fmt.Errorf("failed to write header: %w", err)
		}
	}

	// Write rows.
	for rowIndex, row := range rows {

		for columnIndex, value := range row {

			cell, err := excelize.CoordinatesToCellName(
				columnIndex+1,
				rowIndex+2,
			)

			if err != nil {
				return "", fmt.Errorf("failed to create cell: %w", err)
			}

			if err := file.SetCellValue(
				sheetName,
				cell,
				value,
			); err != nil {
				return "", fmt.Errorf("failed to write data: %w", err)
			}
		}
	}

	// Set column width.
	for column := range headers {

		columnName, err := excelize.ColumnNumberToName(column + 1)
		if err != nil {
			continue
		}

		if err := file.SetColWidth(
			sheetName,
			columnName,
			columnName,
			20,
		); err != nil {
			return "", fmt.Errorf("failed to set column width: %w", err)
		}
	}

	// Generate unique file name.
	filePath := filepath.Join(
		reportDir,
		fmt.Sprintf(
			"%s_%s.xlsx",
			fileName,
			time.Now().Format("20060102_150405"),
		),
	)

	// Save Excel file.
	if err := file.SaveAs(filePath); err != nil {
		return "", fmt.Errorf("failed to save Excel report: %w", err)
	}

	return filePath, nil
}