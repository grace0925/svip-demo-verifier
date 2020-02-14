package db

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/flimzy/kivik"
	"net/http"
)

const WALLET = "vc_wallet"

type PermanentResidentCardDB struct {
	FriendlyName      string              `json:"friendlyName,omitempty"`
	Rev               string              `json:"_rev,omitempty"`
	Context           []string            `json:"@context,omitempty"`
	CredentialSchema  []string            `json:"credentialSchema,omitempty"`
	ID                string              `json:"id,omitempty"`
	Type              []string            `json:"type,omitempty"`
	Issuer            Issuer              `json:"issuer,omitempty"`
	IssuanceDate      string              `json:"issuanceDate,omitempty"`
	ExpirationDate    string              `json:"expirationDate,omitempty"`
	CredentialSubject CredentialSubjectDB `json:"credentialSubject,omitempty"`
	Proof             CredentialProof     `json:"proof,omitempty"`
}

type Issuer struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

func GetVC(w http.ResponseWriter, r *http.Request) {
	fmt.Println("---------getting VC")
	id := r.FormValue("ID")
	walletDb := StartUserDB(WALLET)
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

	walletDb := StartUserDB(WALLET)
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
	row, err := db.Get(context.TODO(), VCid)
	var Vc PermanentResidentCardDB

	if err == nil {
		// entry with given lprNumber already exists in db, return fetched document
		if err = row.ScanDoc(&Vc); err != nil {
			panic(err)
		}
		return Vc, nil
	} else {
		// entry does not exist in db, return error "Not found"
		return Vc, errors.New("Not found")
	}
}
