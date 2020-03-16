package main

import (
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
	"sk-git.securekey.com/labs/svip-demo-verifier/wallet/server/handlers"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {
	port := ":8082"
	tlsCert := os.Getenv("TLS_CERT")
	tlsKey := os.Getenv("TLS_KEY")

	log.WithFields(log.Fields{
		"Port": port,
	}).Info("Starting wallet")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeVC", handlers.StoreVCHandler).Methods("POST")
	r.HandleFunc("/createAccount", handlers.CreateWalletAccountHandler).Methods("POST")
	r.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/getVc", handlers.GetVCHandler).Methods("GET")
	r.HandleFunc("/verifyVC", handlers.VerifyVCHandler).Methods("POST")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))

}
