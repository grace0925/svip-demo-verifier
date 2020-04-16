echo "Generating SSL certificates"
cd ..
mkdir -p keys/tls
base=$USER
new_path="/home/"$base"/.rnd"
localhostSSLConf=$(mktemp)
echo "subjectKeyIdentifier=hash
authorityKeyIdentifier = keyid,issuer
extendedKeyUsage = serverAuth
keyUsage = Digital Signature, Key Encipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = testnet.trustbloc.local
DNS.3 = stakeholder.one
DNS.4 = sidetree-mock" >> "$localhostSSLConf"
trustblocSSLConf=$(mktemp)
echo "subjectKeyIdentifier=hash
authorityKeyIdentifier = keyid,issuer
extendedKeyUsage = serverAuth
keyUsage = Digital Signature, Key Encipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = *.trustbloc.local" >> "$trustblocSSLConf"
CERT_CA="keys/tls/trustbloc-dev-ca.crt"
if [ ! -f "$CERT_CA" ]; then
    echo "Generating CA cert"
    openssl ecparam -name prime256v1 -genkey -noout -out keys/tls/trustbloc-dev-ca.key
    openssl req -new -x509 -key keys/tls/trustbloc-dev-ca.key -subj "/C=CA/ST=ON/O=TrustBloc/OU=Trusbloc Dev CA" -out keys/tls/trustbloc-dev-ca.crt -days 1095
else
    echo "Skipping CA generation - already exists"
fi
openssl ecparam -name prime256v1 -genkey -noout -out keys/tls/localhost.key
openssl req -new -key keys/tls/localhost.key -subj "/C=CA/ST=ON/O=TrustBloc/OU=trustbloc-edge-sandbox/CN=localhost" -out keys/tls/localhost.csr
openssl x509 -req -in keys/tls/localhost.csr -CA keys/tls/trustbloc-dev-ca.crt -CAkey keys/tls/trustbloc-dev-ca.key -CAcreateserial -extfile "$localhostSSLConf" -out keys/tls/localhost.crt -days 365
openssl ecparam -name prime256v1 -genkey -noout -out keys/tls/trustbloc.local.key
openssl req -new -key keys/tls/trustbloc.local.key -subj "/C=CA/ST=ON/O=TrustBloc/OU=trustbloc-edge-sandbox/CN=trustbloc.local" -out keys/tls/trustbloc.local.csr
openssl x509 -req -in keys/tls/trustbloc.local.csr -CA keys/tls/trustbloc-dev-ca.crt -CAkey keys/tls/trustbloc-dev-ca.key -CAcreateserial -extfile "$trustblocSSLConf" -out keys/tls/trustbloc.local.crt -days 365
echo "Finished generating SSL certificates"