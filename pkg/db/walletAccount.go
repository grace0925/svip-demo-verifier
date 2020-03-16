package db

import (
	"context"
	"fmt"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
)

func StoreUserAccount(database *kivik.DB, newAccount AccountDB) error {
	log.Info("Storing new account: " + newAccount.Username)
	fmt.Printf("%+v", newAccount)
	_, err := database.Put(context.TODO(), newAccount.Username, newAccount)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func CheckDuplicateWalletAccount(database *kivik.DB, userName string) bool {
	row := database.Get(context.TODO(), userName)
	var account AccountDB

	if err := row.ScanDoc(&account); err != nil {
		// account does not exist
		return false
	} else {
		// account exist
		return true
	}
}

func GetAccount(database *kivik.DB, userName string) (AccountDB, error) {
	row := database.Get(context.TODO(), userName)
	var account AccountDB

	if err := row.ScanDoc(&account); err != nil {
		return account, err
	} else {
		return account, nil
	}
}
