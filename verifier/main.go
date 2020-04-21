package main

import (
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/utils"
	"sk-git.securekey.com/labs/svip-demo-verifier/verifier/server/handlers"
	"strings"
)

func init() {
	log.SetOutput(os.Stdout)
}

func main() {

	initConfig()

	port := viper.GetString("vcs.port")
	tlsCert := viper.GetString("keys.cert_path")
	tlsKey := viper.GetString("keys.key_path")

	log.WithFields(log.Fields{
		"Port": port,
	}).Info("Starting verifier")

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/verifyVC", handlers.VerifyVCHandler).Methods("POST")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)
	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}

func initConfig() {

	// Use verifierconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("verifierconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
