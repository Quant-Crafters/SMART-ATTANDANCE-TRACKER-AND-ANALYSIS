package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/report"
	"github.com/gin-gonic/gin"
)

// RegisterReportRoutes registers all report routes.
func RegisterReportRoutes(router *gin.Engine) {

	handler := report.NewHandler()

	api := router.Group("/api/reports")
	{
		// CSV report
		api.GET(
			"/csv",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GenerateCSVReport,
		)

		// Excel report
		api.GET(
			"/excel",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GenerateExcelReport,
		)

		// PDF report
		api.GET(
			"/pdf",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GeneratePDFReport,
		)
	}
}