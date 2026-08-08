package excel

import (
	"fmt"

	"github.com/xuri/excelize/v2"
)

// CreateExcel creates an Excel file from headers and rows.
func CreateExcel(
	fileName string,
	sheetName string,
	headers []string,
	rows [][]interface{},
) (string, error) {

	file := excelize.NewFile()
	defer file.Close()

	// Rename default sheet
	defaultSheet := file.GetSheetName(0)

	if sheetName == "" {
		sheetName = "Sheet1"
	}

	if defaultSheet != sheetName {
		file.SetSheetName(defaultSheet, sheetName)
	}

	// Write headers
	for col, header := range headers {

		cell, err := excelize.CoordinatesToCellName(col+1, 1)
		if err != nil {
			return "", err
		}

		if err := file.SetCellValue(sheetName, cell, header); err != nil {
			return "", err
		}
	}

	// Write data
	for rowIndex, row := range rows {

		for colIndex, value := range row {

			cell, err := excelize.CoordinatesToCellName(
				colIndex+1,
				rowIndex+2,
			)

			if err != nil {
				return "", err
			}

			if err := file.SetCellValue(sheetName, cell, value); err != nil {
				return "", err
			}
		}
	}

	// Set column width
	for col := range headers {

		column, err := excelize.ColumnNumberToName(col + 1)
		if err != nil {
			continue
		}

		_ = file.SetColWidth(
			sheetName,
			column,
			column,
			20,
		)
	}

	// Create output path
	outputPath := fmt.Sprintf("%s.xlsx", fileName)

	// Save file
	if err := file.SaveAs(outputPath); err != nil {
		return "", err
	}

	return outputPath, nil
}