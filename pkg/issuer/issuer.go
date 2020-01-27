package issuer

import (
	"time"

	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
)

// USCISSubject is a struct containing information about someone going through customs
type USCISSubject struct {
	ID          string
	Name        string
	Citizenship string
	PassportID  string
}

// USCISVerifiableCredential is the base struct used to represent a USCIS-issued VC
type USCISVerifiableCredential struct {
	*verifiable.Credential
}

// ExampleCustomsUSCISVC returns a generic USCIS Verifiable Credential with fluff information
func ExampleCustomsUSCISVC() (*verifiable.Credential, error) {

	now, _ := time.Parse(time.UnixDate, time.Now().String())

	vc := USCISVerifiableCredential{
		Credential: &verifiable.Credential{
			Context: []string{
				"https://www.w3.org/2018/credentials/v1",
				"https://www.w3.org/2018/credentials/examples/v1",
			},
			ID: "did:uscis:12345",
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
				ID:          "did:example:11235",
				Name:        "Grace Liu",
				Citizenship: "Canadian",
			},
			Schemas: []verifiable.TypedID{},
		},
	}

	var opts []verifiable.CredentialOpt
	vcJSON, _ := vc.MarshalJSON()
	return verifiable.NewCredential(vcJSON, opts...)

}
