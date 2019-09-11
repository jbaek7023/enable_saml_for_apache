# apache-saml2

Create image
docker build -t webserver_img .

Create container
docker run -i -t -d -p 8443:80 --name=webserver_con webserver_img

Check container status
docker ps

Test
curl -I 127.0.0.1:8443

whole command:

docker build -t opengrok . && docker run -i -t -d -p 8443:80 --name=webserver_con opengrok

docker ps
