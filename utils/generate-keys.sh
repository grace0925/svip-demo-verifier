echo "Generating SSL certificates"

cd ..
mkdir -p keys/tls
cd keys/tls

base=$USER
new_path="/home/"$base"/.rnd"

openssl rand -out $new_path -hex 256
openssl genrsa -out localhost.key 2048
openssl req -new -x509 -sha256 -key localhost.key -out localhost.crt -days 3650 -subj "/C=CA/ST=TORONTO/L=WHAT/O=SECUREKEY/OU=SVIP/CN=localhost"

echo "Finished generating SSL certificates"