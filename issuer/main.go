package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
)

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
	tlsCert := "../localhost.crt"
	tlsKey := "../localhost.key"

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // prevent CORS issues

	r.HandleFunc("/userInfo", db.HandleUserInfo).Methods("POST")
	r.HandleFunc("/userInfo/{id}", transferSession).Methods("GET")
	r.HandleFunc("/storeVC", db.StoreVC).Methods("POST")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
