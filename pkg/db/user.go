package db

import (
	"context"
	_ "github.com/go-kivik/couchdb" // The CouchDB driver
	"github.com/go-kivik/kivik"
)

// Create/Update user information entry in db
func StoreUserInfo(db *kivik.DB, info UserInfoDB) error {

	userInfo, err := FetchUserInfo(db, info.SessionId)

	// check whether entry already exist in db
	// if entry already exists, update entry
	if err == nil {
		info.Rev = userInfo.Rev
	}
	// create new entry
	_, err = db.Put(context.TODO(), info.SessionId, info)
	if err != nil {
		return err
	}
	return nil
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
