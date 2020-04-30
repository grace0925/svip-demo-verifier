package did

import (
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ed25519"
	"strings"
	"time"
)

const KEYTYPE = "Ed25519Signature2018"
const PRESENTATIONTYPE = "VerifiablePresentation"
const PROOFPURPOSE = "authentication"

type VerifyDidAuthPresentationRequest struct {
	DidAuthPresentation DidAuthPresentation `json:"didAuthPresentation"`
}

type KeyPairs struct {
	PublicKey     ed25519.PublicKey  `json:"publicKey,omitempty"`
	PrivateKey    ed25519.PrivateKey `json:"privateKey,omitempty"`
	PublicKeyStr  string             `json:"publicKeyStr,omitempty"`
	PrivateKeyStr string             `json:"privateKeyStr,omitempty"`
}

type Proof struct {
	Type               string     `json:"type,omitempty"`
	Created            *time.Time `json:"created,omitempty"`
	JWS                string     `json:"jws,omitempty"`
	ProofPurpose       string     `json:"proofPurpose,omitempty"`
	Domain             string     `json:"domain,omitempty"`
	Challenge          string     `json:"challenge,omitempty"`
	VerificationMethod string     `json:"verificationMethod,omitempty"`
}

type DidAuthPresentation struct {
	Context []string `json:"@context,omitempty"`
	Type    string   `json:"type,omitempty"`
	Holder  string   `json:"holder,omitempty"`
	Proof   Proof    `json:"proof,omitempty"`
}

func FormatJWS(serializedStr string) string {
	log.Println("original str => ", serializedStr)
	stringArr := strings.Split(serializedStr, ",")
	log.Println("separated strings => ", stringArr)
	headerArr := strings.Split(stringArr[1], ":")
	log.Println("separated header => ", headerArr)
	payloadArr := strings.Split(stringArr[0], ":")
	log.Println("separated payload => ", payloadArr)
	signatureArr := strings.Split(stringArr[2], ":")
	log.Println("separated sig => ", signatureArr)

	jwsHeader := strings.TrimSuffix(headerArr[1], "\"")
	jwsHeader = strings.TrimPrefix(jwsHeader, "\"")
	log.Println("header => ", jwsHeader)
	jwsPayload := strings.TrimSuffix(payloadArr[1], "\"")
	jwsPayload = strings.TrimPrefix(jwsPayload, "{")
	jwsPayload = strings.TrimPrefix(jwsPayload, "\"")
	log.Println("payload => ", jwsPayload)
	jwsSignature := strings.TrimSuffix(signatureArr[1], "\"}")
	jwsSignature = strings.TrimPrefix(jwsSignature, "{")
	jwsSignature = strings.TrimPrefix(jwsSignature, "\"")
	log.Println("sig => ", jwsSignature)

	log.Println("--------------------jws concatenated-----------------------")
	jws := jwsHeader + "." + jwsPayload + "." + jwsSignature
	log.Println(jws)
	return jws
}

func UnformatJWS(jwsStr string) string {
	a := strings.Split(jwsStr, ".")
	b := "{" + "\"" + "payload" + "\"" + ":" + "\"" + a[1] + "\""
	c := "," + "\"" + "protected" + "\"" + ":" + "\"" + a[0] + "\""
	d := "," + "\"" + "signature" + "\"" + ":" + "\"" + a[2] + "\"" + "}"
	log.Println("------------------unformatted jws---------------")
	e := b + c + d
	log.Println(e)
	return e
}
