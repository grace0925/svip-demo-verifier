package db

import (
	"context"
	"encoding/json"
	"fmt"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
	"net/http"
)

// get vc from wallet database
func GetVC(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("ID")
	walletDb := StartDB(WALLET)
	walletInfo, err := FetchWalletInfo(walletDb, id)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
		return
	} else {
		fmt.Printf("wallet info %+v", walletInfo)
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(walletInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
		return
	}
	w.WriteHeader(200)
}

func StoreVC(w http.ResponseWriter, r *http.Request) {
	var PRVC PermanentResidentCardDB
	err := json.NewDecoder(r.Body).Decode(&PRVC)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
		return
	} else {
		fmt.Printf("got vc %+v", PRVC)
	}

	if PRVC.ID == "" {
		log.Error("Failed to find valid VC to store")
		http.Error(w, "Failed to find valid VC to store", 500)
	}

	walletDb := StartDB(WALLET)
	walletInfo, er := FetchWalletInfo(walletDb, PRVC.ID)

	// update entry if it already exists
	if er == nil {
		PRVC.Rev = walletInfo.Rev
		_, err := walletDb.Put(context.TODO(), PRVC.ID, PRVC)
		if err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 400)
		}
	} else {
		// create new entry in db
		_, err := walletDb.Put(context.TODO(), PRVC.ID, PRVC)
		if err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 400)
		}
	}
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
