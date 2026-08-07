package main

import (
	"log"
	"net/http"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/database"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/routes"
	"github.com/gin-gonic/gin"
)

func main() {

	// Load environment variables
	config.LoadConfig()
	config.LoadJWTConfig()

	// Connect Database
	config.ConnectDatabase()

	// Run Database Migrations
	database.Migrate()

	// Create Gin router
	router := gin.Default()

	// Health Check Route
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "AttendSmart Backend is Running 🚀",
		})
	})

	// Register all application routes
	routes.SetupRouter(router)

	// Start Server
	log.Println("🚀 Server started at http://localhost:8080")

	err := router.Run(":8080")
	if err != nil {
		log.Fatal("Failed to start server:", err)
	}
}