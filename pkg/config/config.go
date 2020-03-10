package config

import (
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"strings"
)

func Init() {
	viper.SetEnvPrefix("SVIP")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".","_"))
	viper.AutomaticEnv()

	viper.SetConfigType("yaml")
	viper.SetConfigName("config")
	viper.AddConfigPath("./")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
