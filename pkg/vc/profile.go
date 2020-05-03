package vc

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/mr-tron/base58"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/did"
	"time"
)

const USCISPROFILENAME = "USCIS"
const USCISPROFILEURI = "http://uscis.gov/credentials"
const ED25519SIGNATURE2018 = "Ed25519Signature2018"
const ED25519KEYTYPE = "Ed25519"

type ProfileResponse struct {
	Name                    string `json:"name"`
	URI                     string `json:"uri"`
	DID                     string `json:"did"`
	SignatureType           string `json:"signatureType, omitempty"`
	SignatureRepresentation int    `json:"signatureRepresentation, omitempty"`
	DidKeyType              string `json:"didKeyType, omitempty"`
	DidPrivateKey           string `json:"didPrivateKey, omitempty"`
	Creator                 string `json:"creator,omitempty"`
	Created                 string `json:"created,omitempty"`
	DisableVCStatus         bool   `json:"disableVCStatus,omitempty"`
	OverwriteIssuer         bool   `json:"overwriteIssuer,omitempty"`
}

type ProfileRequest struct {
	Name                    string `json:"name"`
	URI                     string `json:"uri"`
	DID                     string `json:"did"`
	SignatureType           string `json:"signatureType, omitempty"`
	SignatureRepresentation int    `json:"signatureRepresentation, omitempty"`
	DidKeyType              string `json:"didKeyType, omitempty"`
	DidPrivateKey           string `json:"didPrivateKey, omitempty"`
}

// GenerateProfile sends a request to the VC Services REST API and returns the created profile's DID
func GenerateProfile(profileName string) error {

	log.Println("generating profile ", profileName)
	initConfig()

	vcsHost := viper.GetString("issuer.host")
	didStr, privateKey, err := did.RegisterDID(did.DIDUSAGEASSERTION)
	if err != nil {
		log.Error("error registering DID ", err)
		return err
	}
	privateKeyBase58 := base58.Encode(privateKey)
	wait, _ := time.ParseDuration("2.5s")
	time.Sleep(wait)

	// calling edge service to create profile
	profileReq := ProfileRequest{
		Name:                    profileName,
		URI:                     USCISPROFILEURI,
		DID:                     didStr,
		SignatureType:           ED25519SIGNATURE2018,
		SignatureRepresentation: 1,
		DidKeyType:              ED25519KEYTYPE,
		DidPrivateKey:           privateKeyBase58,
	}
	profileReqBytes, err := json.Marshal(profileReq)
	if err != nil {
		log.Error("error marshalling profile request ", err)
		return err
	}

	profReqURL := "https://" + vcsHost + "/profile"

	req, err := http.NewRequest("POST", profReqURL, bytes.NewBuffer(profileReqBytes))
	if err != nil {
		log.Error(err)
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}
	resp, err := client.Do(req)
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("create profile request failed => ", err, " response => ", string(body))
		return err
	} else {
		log.Info("Profile generate result => ", string(body))
	}
	return nil
}

func GetProfile(profileName string) (bool, string, error) {

	initConfig()
	issuerHost := viper.GetString("issuer.host")

	getProfileReq := "https://" + issuerHost + "/profile/" + profileName
	req, err := http.NewRequest("GET", getProfileReq, nil)
	if err != nil {
		log.Error("error making get profile request ", err)
		return false, "", err
	}

	client := http.Client{}
	resp, err := client.Do(req)
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error executing request ", err)
		return false, "", err
	}

	if resp.StatusCode == 400 {
		log.Println("profile ", profileName, " does not exist")
		return false, "", nil
	} else if resp.StatusCode == 200 {
		log.Println("profile ", profileName, " exists")
		profileResp := ProfileResponse{}
		if err = json.Unmarshal(body, &profileResp); err != nil {
			log.Error("error unmarshalling profile response ", err)
			return true, "", err
		}
		log.Printf("got profile => %+v", profileResp)
		return true, profileResp.DID, nil
	} else {
		defer resp.Body.Close()
		body, _ := ioutil.ReadAll(resp.Body)
		log.Println(string(body))
		return false, "", errors.New("error getting profile")
	}
}
