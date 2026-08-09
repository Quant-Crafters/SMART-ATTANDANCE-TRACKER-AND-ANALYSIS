package qrattendance

// CreateQRSessionRequest represents a request to start
// a new QR attendance session.
type CreateQRSessionRequest struct {
	SubjectID uint `json:"subject_id" binding:"required"`
}

// ScanQRRequest represents a student's QR scan request.
type ScanQRRequest struct {
	Token string `json:"token" binding:"required"`
}

// QRSessionResponse represents QR session information.
type QRSessionResponse struct {
	ID           uint   `json:"id"`
	SubjectID    uint   `json:"subject_id"`
	TotalQRCodes int    `json:"total_qr_codes"`
	IntervalSec  int    `json:"interval_seconds"`
	StartedAt    string `json:"started_at"`
	ExpiresAt    string `json:"expires_at"`
	Status       string `json:"status"`
}