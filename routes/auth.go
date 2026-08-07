package routes

import (


	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.Engine) {



	handler := auth.NewHandler()

	api := router.Group("/api")
	{
		api.POST("/login", handler.Login)
	}
}