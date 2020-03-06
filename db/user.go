package db

import (
	"context"
	"encoding/json"
	_ "github.com/go-kivik/couchdb" // The CouchDB driver
	"github.com/go-kivik/kivik"
	"net/http"
)

// Store user information in database "user_info"
func HandleStoreUserInfo(w http.ResponseWriter, r *http.Request) {

	var info UserInfoDB
	err := json.NewDecoder(r.Body).Decode(&info)
	if err != nil {
		w.WriteHeader(400)
		panic(err)
	}

	userdb := StartDB(USERDB)
	err = StoreUserInfo(userdb, info)
	if err != nil {
		http.Error(w, err.Error(), 400)
		panic(err)
	}

	w.WriteHeader(200)
}

// Create/Update user information entry in db
func StoreUserInfo(db *kivik.DB, info UserInfoDB) error {

	userInfo, err := FetchUserInfo(db, info.SessionId)

	// check whether entry already exist in db
	// if entry already exists, update entry
	if err == nil {
		info.Rev = userInfo.Rev
		_, err = db.Put(context.TODO(), info.SessionId, info)
		if err != nil {
			return err
		}
		return nil
	} else {
		// create new entry in db
		_, err = db.Put(context.TODO(), info.SessionId, info)
		if err != nil {
			return err
		}
		return nil
	}
}

// fetch user information
func FetchUserInfo(db *kivik.DB, id string) (UserInfoDB, error) {
	// query with session id
	row := db.Get(context.TODO(), id)
	var userInfo UserInfoDB

	// entry does not exist in db, return error
	if err := row.ScanDoc(&userInfo); err != nil {
		return userInfo, err
	} else {
		// entry with given sessionid already exists in db, return fetched document
		return userInfo, nil
	}

}
