package main

import (
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
	auth "sk-git.securekey.com/labs/svip-demo-verifier/wallet/server/authentication"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {
	port := ":8082"
	tlsCert := "../../keys/tls/localhost.crt"
	tlsKey := "../../keys/tls/localhost.key"

	log.WithFields(log.Fields{
		"Port": port,
	}).Info("Starting wallet")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeVC", db.StoreVC).Methods("POST")
	r.HandleFunc("/createAccount", auth.CreateWalletAccountHandler).Methods("POST")

	react := utils.ReactHandler{StaticPath: "../client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))

}
