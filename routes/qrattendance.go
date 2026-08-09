package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/qrattendance"
	"github.com/gin-gonic/gin"
)

// RegisterQRAttendanceRoutes registers all QR attendance routes.
func RegisterQRAttendanceRoutes(router *gin.Engine) {
	handler := qrattendance.NewHandler()

	api := router.Group("/api/qr")
	{
		// Faculty starts a new attendance session.
		api.POST(
			"/sessions",
			middleware.AuthMiddleware(),
			handler.CreateSession,
		)

		// Faculty gets the currently active QR as PNG.
		api.GET(
			"/sessions/:session_id/current.png",
			middleware.AuthMiddleware(),
			handler.GetCurrentQR,
		)

		// Student scans the QR code.
		api.POST(
			"/scan",
			middleware.AuthMiddleware(),
			handler.ScanQR,
		)
	}
}