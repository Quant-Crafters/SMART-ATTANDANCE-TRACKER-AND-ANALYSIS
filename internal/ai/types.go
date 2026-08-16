package ai

// PredictionResponse represents the output from AI prediction endpoints.
type PredictionResponse struct {
	Success     bool                   `json:"success"`
	Prediction  map[string]interface{} `json:"prediction"`
	Explanation map[string]interface{} `json:"explanation"`
	Features    map[string]interface{} `json:"features"`
	Message     string                 `json:"message,omitempty"`
}

// PatternResponse represents the output from AI pattern analysis endpoints.
type PatternResponse struct {
	Success   bool                   `json:"success"`
	StudentID string                 `json:"student_id"`
	Patterns  map[string]interface{} `json:"patterns"`
	Message   string                 `json:"message,omitempty"`
}

// AlertsResponse represents dynamic dashboard alerts and insights from AI.
type AlertsResponse struct {
	Success       bool                     `json:"success"`
	StudentID     string                   `json:"student_id"`
	AlertsCount   int                      `json:"alerts_count"`
	Alerts        []map[string]interface{} `json:"alerts"`
	InsightsCount int                      `json:"insights_count"`
	Insights      []map[string]interface{} `json:"insights"`
	Message       string                   `json:"message,omitempty"`
}

// FacultyAnalyticsResponse represents classroom analytics from AI.
type FacultyAnalyticsResponse struct {
	Success   bool                   `json:"success"`
	FacultyID string                 `json:"faculty_id"`
	Status    string                 `json:"status,omitempty"`
	Message   string                 `json:"message,omitempty"`
	Analytics map[string]interface{} `json:"analytics"`
}

// ReportResponse represents report metadata output from AI.
type ReportResponse struct {
	Success bool                   `json:"success"`
	Report  map[string]interface{} `json:"report"`
	Message string                 `json:"message,omitempty"`
}
