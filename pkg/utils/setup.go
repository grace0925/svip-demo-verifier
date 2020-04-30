package utils

import (
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// used to serve react app in the static directory
type ReactHandler struct {
	StaticPath string // path to static directory
	IndexPath  string // path to index file within the static directory
	ClientPath string
}

type HyperledgerHandler struct {
	ClientPath string
	DistPath   string
	URLPrefix  string
}

func (h ReactHandler) ServeReactApp(w http.ResponseWriter, r *http.Request) {
	// get the absolute path
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		w.WriteHeader(400)
		return
	}

	path = filepath.Join(h.StaticPath, r.URL.Path)

	// check whether the files exist at given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.StaticPath, h.IndexPath))
		return
	} else if err != nil {
		// other errors, return 500 internal server error
		log.Error("error serving react app")
		w.WriteHeader(500)
		return
	}
	// otherwise, static file exists, serve static dir
	http.FileServer(http.Dir(h.StaticPath)).ServeHTTP(w, r)
}

func (h HyperledgerHandler) ServeHyperledgerAries(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	count := strings.Count(r.URL.Path, h.URLPrefix)
	if count == 2 {
		path = strings.TrimPrefix(r.URL.Path, h.URLPrefix)
	}

	path = filepath.Join(h.ClientPath, path)

	if !strings.Contains(r.URL.Path, ".wasm") {
		_, err := os.Stat(path)
		if err != nil {
			// other errors, return 500 internal server error
			log.Error("error serving react app")
			w.WriteHeader(500)
			return
		}
	}

	if count == 2 {
		log.Println("strip prefix")
		if strings.Contains(r.URL.Path, ".wasm") {
			log.Println("got wasm file")
			w.Header().Set("Content-Type", "application/wasm")
			w.Header().Add("Content-Encoding", "gzip")
			http.ServeFile(w, r, "client/node_modules/@hyperledger/aries-framework-go/dist/assets/aries-js-worker.wasm.gz")
		} else {
			http.StripPrefix(h.URLPrefix, http.FileServer(http.Dir(h.ClientPath))).ServeHTTP(w, r)
		}
	} else {
		http.FileServer(http.Dir(h.ClientPath)).ServeHTTP(w, r)
	}
}

// CommonMiddleware is common middleware handler for setting response header to handle CORS issues
func CommonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow_Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Requested-With, Cookie")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}
