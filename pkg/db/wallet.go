package db

import (
	"context"
	"errors"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
)

func StoreVC(PRVC PermanentResidentCardDB, username string) error {

	if username == "" {
		log.Error("Empty username")
		return errors.New("Empty username")
	}

	// check if credential has friendly name
	if PRVC.FriendlyName == "" {
		log.Error("Invalid credential")
		return errors.New("invalid credential")
	}

	walletDb := StartDB(username)
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
func FetchWalletInfo(db *kivik.DB, VCid string) (PermanentResidentCardDB, error) {
	// query with user lprNumber
	row := db.Get(context.TODO(), VCid)
	var Vc PermanentResidentCardDB

	if err := row.ScanDoc(&Vc); err != nil {
		// entry does not exist in db, return error
		return Vc, err
	} else {
		// entry with given id already exists in db, return fetched document
		return Vc, nil
	}
}

// fetch every doc in db
func FetchAllWalletInfo(db *kivik.DB) ([]PermanentResidentCardDB, error) {
	var VCs []PermanentResidentCardDB

	rows, err := db.AllDocs(context.TODO(), kivik.Options{"include_docs": true})
	if err != nil {
		log.Info("a")
		return VCs, err
	}

	var VC PermanentResidentCardDB
	for rows.Next() {
		if err := rows.ScanDoc(&VC); err != nil {
			log.Info("b")
			return VCs, err
		} else {
			VCs = append(VCs, VC)
		}
	}
	if rows.Err() != nil {
		log.Info("c")
		return VCs, rows.Err()
	}

	return VCs, nil

}
