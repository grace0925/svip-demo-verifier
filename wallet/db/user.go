package db

import (
	"context"
	"errors"
	_ "github.com/go-kivik/couchdb" // The CouchDB driver
	"github.com/go-kivik/kivik"
)

// Create/Update user information entry in db
func StoreUserInfo(db *kivik.DB, info UserInfoDB) error {

	userInfo, er := FetchUserInfo(db, info.SessionId)

	// check whether entry already exist in db
	// if entry already exists, update entry
	if er == nil {
		info.Rev = userInfo.Rev
		_, err := db.Put(context.TODO(), info.SessionId, info)
		if err != nil {
			return err
		}
		return nil
	} else {
		// create new entry in db
		_, err := db.Put(context.TODO(), info.SessionId, info)
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

	// entry with given lprNumber already exists in db, return fetched document
	if err := row.ScanDoc(&userInfo); err != nil {
		return userInfo, err
	} else {
		// entry does not exist in db, return error "not found"
		return userInfo, errors.New("not found")
	}

}
