package vcRest

import (
	"bytes"
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type VerifyResponse struct {
	Verified bool   `json:"verified"`
	Message  string `json:"message"`
}

func GenerateProfile(client *http.Client) error {
	log.Info("generating profile")
	profileReq := `{
    "name": "uscis",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`
	req, err := http.NewRequest("POST", "http://vcRest.com:8085/profile", bytes.NewBuffer([]byte(profileReq)))
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
	log.Info("verifying VC")

	reqBody, err := json.Marshal(vc)
	if err != nil {
		return false, err
	}

	req, err := http.NewRequest("POST", "http://vcRest.com:8085/verify", bytes.NewBuffer(reqBody))
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
	fmt.Printf("verify response => %+v", verifyRes)
	return verifyRes.Verified, nil
}
