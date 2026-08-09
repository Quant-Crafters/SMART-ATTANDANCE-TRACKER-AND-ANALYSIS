package qrattendance

import (
	"time"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new QR attendance repository.
func NewRepository() *Repository {
	return &Repository{
		db: config.DB,
	}
}

// CreateSession creates a new QR attendance session.
func (r *Repository) CreateSession(session *QRSession) error {
	return r.db.Create(session).Error
}

// CreateQRCode creates a new QR code.
func (r *Repository) CreateQRCode(qr *QRCode) error {
	return r.db.Create(qr).Error
}

// CreateSessionWithQRCodes creates the session and all QR codes
// inside a single database transaction.
func (r *Repository) CreateSessionWithQRCodes(
	session *QRSession,
	qrCodes []QRCode,
) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		if err := tx.Create(session).Error; err != nil {
			return err
		}

		for i := range qrCodes {
			qrCodes[i].SessionID = session.ID

			if err := tx.Create(&qrCodes[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GetSessionByID returns a QR session by ID.
func (r *Repository) GetSessionByID(id uint) (*QRSession, error) {
	var session QRSession

	if err := r.db.First(&session, id).Error; err != nil {
		return nil, err
	}

	return &session, nil
}

// GetCurrentQRCode returns the QR code currently valid for a session.
func (r *Repository) GetCurrentQRCode(
	sessionID uint,
	now time.Time,
) (*QRCode, error) {
	var qr QRCode

	err := r.db.
		Where(
			"session_id = ? AND valid_from <= ? AND valid_until > ?",
			sessionID,
			now,
			now,
		).
		Order("sequence ASC").
		First(&qr).Error

	if err != nil {
		return nil, err
	}

	return &qr, nil
}

// GetQRCodeByToken returns a QR code using its secure token.
func (r *Repository) GetQRCodeByToken(token string) (*QRCode, error) {
	var qr QRCode

	if err := r.db.
		Where("token = ?", token).
		First(&qr).Error; err != nil {
		return nil, err
	}

	return &qr, nil
}

// GetSessionQRCodes returns all QR codes belonging to a session.
func (r *Repository) GetSessionQRCodes(sessionID uint) ([]QRCode, error) {
	var qrCodes []QRCode

	if err := r.db.
		Where("session_id = ?", sessionID).
		Order("sequence ASC").
		Find(&qrCodes).Error; err != nil {
		return nil, err
	}

	return qrCodes, nil
}

// MarkQRCodeUsed marks a QR code as used.
func (r *Repository) MarkQRCodeUsed(id uint) error {
	return r.db.
		Model(&QRCode{}).
		Where("id = ?", id).
		Update("used", true).Error
}

// UpdateSessionStatus updates the status of a QR session.
func (r *Repository) UpdateSessionStatus(
	id uint,
	status string,
) error {
	return r.db.
		Model(&QRSession{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// GetActiveSessionByFacultyAndSubject returns the active session
// for a faculty member and subject.
func (r *Repository) GetActiveSessionByFacultyAndSubject(
	facultyID uint,
	subjectID uint,
) (*QRSession, error) {
	var session QRSession

	err := r.db.
		Where(
			"faculty_id = ? AND subject_id = ? AND status = ?",
			facultyID,
			subjectID,
			"active",
		).
		Order("created_at DESC").
		First(&session).Error

	if err != nil {
		return nil, err
	}

	return &session, nil
}