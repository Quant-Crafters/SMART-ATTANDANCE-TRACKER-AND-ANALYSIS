package notification

import (
	"errors"
	"strings"
)

// Service handles notification business logic.
type Service struct {
	repository *Repository
}

// NewService creates a new notification service.
func NewService() *Service {
	return &Service{
		repository: NewRepository(),
	}
}

// CreateNotification creates a new notification.
func (s *Service) CreateNotification(
	req CreateNotificationRequest,
) (*Notification, error) {

	title := strings.TrimSpace(req.Title)
	message := strings.TrimSpace(req.Message)

	if title == "" {
		return nil, errors.New("notification title is required")
	}

	if message == "" {
		return nil, errors.New("notification message is required")
	}

	notification := &Notification{
		UserID:  req.UserID,
		Title:   title,
		Message: message,
		Type:    strings.TrimSpace(req.Type),
		IsRead:  false,
	}

	if err := s.repository.Create(notification); err != nil {
		return nil, err
	}

	return notification, nil
}

// GetNotifications returns all notifications.
func (s *Service) GetNotifications() ([]Notification, error) {
	return s.repository.GetAll()
}

// GetNotificationByID returns a notification by ID.
func (s *Service) GetNotificationByID(
	id uint,
) (*Notification, error) {
	return s.repository.GetByID(id)
}

// MarkAsRead marks a notification as read.
func (s *Service) MarkAsRead(
	id uint,
) (*Notification, error) {

	notification, err := s.repository.GetByID(id)
	if err != nil {
		return nil, err
	}

	if notification == nil {
		return nil, errors.New("notification not found")
	}

	notification.IsRead = true

	if err := s.repository.Update(notification); err != nil {
		return nil, err
	}

	return notification, nil
}

// DeleteNotification deletes a notification.
func (s *Service) DeleteNotification(id uint) error {

	notification, err := s.repository.GetByID(id)
	if err != nil {
		return err
	}

	if notification == nil {
		return errors.New("notification not found")
	}

	return s.repository.Delete(notification)
}