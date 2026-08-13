package qr

import (
	"fmt"

	qrcode "github.com/skip2/go-qrcode"
)

// GenerateQR generates a QR code and saves it as a PNG file.
func GenerateQR(data string, filePath string) error {

	if data == "" {
		return fmt.Errorf("QR data cannot be empty")
	}

	if filePath == "" {
		return fmt.Errorf("QR file path cannot be empty")
	}

	err := qrcode.WriteFile(
		data,
		qrcode.Medium,
		256,
		filePath,
	)

	if err != nil {
		return fmt.Errorf("failed to generate QR code: %w", err)
	}

	return nil
}