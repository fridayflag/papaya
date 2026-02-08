package api

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/fridayflag/papaya/internal/env"
)

var errUnauthorized = errors.New("unauthorized")

const userDocPrefix = "org.couchdb.user:"

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

// adminCouchDBRequest performs an HTTP request to CouchDB with Basic auth and returns the response.
// Caller must close resp.Body.
func adminCouchDBRequest(cfg *env.Config, username, password, method, path string, body io.Reader) (*http.Response, error) {
	baseURL := cfg.CouchDBBaseURL()
	url := strings.TrimSuffix(baseURL, "/") + path
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(username+":"+password)))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// couchDBRootResponse is the JSON from GET / on CouchDB.
type couchDBRootResponse struct {
	Vendor struct {
		Name string `json:"name"`
	} `json:"vendor"`
}

// couchPerUserConfig is the response from GET /_node/_local/_config/couch_peruser.
// CouchDB config API returns all values as strings (e.g. "true" / "false").
type couchPerUserConfig struct {
	Enable string `json:"enable"`
}

// adminDBStatus fetches server root and optional config to determine managed vs external and couch_peruser.
func adminDBStatus(cfg *env.Config, username, password string) (managed bool, couchPerUserEnabled *bool, err error) {
	resp, err := adminCouchDBRequest(cfg, username, password, http.MethodGet, "/", nil)
	if err != nil {
		return false, nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return false, nil, errUnauthorized
	}
	var root couchDBRootResponse
	if err := json.NewDecoder(resp.Body).Decode(&root); err != nil {
		return false, nil, err
	}
	managed = cfg.DatabaseVendor != "" && root.Vendor.Name == cfg.DatabaseVendor

	// Try to read couch_peruser config (admin only); GET /_node/_local/_config/couch_peruser returns { "enable": "true"|"false" }.
	resp2, err := adminCouchDBRequest(cfg, username, password, http.MethodGet, "/_node/_local/_config/couch_peruser", nil)
	if err != nil {
		return managed, nil, nil
	}
	defer resp2.Body.Close()
	if resp2.StatusCode == http.StatusOK {
		var section couchPerUserConfig
		if json.NewDecoder(resp2.Body).Decode(&section) == nil {
			enabled := strings.EqualFold(section.Enable, "true")
			couchPerUserEnabled = &enabled
		}
	}
	return managed, couchPerUserEnabled, nil
}

// couchDBUserDoc is a document in _users (we only marshal the fields we need).
type couchDBUserDoc struct {
	ID       string   `json:"_id,omitempty"`
	Rev      string   `json:"_rev,omitempty"`
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Roles    []string `json:"roles,omitempty"`
	Password string   `json:"password,omitempty"`
}

// adminListUsers returns all user docs from _users (admin auth required).
func adminListUsers(cfg *env.Config, username, password string) ([]couchDBUserDoc, error) {
	resp, err := adminCouchDBRequest(cfg, username, password, http.MethodGet, "/_users/_all_docs?include_docs=true", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("couchdb: list users: %s", resp.Status)
	}
	var out struct {
		Rows []struct {
			ID    string         `json:"id"`
			Doc   *couchDBUserDoc `json:"doc,omitempty"`
		} `json:"rows"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	var users []couchDBUserDoc
	for _, row := range out.Rows {
		if !strings.HasPrefix(row.ID, userDocPrefix) || strings.HasPrefix(row.ID, "_design") {
			continue
		}
		if row.Doc != nil {
			users = append(users, *row.Doc)
		}
	}
	return users, nil
}

// adminGetUser fetches one user doc by username. Returns nil doc if not found.
func adminGetUser(cfg *env.Config, adminUser, adminPass, targetUsername string) (*couchDBUserDoc, error) {
	docID := userDocPrefix + targetUsername
	resp, err := adminCouchDBRequest(cfg, adminUser, adminPass, http.MethodGet, "/_users/" + pathEscape(docID), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("couchdb: get user: %s", resp.Status)
	}
	var doc couchDBUserDoc
	if err := json.NewDecoder(resp.Body).Decode(&doc); err != nil {
		return nil, err
	}
	return &doc, nil
}

// adminPutUser creates or updates a user in _users. For create, password is required. For update, password can be empty to leave unchanged.
func adminPutUser(cfg *env.Config, adminUser, adminPass, targetUsername, password string, roles []string) (rev string, created bool, err error) {
	docID := userDocPrefix + targetUsername
	existing, err := adminGetUser(cfg, adminUser, adminPass, targetUsername)
	if err != nil {
		return "", false, err
	}
	doc := couchDBUserDoc{
		Name:  targetUsername,
		Type:  "user",
		Roles: roles,
	}
	if existing != nil {
		doc.ID = existing.ID
		doc.Rev = existing.Rev
		if password != "" {
			doc.Password = password
		}
	} else {
		doc.ID = docID
		if password == "" {
			return "", false, errors.New("password required when creating user")
		}
		doc.Password = password
	}
	body, _ := json.Marshal(doc)
	resp, err := adminCouchDBRequest(cfg, adminUser, adminPass, http.MethodPut, "/_users/"+pathEscape(docID), bytes.NewReader(body))
	if err != nil {
		return "", false, err
	}
	defer resp.Body.Close()
	var result struct {
		OK  bool   `json:"ok"`
		Rev string `json:"rev"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&result)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", false, fmt.Errorf("couchdb: put user: %s", resp.Status)
	}
	return result.Rev, existing == nil, nil
}

// adminDeleteUser removes a user from _users.
func adminDeleteUser(cfg *env.Config, adminUser, adminPass, targetUsername string) error {
	doc, err := adminGetUser(cfg, adminUser, adminPass, targetUsername)
	if err != nil {
		return err
	}
	if doc == nil {
		return fmt.Errorf("user not found: %s", targetUsername)
	}
	path := "/_users/" + pathEscape(doc.ID) + "?rev=" + url.QueryEscape(doc.Rev)
	resp, err := adminCouchDBRequest(cfg, adminUser, adminPass, http.MethodDelete, path, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("couchdb: delete user: %s", resp.Status)
	}
	return nil
}

func pathEscape(s string) string {
	// CouchDB doc IDs in path: escape like path segment (PathEscape), then ensure + is encoded
	return strings.ReplaceAll(url.PathEscape(s), "+", "%2B")
}
