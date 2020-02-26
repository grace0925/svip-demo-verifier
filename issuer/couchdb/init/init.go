package main

import (
	"context"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	"log"
)

func main() {
	client, err := kivik.New("couch", "http://admin:securekey@localhost:5984/")
	if err != nil {
		log.Fatal("could not create kivik client")
	}

	if client.CreateDB(context.TODO(), "user_info") != nil {
		log.Fatal("could not create user_info database")
	}
	if client.CreateDB(context.TODO(), "vc_wallet") != nil {
		log.Fatal("could not create user_info database")
	}
	if client.CreateDB(context.TODO(), "_users") != nil {
		log.Fatal("could not create user_info database")
	}

}