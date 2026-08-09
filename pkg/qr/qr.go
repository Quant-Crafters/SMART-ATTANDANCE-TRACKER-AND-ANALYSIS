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

// GenerateQRBytes generates a QR code and returns the PNG bytes.
// This is used when the frontend needs the QR image directly.
func GenerateQRBytes(data string) ([]byte, error) {
	if data == "" {
		return nil, fmt.Errorf("QR data cannot be empty")
	}

	png, err := qrcode.Encode(
		data,
		qrcode.Medium,
		400,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code: %w", err)
	}

	return png, nil
}