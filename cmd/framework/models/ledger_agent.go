package models

// LedgerAgents is a struct containing an array of LedgerAgent structs
type LedgerAgents struct {
	LedgerAgent []LedgerAgent `json:"ledgerAgent"`
}

// LedgerAgent is a struct containing the ID of a Ledger Agent
type LedgerAgent struct {
	ID string `json:"id"`
}
