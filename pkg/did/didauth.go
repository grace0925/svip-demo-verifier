package did

import (
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"strings"
)

type DIDAuthRequest struct {
	Query     string
	Challenge string
	Domain    string
}

func DidAuth(DID string) (interface{}, error) {
	log.Println("-----------inside did auth--------")

	initConfig()
	didsHost := viper.GetString("did.host")
	didsPort := viper.GetString("did.port")

	client := http.Client{}
	//credReqURL := "http://" + didsHost + didsPort + "/1.0/register"
	resolveReqURL := "http://" + didsHost + didsPort + "/resolveDID?did=" + DID
	log.Println(resolveReqURL)

	//req, err := json.Marshal(operation.RegisterDIDRequest{JobID: "1"})
	resolveReq, err := http.NewRequest("GET", resolveReqURL, nil)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	resp, err := client.Do(resolveReq)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer resp.Body.Close()
	log.Println("response ok!!!!!!!!!")
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	bodyString := string(bodyBytes)
	log.Info(bodyString)
	log.Info("status code => ", resp.StatusCode)
	return nil, nil

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
