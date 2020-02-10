package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sk-git.securekey.com/labs/svip-demo-verifier/issuer/db"
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

func transferSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	userdb := db.StartUserDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
	} else {
		fmt.Printf("%+v", userInfo)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userInfo)
	w.WriteHeader(200)
}

func main() {

	//framework.Framework()

	port := ":8080"
	tlsCert := "localhost.crt"
	tlsKey := "localhost.key"

	r := mux.NewRouter()
	r.Use(CommonMiddleware) // prevent CORS issues

	r.HandleFunc("/userInfo", db.HandleUserInfo).Methods("POST")
	r.HandleFunc("/userInfo/{id}", transferSession).Methods("GET")
	r.HandleFunc("/storeVC", db.StoreVC).Methods("POST")

	react := reactHandler{staticPath: "./issuer/client/build", indexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
