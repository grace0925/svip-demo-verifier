package main

import (
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	handler "sk-git.securekey.com/labs/svip-demo-verifier/issuer/server/handlers"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {

	port := ":8080"
	tlsCert := os.Getenv("TLS_CERT")
	tlsKey := os.Getenv("TLS_KEY")

	log.Info("Starting issuer web app on port :8080")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeUserInfo", handler.HandleStoreUserInfo).Methods("POST")
	r.HandleFunc("/createVC", handler.HandleCreateVC).Methods("GET")
	r.HandleFunc("/userInfo/{id}", handler.HandleTransferSession).Methods("GET")
	r.HandleFunc("/createAccount", handler.HandleCreateIssuerAccount).Methods("POST")
	r.HandleFunc("/login", handler.LoginHandler).Methods("POST")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
