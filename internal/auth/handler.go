package auth

import (
	"net/http"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/response"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/validator"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler creates a new auth handler.
func NewHandler() *Handler {
	return &Handler{
		service: NewService(),
	}
}

// Login handles user login.
func (h *Handler) Login(c *gin.Context) {

	var req LoginRequest

	// Read JSON body
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if err := validator.ValidateStruct(req); err != nil {
		response.ValidationError(c, validator.FormatValidationError(err))
		return
	}

	// Login
	res, err := h.service.Login(req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, "Login successful", res)
}

// Register handles new user registration.
func (h *Handler) Register(c *gin.Context) {

	var req RegisterRequest

	// Read JSON body.
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid request body",
		)
		return
	}

	// Validate request.
	if err := validator.ValidateStruct(req); err != nil {
		response.ValidationError(
			c,
			validator.FormatValidationError(err),
		)
		return
	}

	// Register user.
	user, err := h.service.Register(req)
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	response.Success(
		c,
		"User registered successfully",
		user,
	)
}
// CreateFacultyUser handles creation of a faculty login account.
// This endpoint is intended for admin use.
func (h *Handler) CreateFacultyUser(c *gin.Context) {

	var req struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"Invalid faculty account data",
		)
		return
	}

	user, err := h.service.CreateFacultyUser(
		req.Name,
		req.Email,
		req.Password,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	response.Created(
		c,
		"Faculty login account created successfully",
		user,
	)
}