package main

import (
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/utils"
	handler "sk-git.securekey.com/labs/svip-demo-verifier/wallet/server"

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

	r.HandleFunc("/storeVC", handler.StoreVCHandler).Methods("POST")
	r.HandleFunc("/createAccount", handler.CreateWalletAccountHandler).Methods("POST")
	r.HandleFunc("/login", handler.LoginHandler).Methods("POST")
	r.HandleFunc("/getVc", handler.GetVCHandler).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))

}
