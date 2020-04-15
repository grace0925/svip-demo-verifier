package vc

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"net/http"
)

type VerifyResponse struct {
	Verified bool   `json:"verified"`
	Message  string `json:"message"`
}

func VerifyVC(client *http.Client, vc interface{}) (bool, error) {
	initConfig()

	vcsHost := viper.GetString("rp.host")
	vcsPort := viper.GetString("rp.port")

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
