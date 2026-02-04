package proxy

import (
	"io"
	"net/http"
	"net/url"

	"github.com/fridayflag/papaya/internal/auth"
)

// ReverseProxy proxies requests to the given target base URL.
// Prefix is stripped from the request path before forwarding (e.g. prefix "/db", path "/db/foo" -> "/foo").
// When proxying to /db, the papaya_token cookie value is passed as a Bearer token in the Authorization header.
func ReverseProxy(prefix, targetBaseURL string) (http.Handler, error) {
	base, err := url.Parse(targetBaseURL)
	if err != nil {
		return nil, err
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if len(path) < len(prefix) || path[:len(prefix)] != prefix {
			http.NotFound(w, r)
			return
		}
		suffix := path[len(prefix):]
		if suffix == "" {
			suffix = "/"
		} else if suffix[0] != '/' {
			suffix = "/" + suffix
		}
		target := base.ResolveReference(&url.URL{Path: suffix, RawQuery: r.URL.RawQuery})
		req, err := http.NewRequestWithContext(r.Context(), r.Method, target.String(), r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for k, v := range r.Header {
			req.Header[k] = v
		}
		// Extract papaya_token cookie and add as Bearer token header
		if cookie, err := r.Cookie(auth.CookieAccessToken); err == nil && cookie != nil && cookie.Value != "" {
			req.Header.Set("Authorization", "Bearer "+cookie.Value)
		}
		req.Host = target.Host
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()
		for k, v := range resp.Header {
			w.Header()[k] = v
		}
		w.WriteHeader(resp.StatusCode)
		_, _ = io.Copy(w, resp.Body)
	}), nil
}
