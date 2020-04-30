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
	Context          interface{}     `json:"@context"`
	DIDDocument      json.RawMessage `json:"didDocument"`
	ResolverMetadata json.RawMessage `json:"resolverMetadata"`
	MethodMetadata   json.RawMessage `json:"methodMetadata"`
}

func ResolveDID(DID string) (Resolution, error) {
	initConfig()
	log.Println("resolving did => ", DID)

	resolverHost := viper.GetString("resolver.host")
	resolverURL := "https://" + resolverHost + "/1.0/identifiers/" + DID

	didResolution := Resolution{}

	req, err := http.NewRequest("GET", resolverURL, nil)
	if err != nil {
		log.Error("error creating resolve did get request ", err)
		return didResolution, err
	}

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

	if err = json.Unmarshal(bodyBytes, &didResolution); err != nil {
		log.Error("error unmarshalling did resolution ", err)
		return didResolution, err
	}

	log.Printf("did resolution => %+v", didResolution)
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
