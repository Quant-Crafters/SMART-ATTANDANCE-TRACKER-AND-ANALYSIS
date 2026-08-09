package qrattendance

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
)

const (
	totalQRCodes = 100
	qrInterval   = 15 * time.Second
)

type Service struct {
	repo *Repository
}

// NewService creates a new QR attendance service.
func NewService() *Service {
	return &Service{
		repo: NewRepository(),
	}
}

// CreateSession creates one attendance session with 100 rotating QR codes.
func (s *Service) CreateSession(
	facultyID uint,
	req CreateQRSessionRequest,
) (*QRSession, error) {

	if facultyID == 0 {
		return nil, errors.New("invalid faculty")
	}

	if req.SubjectID == 0 {
		return nil, errors.New("subject_id is required")
	}

	startedAt := time.Now()

	session := &QRSession{
		FacultyID:    facultyID,
		SubjectID:    req.SubjectID,
		TotalQRCodes: totalQRCodes,
		IntervalSec:  15,
		StartedAt:    startedAt,
		ExpiresAt:    startedAt.Add(totalQRCodes * qrInterval),
		Status:       "active",
	}

	qrCodes := make([]QRCode, 0, totalQRCodes)

	for i := 0; i < totalQRCodes; i++ {
		token, err := generateSecureToken()
		if err != nil {
			return nil, errors.New("failed to generate QR token")
		}

		validFrom := startedAt.Add(time.Duration(i) * qrInterval)
		validUntil := validFrom.Add(qrInterval)

		qrCodes = append(qrCodes, QRCode{
			Token:      token,
			Sequence:   i + 1,
			ValidFrom:  validFrom,
			ValidUntil: validUntil,
			Used:       false,
		})
	}

	if err := s.repo.CreateSessionWithQRCodes(session, qrCodes); err != nil {
		return nil, err
	}

	return session, nil
}

// GetCurrentQRCode returns the currently valid QR code.
func (s *Service) GetCurrentQRCode(
	sessionID uint,
) (*QRCode, error) {

	session, err := s.repo.GetSessionByID(sessionID)
	if err != nil {
		return nil, errors.New("attendance session not found")
	}

	now := time.Now()

	if session.Status != "active" {
		return nil, errors.New("attendance session is not active")
	}

	if now.Before(session.StartedAt) {
		return nil, errors.New("attendance session has not started")
	}

	if !now.Before(session.ExpiresAt) {
		_ = s.repo.UpdateSessionStatus(session.ID, "expired")
		return nil, errors.New("attendance session has expired")
	}

	qr, err := s.repo.GetCurrentQRCode(sessionID, now)
	if err != nil {
		return nil, errors.New("no active QR code")
	}

	return qr, nil
}

// ValidateQR validates a scanned QR token.
func (s *Service) ValidateQR(token string) (*QRCode, *QRSession, error) {

	if token == "" {
		return nil, nil, errors.New("QR token is required")
	}

	qr, err := s.repo.GetQRCodeByToken(token)
	if err != nil {
		return nil, nil, errors.New("invalid QR code")
	}

	now := time.Now()

	if now.Before(qr.ValidFrom) {
		return nil, nil, errors.New("QR code is not active yet")
	}

	if !now.Before(qr.ValidUntil) {
		return nil, nil, errors.New("QR code has expired")
	}

	if qr.Used {
		return nil, nil, errors.New("QR code has already been used")
	}

	session, err := s.repo.GetSessionByID(qr.SessionID)
	if err != nil {
		return nil, nil, errors.New("attendance session not found")
	}

	if session.Status != "active" {
		return nil, nil, errors.New("attendance session is not active")
	}

	if !now.Before(session.ExpiresAt) {
		_ = s.repo.UpdateSessionStatus(session.ID, "expired")
		return nil, nil, errors.New("attendance session has expired")
	}

	return qr, session, nil
}

// MarkQRCodeUsed marks the scanned QR as used.
func (s *Service) MarkQRCodeUsed(qrID uint) error {
	if qrID == 0 {
		return errors.New("invalid QR code")
	}

	return s.repo.MarkQRCodeUsed(qrID)
}

// generateSecureToken generates a cryptographically secure QR token.
func generateSecureToken() (string, error) {

	buffer := make([]byte, 32)

	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}

	return hex.EncodeToString(buffer), nil
}