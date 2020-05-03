package vc

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"strings"
	"time"
)

const IssuerContext = "https://www.w3.org/2018/credentials/v1"
const IssuerContextCitizenship = "https://w3id.org/citizenship/v1"
const VCTypeVerifiableCredential = "VerifiableCredential"
const VCTypePermanentResidentCard = "PermanentResidentCard"
const VCSubjectTypePermanentResident = "PermanentResident"
const VCSubjectTypePerson = "Person"
const IDPermanentResidentCard = "https://issuer.oidp.uscis.gov/credentials/83627465"
const NamePermanentResidentCard = "Permanent Resident Card"

type IssueCredentialRequest struct {
	Credential Credential `json:"credential"`
	Options    Options    `json:"options,omitempty"`
}

type Credential struct {
	Context           []string               `json:"@context"`
	ID                string                 `json:"id"`
	Type              []string               `json:"type"`
	Name              string                 `json:"name,omitempty"`
	Description       string                 `json:"description,omitempty"`
	Issuer            string                 `json:"issuer,omitempty"`
	IssuanceDate      string                 `json:"issuanceDate,omitempty"`
	ExpirationDate    string                 `json:"expirationDate,omitempty"`
	CredentialSubject db.CredentialSubjectDB `json:"credentialSubject,omitempty"`
}

type Options struct {
	VerificationMethod string `json:"verificationMethod,omitempty"`
}

func GenerateVC(userInfo db.UserInfoDB, profileName string, issuerDID string, walletDID string) (db.VerifiableCredentialDB, error) {

	initConfig()

	vcsHost := viper.GetString("issuer.host")

	credReqURL := "https://" + vcsHost + "/" + profileName + "/credentials/issueCredential"

	var vc db.VerifiableCredentialDB
	var data []byte

	issuanceDate := time.Now().Format(time.RFC3339)
	expirationDate := time.Now().AddDate(10, 0, 0).Format(time.RFC3339)
	verificationMethod := issuerDID + "#key-1"

	log.Info("Generating VC")
	issueVCReq := IssueCredentialRequest{
		Credential: Credential{Context: []string{IssuerContext, IssuerContextCitizenship},
			Type: []string{VCTypeVerifiableCredential, VCTypePermanentResidentCard}, ID: IDPermanentResidentCard,
			Name: NamePermanentResidentCard, Description: NamePermanentResidentCard, Issuer: issuerDID,
			IssuanceDate: issuanceDate, ExpirationDate: expirationDate,
			CredentialSubject: db.CredentialSubjectDB{ID: walletDID, Type: []string{VCSubjectTypePermanentResident, VCSubjectTypePerson},
				GivenName: userInfo.CredentialSubject.GivenName, FamilyName: userInfo.CredentialSubject.FamilyName,
				Gender: userInfo.CredentialSubject.Gender, Image: userInfo.CredentialSubject.Image,
				ResidentSince: userInfo.CredentialSubject.ResidentSince, LPRCategory: userInfo.CredentialSubject.LPRCategory,
				LPRNumber: userInfo.CredentialSubject.LPRNumber, CommuterClassification: userInfo.CredentialSubject.CommuterClassification,
				BirthCountry: userInfo.CredentialSubject.BirthCountry, BirthDate: userInfo.CredentialSubject.BirthDate},
		},
		Options: Options{
			VerificationMethod: verificationMethod,
		},
	}

	requestBytes, err := json.Marshal(issueVCReq)
	if err != nil {
		log.Error("marshal cred request json error => ", err)
		return vc, err
	}

	req, err := http.NewRequest("POST", credReqURL, bytes.NewBuffer(requestBytes))
	if err != nil {
		log.Error("create cred request error => ", err)
		return vc, err
	}

	req.Header.Set("Content-Type", "application/json")
	client := http.Client{}
	resp, err := client.Do(req)
	data, _ = ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("create credential error => ", data, err)
		return vc, err
	}
	log.Print("create credential response => ", string(data))

	defer resp.Body.Close()

	if err := json.Unmarshal(data, &vc); err != nil {
		log.Error("marshal cred response json error => ", err)
		return vc, err
	} else {
		log.Info("credential json => ", vc)
		log.Info("successfully generated vc")
	}
	return vc, nil
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
