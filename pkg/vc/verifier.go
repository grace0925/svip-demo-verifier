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

type PresentationFromWallet struct {
	Presentation SignPresentationResp `json:"presentation"`
}

type VerifyVCRequest struct {
	VerifiableCredential db.VerifiableCredentialDB `json:"verifiableCredential"`
}

type VerifyVPRequest struct {
	VerifiablePresentation SignPresentationResp    `json:"verifiablePresentation,omitempty"`
	Options                SignPresentationOptions `json:"options,omitempty"`
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

func VerifyVP(vp PresentationFromWallet) (bool, error) {
	initConfig()
	verifierHost := viper.GetString("verifier.host")

	verifyReqURL := "https://" + verifierHost + "/verifier/presentations"

	verifyReq := VerifyVPRequest{
		VerifiablePresentation: vp.Presentation,
		Options: SignPresentationOptions{
			VerificationMethod: vp.Presentation.Proof.VerificationMethod,
			Domain:             vp.Presentation.Proof.Domain,
			Challenge:          vp.Presentation.Proof.Challenge,
			ProofPurpose:       vp.Presentation.Proof.ProofPurpose,
		},
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
		log.Println("VP verified")
		return true, nil
	} else {
		return false, nil
	}
}
