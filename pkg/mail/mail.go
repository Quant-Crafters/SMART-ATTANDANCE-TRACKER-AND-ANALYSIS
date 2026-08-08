package mail

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendEmail sends an email using SMTP configuration from environment variables.
func SendEmail(to string, subject string, body string) error {

	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	if host == "" || port == "" || username == "" || password == "" || from == "" {
		return fmt.Errorf("SMTP configuration is missing")
	}

	auth := smtp.PlainAuth(
		"",
		username,
		password,
		host,
	)

	message := []byte(
		"From: " + from + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=\"UTF-8\"\r\n" +
			"\r\n" +
			body + "\r\n",
	)

	address := host + ":" + port

	return smtp.SendMail(
		address,
		auth,
		from,
		[]string{to},
		message,
	)
}