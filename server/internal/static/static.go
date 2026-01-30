package static

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// SPA returns an http.Handler that serves files from dir.
// Requests for paths that do not match a file are served index.html (SPA catch-all).
func SPA(dir string) (http.Handler, error) {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return nil, err
	}
	absPrefix := filepath.Clean(abs) + string(filepath.Separator)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}
		// Resolve within dir; reject path traversal
		clean := filepath.Clean(path)
		full := filepath.Join(abs, clean)
		absFull, err := filepath.Abs(full)
		if err != nil || (absFull != abs && !strings.HasPrefix(absFull, absPrefix)) {
			http.NotFound(w, r)
			return
		}
		full = absFull
		f, err := os.Open(full)
		if err != nil {
			if os.IsNotExist(err) {
				// SPA: serve index.html so client-side router can handle the route
				indexPath := filepath.Join(abs, "index.html")
				index, err := os.Open(indexPath)
				if err != nil {
					http.NotFound(w, r)
					return
				}
				defer index.Close()
				stat, _ := index.Stat()
				if stat != nil {
					http.ServeContent(w, r, "index.html", stat.ModTime(), index)
					return
				}
			}
			http.NotFound(w, r)
			return
		}
		defer f.Close()
		stat, err := f.Stat()
		if err != nil {
			http.NotFound(w, r)
			return
		}
		if stat.IsDir() {
			indexPath := filepath.Join(full, "index.html")
			index, err := os.Open(indexPath)
			if err != nil {
				http.NotFound(w, r)
				return
			}
			defer index.Close()
			istat, _ := index.Stat()
			if istat != nil {
				http.ServeContent(w, r, "index.html", istat.ModTime(), index)
				return
			}
			http.NotFound(w, r)
			return
		}
		http.ServeContent(w, r, stat.Name(), stat.ModTime(), f)
	}), nil
}
