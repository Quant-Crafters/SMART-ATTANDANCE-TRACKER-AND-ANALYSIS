package config

import "time"

// JWTConfig stores JWT configuration.
type JWTConfig struct {
	SecretKey string
	Expiry    time.Duration
}

// JWT holds the loaded JWT configuration.
var JWT JWTConfig

// LoadJWTConfig initializes JWT configuration.
func LoadJWTConfig() {
	JWT = JWTConfig{
		SecretKey: AppConfig.JWTSecret,
		Expiry:    72 * time.Hour,
	}
}