package vc

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
)

const VERIFYPROOF = "proof"
const VERIFYSTATUS = "status"

type VerifyVCRequest struct {
	VerifiableCredential db.VerifiableCredentialDB `json:"verifiableCredential"`
}

type VerifierOptions struct {
	Checks []string `json:"checks,omitempty"`
}

func VerifyVC(vc db.VerifiableCredentialDB) (bool, error) {
	log.Info("verifying VC")

	initConfig()
	verifierHost := viper.GetString("verifier.host")

	verifyReqURL := "https://" + verifierHost + "/verifier/credentials"

	verifyReq := VerifyVCRequest{
		VerifiableCredential: vc,
	}

	reqBody, err := json.Marshal(verifyReq)
	if err != nil {
		return false, err
	}

	req, err := http.NewRequest("POST", verifyReqURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return false, err
	}

	req.Header.Set("Content-Type", "application/json")
	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	log.Printf("verify response body => ", string(body))

	if resp.StatusCode == 200 {
		log.Println("VC verified")
		return true, nil
	} else {
		return false, nil
	}
}
