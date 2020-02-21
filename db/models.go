package db

const USERDB = "user_info"
const WALLET = "vc_wallet"

type CredentialSubjectDB struct {
	ID                     string   `json:"id,omitempty"`
	Type                   []string `json:"type,omitempty"`
	GivenName              string   `json:"givenName,omitempty"`
	FamilyName             string   `json:"familyName,omitempty"`
	Gender                 string   `json:"gender,omitempty"`
	Image                  string   `json:"image,omitempty"`
	ResidentSince          string   `json:"residentSince,omitempty"`
	LPRCategory            string   `json:"lprCategory,omitempty"`
	LPRNumber              string   `json:"lprNumber,omitempty"`
	CommuterClassification string   `json:"commuterClassification,omitempty"`
	BirthCountry           string   `json:"birthCountry,omitempty"`
	BirthDate              string   `json:"birthDate,omitempty"`
}

type CredentialProof struct {
	Created    string `json:"created,omitempty"`
	Creator    string `json:"creator,omitempty"`
	Domain     string `json:"domain,omitempty"`
	Nonce      string `json:"nonce,omitempty"`
	ProofValue string `json:"proofValue,omitempty"`
	Type       string `json:"type,omitempty"`
}

type UserInfoDB struct {
	Rev               string              `json:"_rev,omitempty"`
	SessionId         string              `json:"sessionId,omitempty"`
	IssuanceDate      string              `json:"issuanceDate,omitempty"`
	ExpirationDate    string              `json:"expirationDate,omitempty"`
	CredentialSubject CredentialSubjectDB `json:"credentialSubject,omitempty"`
}

type PermanentResidentCardDB struct {
	FriendlyName      string              `json:"friendlyName,omitempty"`
	Rev               string              `json:"_rev,omitempty"`
	Context           []string            `json:"@context,omitempty"`
	CredentialSchema  []string            `json:"credentialSchema,omitempty"`
	ID                string              `json:"id,omitempty"`
	Type              []string            `json:"type,omitempty"`
	Issuer            Issuer              `json:"issuer,omitempty"`
	IssuanceDate      string              `json:"issuanceDate,omitempty"`
	ExpirationDate    string              `json:"expirationDate,omitempty"`
	CredentialSubject CredentialSubjectDB `json:"credentialSubject,omitempty"`
	Proof             CredentialProof     `json:"proof,omitempty"`
}

type Issuer struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}