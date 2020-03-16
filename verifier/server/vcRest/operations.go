package vcRest

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"net/http"
	"strings"
)

type VerifyResponse struct {
	Verified bool   `json:"verified"`
	Message  string `json:"message"`
}

func GenerateProfile(client *http.Client) error {

	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	profReqURL := "http://" + vcsHost + vcsPort + "/profile"

	log.Info("generating profile")
	profileReq := `{
    "name": "uscis",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`
	req, err := http.NewRequest("POST", profReqURL, bytes.NewBuffer([]byte(profileReq)))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	log.Info("generate profile status code => ", resp.StatusCode)
	if err != nil {
		return err
	} else {
		log.Info("successfully generated profile")
		return nil
	}
}

func VerifyVC(client *http.Client, vc interface{}) (bool, error) {
	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	verifyReqURL := "http://" + vcsHost + vcsPort + "/verify"

	log.Info("verifying VC")

	reqBody, err := json.Marshal(vc)
	if err != nil {
		return false, err
	}

	req, err := http.NewRequest("POST", verifyReqURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return false, err
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}

	var verifyRes VerifyResponse
	if err = json.NewDecoder(resp.Body).Decode(&verifyRes); err != nil {
		return false, err
	}
	log.Info("VC verified")
	log.Info("verify response => ", verifyRes)
	return verifyRes.Verified, nil
}

func initConfig() {
	// Use vcsconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("vcsconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
