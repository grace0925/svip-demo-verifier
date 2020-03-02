package authentication

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
)

func CreateWalletAccountHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("creating wallet account")
	// receive info from front end
	var newAccount db.WalletAccountDB
	if err := json.NewDecoder(r.Body).Decode(&newAccount); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	// bcrypt password
	pass, err := bcrypt.GenerateFromPassword([]byte(newAccount.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	newAccount.Password = string(pass)

	// start wallet account db
	database := db.StartDB(db.WALLETACCOUNT)

	// check if user already exists
	if exist := db.CheckDuplicateWalletAccount(database, newAccount.Username); exist {
		log.Info("Account exists")
		w.WriteHeader(200)
		if _, err := w.Write([]byte("Wallet account exists")); err != nil {
			log.Error(err)
		}
	} else {
		// store in db
		if err := db.StoreUserAccount(database, newAccount); err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 500)
			return
		}
	}

}
