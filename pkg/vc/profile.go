package vc

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"net/http"
)

type profileResponse struct {
	Name string `json:"name"`
	DID string `json:"did"`
	URI string `json:"uri"`
	SignatureType string `json:"signatureType"`
	Creator string `json:"creator"`
	Created string `json:"created"`
}

// GenerateProfile sends a request to the VC Services REST API and returns the created profile's DID
func GenerateProfile(client *http.Client, name string) (string, error) {

	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	// calling edge service to create profile
	profileReq := `{
    "name": "` + name +`",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`

	profReqURL := "http://" + vcsHost + vcsPort + "/profile"

	req, err := http.NewRequest("POST", profReqURL, bytes.NewBuffer([]byte(profileReq)))
	if err != nil {
		log.Error(err)
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	var pr profileResponse
	resp, err := client.Do(req)
	json.NewDecoder(resp.Body).Decode(pr)
	if err != nil {
		log.Error("create profile request failed => ", err)
		return "", err
	} else {
		log.Info("Profile generated")
	}
	return pr.DID, nil
}
