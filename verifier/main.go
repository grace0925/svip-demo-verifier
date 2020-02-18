package main

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
	"sk-git.securekey.com/labs/svip-demo-verifier/wallet/db"
)

func main() {
	port := ":8081"
	tlsCert := "../keys/tls/localhost.crt"
	tlsKey := "../keys/tls/localhost.key"

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/getVc", db.GetVC).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)
	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
