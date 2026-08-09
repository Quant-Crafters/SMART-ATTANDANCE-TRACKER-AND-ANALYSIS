package qrattendance

import (
	"net/http"
	"strconv"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/qr"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/gin-gonic/gin"
)

const (
	roleFaculty = "faculty"
	roleStudent = "student"
)

// Handler handles QR attendance requests.
type Handler struct {
	service *Service
}

// NewHandler creates a new QR attendance handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// CreateSession starts a new QR attendance session.
func (h *Handler) CreateSession(c *gin.Context) {
	var req CreateQRSessionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := c.GetUint("user_id")

	if userID == 0 {
		response.Error(c, http.StatusUnauthorized, "Invalid authentication")
		return
	}

	if c.GetString("role") != roleFaculty {
		response.Error(
			c,
			http.StatusForbidden,
			"Only faculty can start attendance",
		)
		return
	}

	session, err := h.service.CreateSession(userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(
		c,
		"QR attendance session created successfully",
		session,
	)
}

// GetCurrentQR returns the currently active QR as a PNG image.
func (h *Handler) GetCurrentQR(c *gin.Context) {
	sessionID, err := strconv.ParseUint(
		c.Param("session_id"),
		10,
		64,
	)

	if err != nil || sessionID == 0 {
		response.Error(c, http.StatusBadRequest, "Invalid session ID")
		return
	}

	if c.GetString("role") != roleFaculty {
		response.Error(
			c,
			http.StatusForbidden,
			"Only faculty can view attendance QR",
		)
		return
	}

	qrCode, err := h.service.GetCurrentQRCode(uint(sessionID))
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	pngData, err := qr.GenerateQRBytes(qrCode.Token)
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to generate QR image",
		)
		return
	}

	c.Data(
		http.StatusOK,
		"image/png",
		pngData,
	)
}

// ScanQR validates a QR token scanned by a student.
func (h *Handler) ScanQR(c *gin.Context) {
	var req ScanQRRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := c.GetUint("user_id")

	if userID == 0 {
		response.Error(c, http.StatusUnauthorized, "Invalid authentication")
		return
	}

	if c.GetString("role") != roleStudent {
		response.Error(
			c,
			http.StatusForbidden,
			"Only students can scan attendance QR",
		)
		return
	}

	qrCode, session, err := h.service.ValidateQR(req.Token)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(
		c,
		"QR code validated successfully",
		gin.H{
			"valid":      true,
			"session_id": session.ID,
			"subject_id": session.SubjectID,
			"qr_id":      qrCode.ID,
			"user_id":    userID,
		},
	)
}