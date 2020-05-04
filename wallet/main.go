package main

import (
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/utils"
	"sk-git.securekey.com/labs/svip-demo-verifier/wallet/server/handlers"
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

	r.HandleFunc("/storeVC", handlers.StoreVCHandler).Methods("POST")
	r.HandleFunc("/createAccount", handlers.CreateWalletAccountHandler).Methods("GET")
	r.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/getVc", handlers.GetVCHandler).Methods("GET")
	r.HandleFunc("/getPrivateKey", handlers.GetPrivateKeyHandler).Methods("GET")
	r.HandleFunc("/generateKeys", handlers.GenerateKeysHandler).Methods("GET")
	r.HandleFunc("/getWalletDID", handlers.GetWalletDIDHandler).Methods("GET")
	r.HandleFunc("/testAries", handlers.TestAriesHandler).Methods("GET")

	hyperledger := utils.HyperledgerHandler{ClientPath: "client",
		DistPath: "client/node_modules/@hyperledger/aries-framework-go/dist", URLPrefix: "/node_modules/@hyperledger/aries-framework-go/dist/assets"}
	r.PathPrefix("/node_modules").HandlerFunc(hyperledger.ServeHyperledgerAries)

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
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
