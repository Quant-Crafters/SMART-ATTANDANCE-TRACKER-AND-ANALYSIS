package upload

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".pdf":  true,
	".csv":  true,
	".xlsx": true,
}

const MaxFileSize int64 = 10 * 1024 * 1024 // 10 MB

// SaveFile validates and saves an uploaded file.
func SaveFile(file *multipart.FileHeader, uploadDir string) (string, error) {

	if file == nil {
		return "", fmt.Errorf("file is required")
	}

	if file.Size > MaxFileSize {
		return "", fmt.Errorf("file size exceeds 10 MB limit")
	}

	extension := strings.ToLower(filepath.Ext(file.Filename))

	if !allowedExtensions[extension] {
		return "", fmt.Errorf("file type %s is not allowed", extension)
	}

	if uploadDir == "" {
		uploadDir = "uploads"
	}

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename.
	fileName := fmt.Sprintf(
		"%d%s",
		time.Now().UnixNano(),
		extension,
	)

	filePath := filepath.Join(uploadDir, fileName)

	return filePath, nil
}