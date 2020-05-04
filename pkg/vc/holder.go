package vc

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
)

const VERIFIABLEPRESENTATION = "VerifiablePresentation"
const AUTHENTICATION = "authentication"

type SignPresentionReq struct {
	Presentation Presentation            `json:"presentation"`
	Options      SignPresentationOptions `json:"options,omitempty"`
}

type Presentation struct {
	Context              []string    `json:"@context,omitempty"`
	VerifiableCredential interface{} `json:"verifiableCredential"`
	Type                 string      `json:"type,omitempty"`
	Holder               string      `json:"holder,omitempty"`
}

type SignPresentationOptions struct {
	VerificationMethod string `json:"verificationMethod,omitempty"`
	Domain             string `json:"domain,omitempty"`
	Challenge          string `json:"challenge,omitempty"`
	ProofPurpose       string `json:"proofPurpose,omitempty"`
}

type SignPresentationResp struct {
	Context              []string    `json:"@context,omitempty"`
	Type                 string      `json:"type,omitempty"`
	VerifiableCredential interface{} `json:"verifiableCredential"`
	Holder               string      `json:"holder,omitempty"`
	Proof                Proof       `json:"proof,omitempty"`
}

type Proof struct {
	Challenge          string `json:"challenge,omitempty"`
	Domain             string `json:"domain,omitempty"`
	Created            string `json:"created,omitempty"`
	JWS                string `json:"jws,omitempty"`
	Type               string `json:"type,omitempty"`
	ProofPurpose       string `json:"proofPurpose,omitempty"`
	VerificationMethod string `json:"verificationMethod,omitempty"`
}

func CheckHolderProfileExist(profileName string) (bool, string, error) {
	initConfig()
	holderHost := viper.GetString("holder.host")

	getProfileReq := "https://" + holderHost + "/holder/profile/" + profileName
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

func GenerateHolderProfile(profileName string, walletDID string) error {
	log.Println("generating holder profile ", profileName)
	initConfig()
	holderHost := viper.GetString("holder.host")

	privateKey58, err := db.GetPrivateKey(walletDID, db.WALLETACCOUNT)
	if err != nil {
		log.Error("error getting private key from db with did => ", err)
		return err
	}
	log.Println("got private key => ", privateKey58)

	profileReq := ProfileRequest{
		Name:                    profileName,
		URI:                     HOLDERPROFILEURI,
		DID:                     walletDID,
		SignatureType:           ED25519SIGNATURE2018,
		SignatureRepresentation: 1,
		DidKeyType:              ED25519KEYTYPE,
		DidPrivateKey:           privateKey58,
	}
	profileReqBytes, err := json.Marshal(profileReq)
	if err != nil {
		log.Error("error marshalling profile request ", err)
		return err
	}

	profReqURL := "https://" + holderHost + "/holder/profile"
	req, err := http.NewRequest("POST", profReqURL, bytes.NewBuffer(profileReqBytes))
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		log.Error(err)
		return err
	}

	client := http.Client{}
	resp, err := client.Do(req)
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("create holder profile request failed => ", err, " response => ", string(body))
		return err
	} else {
		log.Info("holder profile generate result => ", string(body))
	}

	return nil
}

func GenerateSignedPresentation(profileName string, walletDID string) (SignPresentationResp, error) {
	initConfig()

	holderHost := viper.GetString("holder.host")

	signPreURL := "https://" + holderHost + "/" + profileName + "/prove/presentations"

	veriMethod := walletDID + "#key-1"
	UUID := uuid.New()
	uuidStr := UUID.String()

	signPresReq := SignPresentionReq{
		Presentation: Presentation{
			Context:              []string{IssuerContext},
			VerifiableCredential: nil,
			Type:                 VERIFIABLEPRESENTATION,
			Holder:               walletDID,
		},
		Options: SignPresentationOptions{
			VerificationMethod: veriMethod,
			Domain:             holderHost,
			Challenge:          uuidStr,
			ProofPurpose:       AUTHENTICATION,
		},
	}

	signedPresentation := SignPresentationResp{}

	requestBytes, err := json.Marshal(signPresReq)
	if err != nil {
		log.Error("marshal cred request json error => ", err)
		return signedPresentation, err
	}

	req, err := http.NewRequest("POST", signPreURL, bytes.NewBuffer(requestBytes))
	if err != nil {
		log.Error("create cred request error => ", err)
		return signedPresentation, err
	}

	req.Header.Set("Content-Type", "application/json")
	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error("error executing sign presentation request")
	}

	defer resp.Body.Close()
	data, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("sign presentation error => ", data, err)
		return signedPresentation, err
	}
	log.Print("sign presentation response => ", string(data))

	if err := json.Unmarshal(data, &signedPresentation); err != nil {
		log.Error("marshal presentation response json error => ", err)
		return signedPresentation, err
	} else {
		log.Info("sign presentation json => ", signedPresentation)
		log.Info("successfully generated signed presentation")
	}
	return signedPresentation, nil
}
