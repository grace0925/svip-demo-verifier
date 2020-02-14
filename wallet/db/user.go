package db

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/flimzy/kivik"
	_ "github.com/go-kivik/couchdb" // The CouchDB driver
	"net/http"
)

const USERDB = "user_info"

type CredentialSubjectDB struct {
	ID                     string   `json:"id,omitempty"`
	Type                   []string `json:"type,omitempty"`
	GivenName              string   `json:"givenName,omitempty"`
	FamilyName             string   `json:"familyName,omitempty"`
	Gender                 string   `json:"gender,omitempty"`
	Image                  string   `json:"image,omitempty"`
	ResidentSince          string   `json:"residentSince,omitempty"`
	LPRCategory            string   `json:"lprCategory,omitempty"`
	LPRNumber              string   `json:"lprNumber,omitempty"`
	CommuterClassification string   `json:"commuterClassification,omitempty"`
	BirthCountry           string   `json:"birthCountry,omitempty"`
	BirthDate              string   `json:"birthDate,omitempty"`
}

type CredentialProof struct {
	Created    string `json:"created,omitempty"`
	Creator    string `json:"creator,omitempty"`
	Domain     string `json:"domain,omitempty"`
	Nonce      string `json:"nonce,omitempty"`
	ProofValue string `json:"proofValue,omitempty"`
	Type       string `json:"type,omitempty"`
}

type UserInfoDB struct {
	Rev               string              `json:"_rev,omitempty"`
	SessionId         string              `json:"sessionId,omitempty"`
	IssuanceDate      string              `json:"issuanceDate,omitempty"`
	ExpirationDate    string              `json:"expirationDate,omitempty"`
	CredentialSubject CredentialSubjectDB `json:"credentialSubject,omitempty"`
}

// Receive user info and store in database
func HandleUserInfo(w http.ResponseWriter, r *http.Request) {

	var info UserInfoDB
	err := json.NewDecoder(r.Body).Decode(&info)
	if err != nil {
		w.WriteHeader(400)
		panic(err)
	}

	db := StartUserDB(USERDB)
	StoreUserInfo(db, info)

	w.WriteHeader(200)
}

// Create/Update new user information entry in db
func StoreUserInfo(db *kivik.DB, info UserInfoDB) {

	// check whether entry already exist in db
	userInfo, er := FetchUserInfo(db, info.SessionId)

	// update entry if it already exists
	if er == nil {
		info.Rev = userInfo.Rev
		_, err := db.Put(context.TODO(), info.SessionId, info)
		if err != nil {
			panic(err)
		}
	} else {
		// create new entry in db
		_, err := db.Put(context.TODO(), info.SessionId, info)
		if err != nil {
			panic(err)
		}
	}
}

// fetch user information
func FetchUserInfo(db *kivik.DB, id string) (UserInfoDB, error) {
	// query with user lprNumber
	row, err := db.Get(context.TODO(), id)
	var userInfo UserInfoDB

	if err == nil {
		// entry with given lprNumber already exists in db, return fetched document
		if err = row.ScanDoc(&userInfo); err != nil {
			panic(err)
		}
		return userInfo, nil
	} else {
		// entry does not exist in db, return error "Not found"
		return userInfo, errors.New("Not found")
	}
}
