package config

import "github.com/kelseyhightower/envconfig"

// New returns an instance of Config
func New() (*Config, error) {
	var conf Config

	err := envconfig.Process("ORGID_RESOLVER", &conf)
	return &conf, err
}
