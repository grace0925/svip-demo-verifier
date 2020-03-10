package db

import (
	"context"
	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"strings"
)

// connect to couchdb client and return db
func StartDB(dbName string) *kivik.DB {

	initConfig()

	host := viper.GetString("cdb.host")
	port := viper.GetString("cdb.port")
	user := viper.GetString("cdb.user")
	pw := viper.GetString("cdb.password")

	dbReqURL := "http://" + user + ":" + pw + "@" + host + port

	log.WithFields(log.Fields{
		"dbName": dbName,
	}).Info("Starting db")
	// connect to db client
	client, err := kivik.New("couch", dbReqURL)
	if err != nil {
		log.Error(err)
	}
	// check if db exists, if not, create new db
	exist, _ := client.DBExists(context.TODO(), dbName)
	if exist == false {
		log.Info("creating db =>" + dbName)
		err := client.CreateDB(context.TODO(), dbName)
		if err != nil {
			log.Error(err)
			panic(err)
		}
	}
	// connect to db
	db := client.DB(context.TODO(), dbName)
	if db.Err() != nil {
		log.Error(err)
	}
	return db
}

func initConfig() {

	// Use cdbconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("cdbconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".","_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
