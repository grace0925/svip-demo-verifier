package main

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
)

func main() {
	port := ":8081"
	tlsCert := "../keys/tls/localhost.crt"
	tlsKey := "../keys/tls/localhost.key"

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // prevent CORS issues

	r.HandleFunc("/getVC", db.GetVC).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)
	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
