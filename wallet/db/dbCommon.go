package db

import (
	"context"
	"fmt"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
)

// connect to couchdb client and return db
func StartDB(dbName string) *kivik.DB {
	fmt.Println("starting db")
	client, err := kivik.New("couch", "http://admin:securekey@127.0.0.1:5984/")
	if err != nil {
		fmt.Println(err)
	}
	db := client.DB(context.TODO(), dbName)
	if db.Err() != nil {
		fmt.Println(err)
	}
	return db
}
