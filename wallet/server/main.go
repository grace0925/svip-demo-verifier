package main

import (
	"log"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
	"sk-git.securekey.com/labs/svip-demo-verifier/wallet/db"

	"github.com/gorilla/mux"
)

func main() {
	port := ":8082"
	tlsCert := "../../keys/tls/localhost.crt"
	tlsKey := "../../keys/tls/localhost.key"

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeVC", db.StoreVC).Methods("POST")

	react := utils.ReactHandler{StaticPath: "../client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))

}
