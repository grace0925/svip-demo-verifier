package db

import (
	"context"
	"encoding/json"
	"fmt"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	"net/http"
)

func GetVC(w http.ResponseWriter, r *http.Request) {
	fmt.Println("---------getting VC")
	id := r.FormValue("ID")
	walletDb := StartDB(WALLET)
	walletInfo, err := FetchWalletInfo(walletDb, id)
	if err != nil {
	} else {
		fmt.Printf("wallet info %+v", walletInfo)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(walletInfo)
	w.WriteHeader(200)
}

func StoreVC(w http.ResponseWriter, r *http.Request) {
	fmt.Println("--------store VC")
	var PRVC PermanentResidentCardDB
	err := json.NewDecoder(r.Body).Decode(&PRVC)
	if err != nil {
		w.WriteHeader(400)
		panic(err)
	}
	fmt.Printf("got vc %+v", PRVC)

	walletDb := StartDB(WALLET)
	walletInfo, er := FetchWalletInfo(walletDb, PRVC.ID)

	// update entry if it already exists
	if er == nil {
		PRVC.Rev = walletInfo.Rev
		_, err := walletDb.Put(context.TODO(), PRVC.ID, PRVC)
		if err != nil {
			panic(err)
		}
	} else {
		// create new entry in db
		_, err := walletDb.Put(context.TODO(), PRVC.ID, PRVC)
		if err != nil {
			panic(err)
		}
	}

}

// fetch wallet information
func FetchWalletInfo(db *kivik.DB, VCid string) (PermanentResidentCardDB, error) {
	// query with user lprNumber
	row := db.Get(context.TODO(), VCid)
	var Vc PermanentResidentCardDB

	if err := row.ScanDoc(&Vc); err != nil {
		// entry does not exist in db, return error "Not found"
		return Vc, err
	} else {
		// entry with given lprNumber already exists in db, return fetched document
		return Vc, nil
	}
}
