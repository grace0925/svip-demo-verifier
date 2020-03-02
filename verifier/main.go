package main

import (
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {

	port := ":8081"
	tlsCert := os.Getenv("TLS_CERT")
	tlsKey := os.Getenv("TLS_KEY")

	log.WithFields(log.Fields{
		"Port": port,
	}).Info("Starting verifier")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/getVc", db.GetVC).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)
	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
