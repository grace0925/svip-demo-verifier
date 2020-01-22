package issuer

import (
	"time"

	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
)

// USCISSubject is a struct containing information about the subject of a USCIS-issued VC
type USCISSubject struct {
	ID      string
	Name    string
	Address string
}

// USCISVerifiableCredential is the base struct used to represent a USCIS-issued VC
type USCISVerifiableCredential struct {
	*verifiable.Credential
}

// ExampleNewUSCISVC1 returns a generic USCIS Verifiable Credential with fluff information
func ExampleNewUSCISVC1() *USCISVerifiableCredential {

	now := time.Now()

	return &USCISVerifiableCredential{
		Credential: &verifiable.Credential{
			Context: []string{
				"https://www.w3.org/2018/credentials/v1",
				"https://www.w3.org/2018/credentials/examples/v1",
			},
			ID: "did:example:12345",
			Types: []string{
				"VerifiableCredential",
				"USCISVerifiableCredential",
			},
			Issuer: verifiable.Issuer{
				ID:   "did:example:67890",
				Name: "Amod",
			},
			Issued: &now,
			Subject: USCISSubject{
				ID:      "did:uscis:11235",
				Name:    "Grace Liu",
				Address: "200 University Ave W",
			},
		},
	}

}
