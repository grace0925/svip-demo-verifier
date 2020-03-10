package auth

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
)

func CreateAccount(w http.ResponseWriter, r *http.Request, dbName string) {
	var newAccount db.AccountDB
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
	database := db.StartDB(dbName)

	// check if user already exists
	if exist := db.CheckDuplicateWalletAccount(database, newAccount.Username); exist {
		log.Info("Account exists")
		w.WriteHeader(200)
		w.Write([]byte("Account exists"))
	} else {
		// store in db
		if err := db.StoreUserAccount(database, newAccount); err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 500)
			return
		}
	}
}

func ValidateCred(accountInfo db.AccountDB, dbName string) error {

	database := db.StartDB(dbName)
	accountDB, err := db.GetAccount(database, accountInfo.Username)
	if err != nil {
		// account does not exist in database, user does not exist
		return err
	} else {
		// check whether password is correct
		if err := bcrypt.CompareHashAndPassword([]byte(accountDB.Password), []byte(accountInfo.Password)); err != nil {
			// passwords do not match
			return err
		} else {
			// passwords match
			return nil
		}

	}
}
