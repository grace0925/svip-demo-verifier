package handlers

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/verifier/server/vcRest"
)

func VerifyVCHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("----- verify VC handler")

	client := &http.Client{}

	var vc interface{}
	if err := json.NewDecoder(r.Body).Decode(&vc); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	fmt.Printf("%+v", vc)

	if err := vcRest.GenerateProfile(client); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	verified, err := vcRest.VerifyVC(client, vc)
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

func CreateVerifierAccountHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("creating verifier account")
	auth.CreateAccount(w, r, db.VERIFIERACCOUNT)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("login handler")
	var accountInfo db.AccountDB
	if err := json.NewDecoder(r.Body).Decode(&accountInfo); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	// validate username and password
	if err := auth.ValidateCred(accountInfo, db.VERIFIERACCOUNT); err != nil {
		w.WriteHeader(200)
		_, _ = w.Write([]byte(err.Error()))
	}

	// create jwt token string
	jwtString, err := auth.CreateToken(accountInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	// set cookie
	http.SetCookie(w, &http.Cookie{
		Name:  "verifier_token",
		Value: jwtString,
	})
	w.WriteHeader(200)
}
