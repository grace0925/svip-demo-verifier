package db

const USERDB = "user-info"
const WALLETACCOUNT = "wallet-account"
const ISSUERACCOUNT = "issuer-account"
const WALLETDBPREFIX = "userwallet$"

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
	Created            string `json:"created,omitempty"`
	Jws                string `json:"jws,omitempty"`
	ProofPurpose       string `json:"proofPurpose,omitempty"`
	Type               string `json:"type,omitempty"`
	VerificationMethod string `json:"verificationMethod,omitempty"`
}

type CredentialStatus struct {
	ID   string `json:"id, omitempty"`
	Type string `json:"type, omitempty"`
}

type UserInfoDB struct {
	Rev               string              `json:"_rev,omitempty"`
	SessionId         string              `json:"sessionId,omitempty"`
	IssuanceDate      string              `json:"issuanceDate,omitempty"`
	ExpirationDate    string              `json:"expirationDate,omitempty"`
	CredentialSubject CredentialSubjectDB `json:"credentialSubject,omitempty"`
	DID               string              `json:"did,omitempty"`
}

type VerifiableCredentialDB struct {
	FriendlyName      string              `json:"friendlyName,omitempty"`
	Rev               string              `json:"_rev,omitempty"`
	Context           []string            `json:"@context,omitempty"`
	CredentialStatus  CredentialStatus    `json:"credentialStatus,omitempty"`
	CredentialSubject CredentialSubjectDB `json:"credentialSubject"`
	Description       string              `json:"description,omitempty"`
	ExpirationDate    string              `json:"expirationDate,omitempty"`
	ID                string              `json:"id,omitempty"`
	IssuanceDate      string              `json:"issuanceDate,omitempty"`
	Issuer            string              `json:"issuer,omitempty"`
	Name              string              `json:"name,omitempty"`
	Proof             CredentialProof     `json:"proof"`
	Type              []string            `json:"type"`
}

type Issuer struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

type AccountDB struct {
	Username   string `json:"username,omitempty"`
	Password   string `json:"password,omitempty"`
	DID        string `json:"did,omitempty"`
	PrivateKey string `json:"privateKey,omitempty"`
}
