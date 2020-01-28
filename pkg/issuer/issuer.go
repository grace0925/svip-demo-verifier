package main

import (
	"time"
)

type PermanentResidentCard struct {
	Context           []string          `json:"@context,omitempty"`
	ID                string            `json:"@id,omitempty"`
	Type              []string          `json:"type,omitempty"`
	Issuer            string            `json:"issuer,omitempty"`
	IssuanceDate      string            `json:"issuancedate,omitempty"`
	ExpirationDate    string            `json:"expirationdate,omitempty"`
	CredentialSubject credentialsubject `json:"credentialSubject,omitempty"`
}

type credentialsubject struct {
	ID             string `json:"id,omitempty"`
	Type           string `json:"type,omitempty"`
	GivenName      string `json:"givenName,omitempty"`
	FamilyName     string `json:"familyName,omitempty"`
	Gender         string `json:"gender,omitempty"`
	Image          string `json:"image,omitempty"`
	ResidentSince  string `json:"residentSince,omitempty"`
	LPRCategory    string `json:"lprCategory,omitempty"`
	LPRNumber      string `json:"lprNumber,omitempty"`
	BirthCountry   string `json:"birthCountry,omitempty"`
	BirthDate      string `json:"birthDate,omitempty"`
	MRZInformation string `json:"mrzInformation,omitempty"`
}

func (prc *PermanentResidentCard) Default() PermanentResidentCard {

	day, _ := time.ParseDuration("24h")

	return PermanentResidentCard{
		Context: []string{
			"https://www.w3.org/2018/credentials/v1",
			"https://w3id.org/citizenship/v1",
		},
		ID: "https://issuer.oidp.uscis.gov/credentials/83627465",
		Type: []string{
			"VerifiableCredential",
			"PermanentResidentCard",
		},
		Issuer:         "did:example:b34ca6cd37bbf23",
		IssuanceDate:   time.Now().Format("RFC3339"),
		ExpirationDate: time.Now().Add(day).Format("RFC3339"),
		CredentialSubject: credentialsubject{
			ID:            "did:example:b34ca6cd37bbf24",
			Type:          "Person",
			GivenName:     "Amod",
			FamilyName:    "Kala",
			Gender:        "Male",
			Image:         "",
			ResidentSince: "2000-10-04",
			LPRCategory:   "C09",
			LPRNumber:     "999-999-999",
			BirthCountry:  "Canada",
			BirthDate:     "2000-10-04",
			MRZInformation: `IAUSA0000007032SRC0000000703<<\n
							2001012M1105108BRA<<<<<<<<<<<5\n
							SPECIMEN<<TEST<VOID<<<<<<<<<<<`,
		},
	}
}

func main() {
}
