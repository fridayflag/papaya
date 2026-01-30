package api

import (
	"errors"
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/fridayflag/papaya/internal/env"
)

var errUnauthorized = errors.New("unauthorized")

// validateCouchDBCredentials checks username/password against CouchDB _session.
func validateCouchDBCredentials(cfg *env.Config, username, password string) error {
	baseURL := cfg.CouchDBBaseURL()
	url := baseURL + "/_session"
	body, _ := json.Marshal(map[string]string{"name": username, "password": password})
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errUnauthorized
	}
	var out struct {
		OK *bool `json:"ok"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&out)
	if out.OK != nil && !*out.OK {
		return errUnauthorized
	}
	return nil
}
