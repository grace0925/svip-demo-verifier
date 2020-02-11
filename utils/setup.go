package utils

import (
	"net/http"
	"os"
	"path/filepath"
)

// used to serve react app in the static directory
type ReactHandler struct {
	StaticPath string // path to static directory
	IndexPath  string // path to index file within the static directory
}

func (h ReactHandler) ServeReactApp(w http.ResponseWriter, r *http.Request) {
	// get the absolute path
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	// prepend the abs path with the path to static directory
	path = filepath.Join(h.StaticPath, path) // ../client/build
	// check whether the files exist at given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.StaticPath, h.IndexPath))
		return
	} else if err != nil {
		// other errors, return 500 internal server error
		w.WriteHeader(500)
		return
	}
	// otherwise, static file exists, serve static dir
	http.FileServer(http.Dir(h.StaticPath)).ServeHTTP(w, r)
}

// CommonMiddleware is common middleware handler for setting response header to handle CORS issues
func CommonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow_Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}
