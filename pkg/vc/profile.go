package vc

import (
	"bytes"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
)

type profileResponse struct {
	Name          string `json:"name"`
	DID           string `json:"did"`
	URI           string `json:"uri"`
	SignatureType string `json:"signatureType"`
	Creator       string `json:"creator"`
	Created       string `json:"created"`
}

// GenerateProfile sends a request to the VC Services REST API and returns the created profile's DID
func GenerateProfile(client *http.Client, name string) error {

	initConfig()

	vcsHost := viper.GetString("issuer.host")
	vcsPort := viper.GetString("issuer.port")

	// calling edge service to create profile
	profileReq := `{
		"name": "` + name + `",
    	"uri": "http://uscis.gov/credentials",
    	"signatureType": "Ed25519Signature2018"
	}`

	profReqURL := "http://" + vcsHost + vcsPort + "/profile"

	req, err := http.NewRequest("POST", profReqURL, bytes.NewBuffer([]byte(profileReq)))
	if err != nil {
		log.Error(err)
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	body, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("create profile request failed => ", err)
		return err
	} else {
		log.Info("Profile generate result => ", string(body))
	}
	return nil
}
