package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/attendence"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterAttendenceRoutes(router *gin.Engine) {

	handler := attendence.NewHandler()

	api := router.Group("/api/attendance")
	{
		api.POST(
			"/",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.MarkAttendance,
		)

		api.GET(
			"/",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty", "student"),
			handler.GetAttendance,
		)

		api.PUT(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.UpdateAttendance,
		)

		api.DELETE(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.DeleteAttendance,
		)

		api.GET(
			"/history/:student_id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty", "student"),
			handler.GetAttendanceHistory,
		)

		api.GET(
			"/percentage/:student_id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty", "student"),
			handler.GetAttendancePercentage,
		)
	}
}
