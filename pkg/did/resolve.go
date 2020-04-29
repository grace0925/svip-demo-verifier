package did

import (
	"encoding/json"
	"errors"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"strings"
)

type Doc struct {
	Context   []string    `json:"@context,omitempty"`
	ID        string      `json:"id,omitempty"`
	PublicKey []PublicKey `json:"authentication,omitempty"`
}

func ResolveDID(DID string) (Doc, error) {
	initConfig()
	didsHost := viper.GetString("did.host")
	didsPort := viper.GetString("did.port")

	client := http.Client{}
	resolvedDoc := Doc{}
	resolveReqURL := "https://" + didsHost + didsPort + "/resolveDID?did=" + DID
	log.Println("resolving endpoint => ", resolveReqURL)

	resolveReq, err := http.NewRequest("GET", resolveReqURL, nil)
	if err != nil {
		log.Error(err)
		return resolvedDoc, err
	}

	resp, err := client.Do(resolveReq)
	if err != nil {
		log.Error(err)
		return resolvedDoc, err
	}

	if resp.StatusCode == 200 {
		defer resp.Body.Close()
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}
		if json.Unmarshal(bodyBytes, &resolvedDoc) != nil {
			log.Error(err)
			return resolvedDoc, err
		} else {
			log.Printf("successfully resolve did, did doc => %+v", resolvedDoc)
			return resolvedDoc, nil
		}
	} else {
		log.Error("invalid status code")
		defer resp.Body.Close()
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Error(err)
		}
		log.Println("resp => ", string(bodyBytes))
		return resolvedDoc, errors.New("invalid status code")
	}
}

func initConfig() {
	// Use vcsconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("didconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
