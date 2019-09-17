# Enable SAML for Apache in Ubuntu 16.04 Docker container
Open two terminals for IdP and SP.

## Run IdP
1. Pull Testable IdP environment
```bash
$ docker pull kristophjunge/test-saml-idp
```
2. Run IdP contianer in port 8080 and 8443
```bash
$ docker run --name=testsamlidp -p 8080:8080 -p 8443:8443 -e SIMPLESAMLPHP_SP_ENTITY_ID=urn:opengrok -e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:8446/login.html -d kristophjunge/test-saml-idp
```

## Run SP

1. Run SP container
```bash
$ docker build -t opengrok . && docker run -it -p 8446:80 opengrok
```
