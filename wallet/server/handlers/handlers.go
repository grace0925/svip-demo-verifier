package handlers

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/did"
	"strings"
)

func CreateWalletAccountHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("creating wallet account")

	var newAccount db.AccountDB
	if err := json.NewDecoder(r.Body).Decode(&newAccount); err != nil {
		log.Error("failed to decode ", err)
		http.Error(w, err.Error(), 400)
		return
	}

	err := auth.CreateAccount(newAccount, db.WALLETACCOUNT)
	if err != nil {
		if err.Error() == "Account exists" {
			w.WriteHeader(200)
			w.Write([]byte("Account exists"))
		} else {
			log.Error("failed to create account ", err)
			http.Error(w, err.Error(), 500)
			return
		}
	} else {
		log.Println("wallet account created")
	}

	dbName := db.WALLETDBPREFIX + newAccount.Username
	walletDB := db.StartDB(dbName)

	didString, err := did.GenerateDID()
	if err != nil {
		log.Error("failed to generate wallet did", err)
		http.Error(w, err.Error(), 500)
		return
	}
	log.Println("created wallet did => ", didString)

	err = db.StoreWalletDID(didString, walletDB)
	if err != nil {
		log.Error("error storing wallet did in db", err)
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("log in handler")

	var accountInfo db.AccountDB
	if err := json.NewDecoder(r.Body).Decode(&accountInfo); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	// validate username and password
	if err := auth.ValidateCred(accountInfo, db.WALLETACCOUNT); err != nil {
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
		Name:  "wallet_token",
		Value: jwtString,
	})
	w.WriteHeader(200)

}

func StoreVCHandler(w http.ResponseWriter, r *http.Request) {
	var PRVC db.PermanentResidentCardDB
	err := json.NewDecoder(r.Body).Decode(&PRVC)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
		return
	} else {
		fmt.Printf("got vc %+v", PRVC)
	}

	reqToken := r.Header.Get("Authorization")
	splitToken := strings.Split(reqToken, "Bearer")
	reqToken = splitToken[1]
	fmt.Println("reqToken => ", reqToken)

	username := ""
	// validate cookie string and parse jwt token
	if reqToken == "" {
		log.Error("Invalid token")
		http.Error(w, "Invalid token", 500)
	} else {
		// parse token
		parsedToken, err := auth.ParseToken(reqToken)
		if err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 400)
		}
		// obtain username value from token
		username, err = auth.GetTokenField(auth.TOKEN_USERNAME, parsedToken)
		if err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 400)
		}
	}

	if err = db.StoreVC(PRVC, username); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	w.WriteHeader(200)
}

func GetVCHandler(w http.ResponseWriter, r *http.Request) {
	token := r.FormValue("token")
	log.Info(token)

	// obtain username value from token string
	parsedToken, err := auth.ParseToken(token)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	username, err := auth.GetTokenField(auth.TOKEN_USERNAME, parsedToken)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	dbName := db.WALLETDBPREFIX + username
	// fetch vc from db
	walletDb := db.StartDB(dbName)
	VCs, err := db.FetchAllWalletInfo(walletDb)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(VCs)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	w.WriteHeader(200)
}
