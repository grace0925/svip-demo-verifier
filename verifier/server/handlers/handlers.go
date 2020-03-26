package handlers

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/vc"
)

func VerifyVCHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("----- verify VC handler")

	client := &http.Client{}

	var cred interface{}
	if err := json.NewDecoder(r.Body).Decode(&cred); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	fmt.Printf("%+v", cred)

	if _, err := vc.GenerateProfile(client, "tsa"); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	verified, err := vc.VerifyVC(client, cred)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	if err = json.NewEncoder(w).Encode(verified); err != nil {
		log.Error(err)
	}
}
