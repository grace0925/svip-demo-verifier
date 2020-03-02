package db

import (
	"context"
	"fmt"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
)

// connect to couchdb client and return db
func StartDB(dbName string) *kivik.DB {
	log.WithFields(log.Fields{
		"dbName": dbName,
	}).Info("Starting db")
	// connect to db client
	client, err := kivik.New("couch", "http://admin:securekey@couchdb.com:5984/")
	if err != nil {
		fmt.Println(err)
	}
	// check if db exists, if not, create new db
	exist, _ := client.DBExists(context.TODO(), dbName)
	if exist == false {
		err := client.CreateDB(context.TODO(), dbName)
		if err != nil {
			log.Error(err)
			panic(err)
		}
	}
	// connect to db
	db := client.DB(context.TODO(), dbName)
	if db.Err() != nil {
		fmt.Println(err)
	}
	return db
}
