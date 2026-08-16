package ai

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
)

// Client is an HTTP client for communicating with the FastAPI AI Engine.
type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewClient creates a new instance of the AI engine client.
func NewClient() *Client {
	baseURL := strings.TrimRight(config.AppConfig.AIEngineURL, "/")
	if baseURL == "" {
		baseURL = "http://localhost:8000"
	}
	return &Client{
		baseURL: baseURL,
		apiKey:  config.AppConfig.AIEngineAPIKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// sendRequest executes an HTTP request to the AI Engine and decodes the response.
func (c *Client) sendRequest(req *http.Request, target interface{}) error {
	if c.apiKey != "" {
		req.Header.Set("X-API-Key", c.apiKey)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("AI engine service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errResp struct {
			Detail interface{} `json:"detail"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		if errResp.Detail != nil {
			return fmt.Errorf("AI engine error (%d): %v", resp.StatusCode, errResp.Detail)
		}
		return fmt.Errorf("AI engine returned status code %d", resp.StatusCode)
	}

	if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
		return fmt.Errorf("failed to decode AI engine response: %w", err)
	}
	return nil
}

// PredictStudent calls the AI prediction endpoint for a given student.
func (c *Client) PredictStudent(studentID string) (*PredictionResponse, error) {
	reqURL := fmt.Sprintf("%s/api/v1/predict/student/%s", c.baseURL, url.PathEscape(studentID))
	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, err
	}

	var res PredictionResponse
	if err := c.sendRequest(req, &res); err != nil {
		return nil, err
	}
	return &res, nil
}

// GetStudentPatterns calls the AI pattern analysis endpoint for a given student.
func (c *Client) GetStudentPatterns(studentID string) (*PatternResponse, error) {
	reqURL := fmt.Sprintf("%s/api/v1/analytics/patterns/student/%s", c.baseURL, url.PathEscape(studentID))
	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, err
	}

	var res PatternResponse
	if err := c.sendRequest(req, &res); err != nil {
		return nil, err
	}
	return &res, nil
}

// GetStudentAlerts calls the AI smart alerts endpoint for a given student.
func (c *Client) GetStudentAlerts(studentID string) (*AlertsResponse, error) {
	reqURL := fmt.Sprintf("%s/api/v1/insights/alerts/student/%s", c.baseURL, url.PathEscape(studentID))
	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, err
	}

	var res AlertsResponse
	if err := c.sendRequest(req, &res); err != nil {
		return nil, err
	}
	return &res, nil
}

// GetFacultyAnalytics calls the AI faculty classroom analytics endpoint for a given faculty member.
func (c *Client) GetFacultyAnalytics(facultyID string) (*FacultyAnalyticsResponse, error) {
	reqURL := fmt.Sprintf("%s/api/v1/analytics/faculty/%s", c.baseURL, url.PathEscape(facultyID))
	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, err
	}

	var res FacultyAnalyticsResponse
	if err := c.sendRequest(req, &res); err != nil {
		return nil, err
	}
	return &res, nil
}

// GenerateStudentReport triggers student PDF or Excel report generation via the AI engine.
func (c *Client) GenerateStudentReport(studentID string, formatType string) (*ReportResponse, error) {
	if formatType == "" {
		formatType = "PDF"
	}
	reqURL := fmt.Sprintf("%s/api/v1/reports/student/%s?format_type=%s", c.baseURL, url.PathEscape(studentID), url.QueryEscape(formatType))
	req, err := http.NewRequest(http.MethodPost, reqURL, nil)
	if err != nil {
		return nil, err
	}

	var res ReportResponse
	if err := c.sendRequest(req, &res); err != nil {
		return nil, err
	}
	return &res, nil
}
