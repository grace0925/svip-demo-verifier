package vc

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
)

// call edge service to generate verifiable credential with user information and send vc back
func HandleCreateVC(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("ID")

	// fetch user information from user_info db
	fmt.Println("***fetching vc from database...")
	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	} else {
		fmt.Printf("%+v", userInfo)
	}

	client := &http.Client{}
	// calling edge service to generate credentials
	vc := GenerateVC(client, w, userInfo)
	log.Info(vc)
	// encode vc
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(vc)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	} else {
		w.WriteHeader(200)
	}
}
