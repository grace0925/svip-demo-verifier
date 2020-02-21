package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/issuer/server/vc"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
)

// query and send user information using on url encoded session id
func HandleTransferSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	} else {
		fmt.Printf("%+v", userInfo)
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(userInfo)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	} else {
		w.WriteHeader(200)
	}
}

func init() {
	log.SetOutput(os.Stdout)
}

func main() {

	port := ":8080"
	tlsCert := "../keys/tls/localhost.crt"
	tlsKey := "../keys/tls/localhost.key"

	log.WithFields(log.Fields{
		"Port": port,
	}).Info("Starting issuer")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeUserInfo", db.HandleStoreUserInfo).Methods("POST")
	r.HandleFunc("/createVC", vc.HandleCreateVC).Methods("GET")
	r.HandleFunc("/userInfo/{id}", HandleTransferSession).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
