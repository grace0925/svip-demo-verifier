package db

import (
	"context"
	"errors"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
)

func StoreVC(PRVC VerifiableCredentialDB, username string) error {

	dbName := ""
	if username == "" {
		log.Error("Empty username")
		return errors.New("Empty username")
	} else {
		dbName = WALLETDBPREFIX + username
	}

	// check if credential has friendly name
	if PRVC.FriendlyName == "" {
		log.Error("Invalid credential")
		return errors.New("invalid credential")
	}

	walletDb := StartDB(dbName)
	walletInfo, er := FetchWalletInfo(walletDb, PRVC.FriendlyName)

	// update entry if it already exists
	if er == nil {
		PRVC.Rev = walletInfo.Rev
		_, err := walletDb.Put(context.TODO(), PRVC.FriendlyName, PRVC)
		if err != nil {
			log.Error(err)
			return err
		}
	} else {
		// create new entry in db
		_, err := walletDb.Put(context.TODO(), PRVC.FriendlyName, PRVC)
		if err != nil {
			log.Error(err)
			return err
		}
	}
	return nil
}

// fetch wallet information
func FetchWalletInfo(db *kivik.DB, VCid string) (VerifiableCredentialDB, error) {
	// query with user lprNumber
	row := db.Get(context.TODO(), VCid)
	var Vc VerifiableCredentialDB

	if err := row.ScanDoc(&Vc); err != nil {
		// entry does not exist in db, return error
		return Vc, err
	} else {
		// entry with given id already exists in db, return fetched document
		return Vc, nil
	}
}

// fetch every doc in db
func FetchAllWalletInfo(db *kivik.DB) ([]VerifiableCredentialDB, error) {
	var VCs []VerifiableCredentialDB

	rows, err := db.AllDocs(context.TODO(), kivik.Options{"include_docs": true})
	if err != nil {
		log.Info("a")
		return VCs, err
	}

	var VC VerifiableCredentialDB
	for rows.Next() {
		if err := rows.ScanDoc(&VC); err != nil {
			log.Info("b")
			return VCs, err
		} else if VC.FriendlyName != "" {
			VCs = append(VCs, VC)
		}
	}
	if rows.Err() != nil {
		log.Info("c")
		return VCs, rows.Err()
	}

	return VCs, nil
}

func StoreWalletDID(didString string, dbName string) error {
	db := StartDB(dbName)
	if didString == "" {
		log.Error("can not store empty did string")
		return errors.New("can not store empty did string")
	}

	didEntry := map[string]interface{}{
		"did": didString,
	}

	_, err := db.Put(context.TODO(), "DID", didEntry)
	if err != nil {
		log.Error("error storing did", err)
		return err
	}
	return nil
}
