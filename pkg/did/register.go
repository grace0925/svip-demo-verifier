package did

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"golang.org/x/crypto/ed25519"
	"io/ioutil"
	"net/http"
)

const ED25519VERIFICATIONKEY2018 = "Ed25519VerificationKey2018"
const ED25519 = "Ed25519"
const JWK = "Jwk"
const KEYIDDEFAULT = "key-1"
const KEYIDRECOVERY = "key-2"

type RegisterDIDReq struct {
	JobID       string      `json:"jobId,omitempty"`
	DIDDocument DIDDocument `json:"didDocument,omitempty"`
}

type DIDDocument struct {
	PublicKey []*PublicKey `json:"publicKey,omitempty"`
	Service   []*Service   `json:"service,omitempty"`
}

type PublicKey struct {
	ID       string   `json:"id,omitempty"`
	Type     string   `json:"type,omitempty"`
	Value    string   `json:"value,omitempty"`
	Usage    []string `json:"usage,omitempty"`
	Encoding string   `json:"encoding,omitempty"`
	Recovery bool     `json:"recovery,omitempty"`
	KeyType  string   `json:"keyType,omitempty"`
}

type Service struct {
	ID              string   `json:"id,omitempty"`
	Type            string   `json:"type,omitempty"`
	Priority        uint     `json:"priority,omitempty"`
	RecipientKeys   []string `json:"recipientKeys,omitempty"`
	RoutingKeys     []string `json:"routingKeys,omitempty"`
	ServiceEndpoint string   `json:"serviceEndpoint,omitempty"`
}

type RegisterResponse struct {
	JobID             string                 `json:"jobId,omitempty"`
	DIDState          DIDState               `json:"didState,omitempty"`
	RegistrarMetadata map[string]interface{} `json:"registrarMetadata"`
	MethodMetadata    map[string]interface{} `json:"methodMetadata"`
}

type DIDState struct {
	Identifier string `json:"identifier,omitempty"`
	Reason     string `json:"reason,omitempty"`
	State      string `json:"state,omitempty"`
	Secret     Secret `json:"secret,omitempty"`
}

type Secret struct {
	Keys []Key `json:"keys,omitempty"`
}

type Key struct {
	PublicKeyBase58  string `json:"publicKeyBase58,omitempty"`
	PrivateKeyBase58 string `json:"privateKeyBase58,omitempty"`
	PublicKeyDIDURL  string `json:"id,omitempty"`
}

// calls trusbloc sandbox registrar to register DID, function returns registered DID and private key
func RegisterDID() (string, ed25519.PrivateKey, error) {
	// generate ed25519 key pair
	pubKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		log.Error("failed to generate public key", err)
		return "", nil, err
	}

	// use uuid as job id
	UUID := uuid.New()
	uuidStr := UUID.String()

	registerReq := RegisterDIDReq{
		JobID: uuidStr,
		DIDDocument: DIDDocument{
			PublicKey: []*PublicKey{
				{ID: KEYIDDEFAULT, Type: ED25519VERIFICATIONKEY2018, Value: base64.StdEncoding.EncodeToString(pubKey),
					Encoding: JWK, KeyType: ED25519, Usage: []string{"general", "auth"}},
				{ID: KEYIDRECOVERY, Type: ED25519VERIFICATIONKEY2018, Value: base64.StdEncoding.EncodeToString(pubKey),
					Encoding: JWK, KeyType: ED25519, Recovery: true},
			},
			Service: []*Service{
				{ID: "service", Type: "service-type", ServiceEndpoint: "http://www.example.com"},
			},
		},
	}

	requestBytes, err := json.Marshal(registerReq)
	if err != nil {
		log.Error("error marshalling register did request ", err)
		return "", nil, err
	}

	initConfig()
	registrarHost := viper.GetString("registrar.host")

	// call sandbox registrar to create/register new did
	reqURL := "https://" + registrarHost + "/1.0/register?driverId=driver-did-method-rest"
	req, err := http.NewRequest("POST", reqURL, bytes.NewBuffer(requestBytes))
	if err != nil {
		log.Error("error creating new request ", err)
		return "", nil, err
	}

	client := http.Client{}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Error("error executing request ", err)
		return "", nil, err
	}

	data, _ := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()
	did := ""

	if resp.StatusCode == 200 {
		registerResp := RegisterResponse{}
		err = json.Unmarshal(data, &registerResp)
		if err != nil {
			log.Error("error unmarshalling register response ", err)
			return "", nil, err
		}

		log.Printf("register response => %+v", registerResp)
		did = registerResp.DIDState.Identifier

		return did, privateKey, nil
	} else {
		log.Error("error registering new did")
		return did, nil, errors.New("error registering new did")
	}
}
