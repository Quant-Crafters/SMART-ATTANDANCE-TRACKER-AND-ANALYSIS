package routes

import (
	"net/http"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterAnalyticsRoutes registers analytics routes.
func RegisterAnalyticsRoutes(router *gin.Engine) {

	api := router.Group("/api/analytics")
	{
		// Admin & Faculty - Overall attendance analytics
		api.GET(
			"/attendance",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Attendance analytics endpoint",
					"data":   nil,
				})
			},
		)

		// Admin & Faculty - Student-wise analytics
		api.GET(
			"/students",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Student analytics endpoint",
					"data":   nil,
				})
			},
		)

		// Admin & Faculty - Department-wise analytics
		api.GET(
			"/departments",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Department analytics endpoint",
					"data":   nil,
				})
			},
		)

		// Admin & Faculty - Subject-wise analytics
		api.GET(
			"/subjects",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Subject analytics endpoint",
					"data":   nil,
				})
			},
		)

		// Admin only - Dashboard analytics
		api.GET(
			"/dashboard",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Analytics dashboard endpoint",
					"data":   nil,
				})
			},
		)
	}
}