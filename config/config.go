package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config stores all application configuration.
type Config struct {
	AppName    string
	AppEnv     string
	AppHost    string
	AppPort    string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	JWTSecret  string
}

// AppConfig holds the loaded configuration.
var AppConfig Config

// LoadConfig loads environment variables from the .env file.
func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found. Using system environment variables.")
	}

	AppConfig = Config{
		AppName:    getEnv("APP_NAME", "AttendSmart"),
		AppEnv:     getEnv("APP_ENV", "development"),
		AppHost:    getEnv("APP_HOST", "localhost"),
		AppPort:    getEnv("APP_PORT", "8080"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "attendsmart"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret: getEnv("JWT_SECRET", "change-this-secret"),
	}
}

// getEnv returns the value of an environment variable,
// or a default value if it's not set.
func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
