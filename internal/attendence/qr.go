package attendence

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/skip2/go-qrcode"
)

// GenerateAttendanceQR generates a QR code for an attendance session.
func GenerateAttendanceQR(
	attendanceID uint,
	data string,
) (string, error) {

	if data == "" {
		return "", fmt.Errorf("QR data cannot be empty")
	}

	// Create QR directory if it doesn't exist.
	qrDir := "uploads/qr"

	if err := os.MkdirAll(qrDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create QR directory: %w", err)
	}

	fileName := fmt.Sprintf(
		"attendance_%d.png",
		attendanceID,
	)

	filePath := filepath.Join(qrDir, fileName)

	// Generate QR code.
	if err := qrcode.WriteFile(
		data,
		qrcode.Medium,
		256,
		filePath,
	); err != nil {
		return "", fmt.Errorf("failed to generate QR code: %w", err)
	}

	return filePath, nil
}