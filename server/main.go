package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
)

// used to serve react app in the static directory
type reactHandler struct {
	staticPath string // path to static directory
	indexPath  string // path to index file within the static directory
}

func (h reactHandler) ServeReactApp(w http.ResponseWriter, r *http.Request) {
	// get the absolute path
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	// prepend the abs path with the path to static directory
	path = filepath.Join(h.staticPath, path) // ../client/build
	// check whether the files exist at given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// other errors, return 500 internal server error
		w.WriteHeader(500)
		return
	}
	// otherwise, static file exists, serve static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

// common middleware handler for setting response header to handle CORS issues
func commonMiddleware(next http.Handler) http.Handler {
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

func IssueCred(w http.ResponseWriter, r *http.Request) {
	fmt.Println("issuing verifiable credential...")

}

func main() {
	port := ":8080"
	r := mux.NewRouter()

	r.Use(commonMiddleware) // prevent CORS issues maybe...

	react := reactHandler{staticPath: "../client/build", indexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	r.HandleFunc("/issueCred", IssueCred).Methods("POST")

	log.Fatal(http.ListenAndServe(port, r))
}
