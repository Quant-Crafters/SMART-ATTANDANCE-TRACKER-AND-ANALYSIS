package routes

import (
	"net/http"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.Engine) {

	handler := auth.NewHandler()

	api := router.Group("/api")
	{
		// Public Route
		api.POST("/login", handler.Login)

		// Protected Route
		api.GET("/profile", middleware.AuthMiddleware(), func(c *gin.Context) {

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"user_id": c.GetUint("user_id"),
				"email":   c.GetString("email"),
				"role":    c.GetString("role"),
			})
		})

		// Admin Only Route
		api.GET(
			"/admin",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			func(c *gin.Context) {

				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Welcome Admin 🚀",
				})
			},
		)
	}
}