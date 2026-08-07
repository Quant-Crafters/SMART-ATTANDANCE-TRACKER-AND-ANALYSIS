package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Success returns HTTP 200
func Success(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// Created returns HTTP 201
func Created(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// Error returns any custom error
func Error(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"message": message,
	})
}

// ValidationError returns validation errors
func ValidationError(c *gin.Context, errors interface{}) {
	c.JSON(http.StatusBadRequest, gin.H{
		"success": false,
		"errors":  errors,
	})
}

// Unauthorized returns HTTP 401
func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"success": false,
		"message": message,
	})
}