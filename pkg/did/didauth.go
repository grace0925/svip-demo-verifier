package did

import (
	"golang.org/x/crypto/ed25519"
	"time"
)

const KEYTYPE = "Ed25519Signature2018"
const PRESENTATIONTYPE = "VerifiablePresentation"
const PROOFPURPOSE = "authentication"

type VerifyDidAuthPresentationRequest struct {
	DidAuthPresentation DidAuthPresentation `json:"didAuthPresentation"`
}

type KeyPairs struct {
	PublicKey    ed25519.PublicKey  `json:"publicKey,omitempty"`
	PrivateKey   ed25519.PrivateKey `json:"privateKey,omitempty"`
	PublicKey58  string             `json:"publicKey58,omitempty"`
	PrivateKey58 string             `json:"privateKey58,omitempty"`
	PublicKey64  string             `json:"publicKey64,omitempty"`
	PrivateKey64 string             `json:"privateKey64,omitempty"`
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
