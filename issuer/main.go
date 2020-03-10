package main

import (
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	handler "sk-git.securekey.com/labs/svip-demo-verifier/issuer/server/handlers"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/utils"
	"strings"
	"github.com/spf13/viper"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {

	// Import configured environment variables
	initConfig()

	port := viper.GetString("issuer.port")
	tlsCert := viper.GetString("keys.cert_path")
	tlsKey := viper.GetString("keys.key_path")

	log.Infof("Starting issuer web app on port %d", port)

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeUserInfo", handler.HandleStoreUserInfo).Methods("POST")
	r.HandleFunc("/createVC", handler.HandleCreateVC).Methods("GET")
	r.HandleFunc("/userInfo/{id}", handler.HandleTransferSession).Methods("GET")
	r.HandleFunc("/createAccount", handler.HandleCreateIssuerAccount).Methods("POST")
	r.HandleFunc("/login", handler.LoginHandler).Methods("POST")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}

func initConfig() {

	// Use issuerconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("issuerconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".","_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
