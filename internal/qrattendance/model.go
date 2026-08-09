package qrattendance

import "time"

// QRSession represents one faculty attendance session.
type QRSession struct {
	ID uint `gorm:"primaryKey" json:"id"`

	FacultyID uint `gorm:"not null;index" json:"faculty_id"`
	SubjectID uint `gorm:"not null;index" json:"subject_id"`

	TotalQRCodes int `gorm:"not null" json:"total_qr_codes"`
	IntervalSec  int `gorm:"not null" json:"interval_seconds"`

	StartedAt time.Time `gorm:"not null" json:"started_at"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`

	Status string `gorm:"type:varchar(20);not null" json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// QRCode represents one rotating QR code.
type QRCode struct {
	ID uint `gorm:"primaryKey" json:"id"`

	SessionID uint `gorm:"not null;index" json:"session_id"`

	// Token is never returned in normal API JSON responses.
	Token string `gorm:"type:varchar(128);uniqueIndex;not null" json:"-"`

	Sequence int `gorm:"not null" json:"sequence"`

	ValidFrom  time.Time `gorm:"not null;index" json:"valid_from"`
	ValidUntil time.Time `gorm:"not null;index" json:"valid_until"`

	Used bool `gorm:"default:false" json:"used"`

	CreatedAt time.Time `json:"created_at"`
}