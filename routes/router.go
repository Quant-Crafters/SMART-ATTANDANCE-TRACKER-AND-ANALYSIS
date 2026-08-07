package routes

import (


	"github.com/gin-gonic/gin"
)

func SetupRouter(router *gin.Engine) {



	RegisterAuthRoutes(router)
}