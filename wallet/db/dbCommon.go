package db

import (
	"context"
	"fmt"
	"github.com/flimzy/kivik"
)

// connect to couchdb client and return db
func StartUserDB(dbName string) *kivik.DB {
	fmt.Println("starting user db")
	client, err := kivik.New(context.TODO(), "couch", "http://admin:securekey@127.0.0.1:5984/")
	if err != nil {
		panic(err)
	}
	db, err := client.DB(context.TODO(), dbName)
	if err != nil {
		panic(err)
	}
	return db
}
