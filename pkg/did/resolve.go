package did

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"strings"
)

type Resolution struct {
	DIDDocument DIDDoc `json:"didDocument"`
}

type DIDDoc struct {
	Context   []string          `json:"@context"`
	ID        string            `json:"id"`
	Service   []Service         `json:"service"`
	PublicKey []DIDDocPublicKey `json:"publicKey"`
}

type DIDDocPublicKey struct {
	ID              string `json:"id"`
	Type            string `json:"type"`
	Controller      string `json:"controller"`
	PublicKeyBase58 string `json:"publicKeyBase58"`
}

func ResolveDID(DID string) (Resolution, error) {
	initConfig()
	log.Println("resolving did => ", DID)

	resolverHost := viper.GetString("resolver.host")
	resolverURL := "https://" + resolverHost + "/1.0/identifiers/" + DID
	log.Println("resolver URL => ", resolverURL)

	didResolution := Resolution{}

	req, err := http.NewRequest("GET", resolverURL, nil)
	if err != nil {
		log.Error("error creating resolve did get request ", err)
		return didResolution, err
	}
	req.Header.Add("Accept", "/")

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error("error executing resolve did get request", err)
		return didResolution, err
	}

	defer resp.Body.Close()
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error reading resp body ", err)
		return didResolution, err
	}

	log.Printf("resolution => ", string(bodyBytes))
	if err = json.Unmarshal(bodyBytes, &didResolution); err != nil {
		log.Error("error unmarshalling did resolution ", err)
		return didResolution, err
	}

	return didResolution, nil
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
