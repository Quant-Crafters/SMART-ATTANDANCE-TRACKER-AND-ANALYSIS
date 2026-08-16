package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/analytics"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterAnalyticsRoutes registers analytics routes.
func RegisterAnalyticsRoutes(router *gin.Engine) {

	handler := analytics.NewHandler()

	api := router.Group("/api/analytics")
	{
		// Overall attendance analytics
		api.GET(
			"/attendance",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GetAttendanceAnalytics,
		)

		// Student-wise analytics
		api.GET(
			"/students/:student_id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty", "student"),
			handler.GetStudentAnalytics,
		)

		// Subject-wise analytics
		api.GET(
			"/subjects/:subject_id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GetSubjectAnalytics,
		)

		// Admin dashboard analytics
		api.GET(
			"/dashboard",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.GetDashboardAnalytics,
		)
	}
}
