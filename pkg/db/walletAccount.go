package db

import (
	"context"
	"fmt"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ed25519"
)

func StoreUserAccount(database *kivik.DB, newAccount AccountDB) error {
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

func GetPrivateKey(didString string, dbName string) (ed25519.PrivateKey, error) {
	database := StartDB(dbName)

	query := map[string]interface{}{
		"selector": map[string]interface{}{
			"did": map[string]interface{}{
				"$eq": didString,
			},
		},
	}
	rows, err := database.Find(context.TODO(), query)
	if err != nil {
		log.Error("error retrieving rows from db ", err)
		return nil, err
	}

	var doc AccountDB
	for rows.Next() {
		if err := rows.ScanDoc(&doc); err != nil {
			log.Error(err)
		}
		log.Printf("doc %+v", doc)
	}
	if rows.Err() != nil {
		log.Error("error scan doc ", rows.Err())
		return nil, rows.Err()
	}
	return doc.PrivateKey, nil
}
