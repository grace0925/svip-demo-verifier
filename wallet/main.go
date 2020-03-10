package main

import (
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/utils"
	handler "sk-git.securekey.com/labs/svip-demo-verifier/wallet/server"
	"strings"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {

	initConfig()

	port := viper.GetString("wallet.port")
	tlsCert := viper.GetString("keys.cert_path")
	tlsKey := viper.GetString("keys.key_path")

	log.WithFields(log.Fields{
		"Port": port,
	}).Info("Starting wallet")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeVC", handler.StoreVCHandler).Methods("POST")
	r.HandleFunc("/createAccount", handler.CreateWalletAccountHandler).Methods("POST")
	r.HandleFunc("/login", handler.LoginHandler).Methods("POST")
	r.HandleFunc("/getVc", handler.GetVCHandler).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))

}

func initConfig() {

	// Use walletconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("walletconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".","_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}