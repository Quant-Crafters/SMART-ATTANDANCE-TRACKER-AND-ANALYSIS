package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

// Validate is the global validator instance.
var Validate = validator.New()

// ValidateStruct validates any struct using tags.
func ValidateStruct(data interface{}) error {
	err := Validate.Struct(data)
	if err != nil {
		return err
	}
	return nil
}

// FormatValidationError converts validation errors into readable messages.
func FormatValidationError(err error) map[string]string {

	errors := make(map[string]string)

	if validationErrors, ok := err.(validator.ValidationErrors); ok {

		for _, fieldError := range validationErrors {

			switch fieldError.Tag() {

			case "required":
				errors[fieldError.Field()] = fmt.Sprintf("%s is required", fieldError.Field())

			case "email":
				errors[fieldError.Field()] = "Invalid email format"

			case "min":
				errors[fieldError.Field()] = fmt.Sprintf("%s must be at least %s characters", fieldError.Field(), fieldError.Param())

			case "max":
				errors[fieldError.Field()] = fmt.Sprintf("%s must be at most %s characters", fieldError.Field(), fieldError.Param())

			default:
				errors[fieldError.Field()] = fieldError.Error()
			}
		}
	}

	return errors
}