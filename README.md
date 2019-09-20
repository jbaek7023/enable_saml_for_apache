# Enable SAML for Apache in Ubuntu 16.04 Docker container
Open two terminals for IdP and SP.

## Run Mock IdP
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
$ docker build -t sp . && docker run -it -p 8446:80 sp
```

## Test SP in Mock IdP.

1. Open `localhost:8446` on your browser.
2. Go to `localhost:8446/secret/endpoint`
3. You will be redirected to IdP (port 8380)
5. Username/Passwords are `user1`/`user1pass`
6. You will be redirected to SP - This means your SAML/SSO is working.

## Test CodeSearch Integration

1. Coming Soon.

## Roll-Out/Roll-Back Plan

coming soon
