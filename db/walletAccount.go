package db

import (
	"context"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
)

func StoreUserAccount(database *kivik.DB, newAccount WalletAccountDB) error {
	log.Info("Storing new account: " + newAccount.Username)
	_, err := database.Put(context.TODO(), newAccount.Username, newAccount)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func CheckDuplicateWalletAccount(database *kivik.DB, userName string) bool {
	row := database.Get(context.TODO(), userName)
	var account WalletAccountDB

	if err := row.ScanDoc(&account); err != nil {
		// account does not exist
		return false
	} else {
		// account exist
		return true
	}
}
