FROM ubuntu:16.04

ENV REMOTE_ADDR http://localhost:8080/simplesaml/saml2/idp/SSOService.php

# Install services, packages and do cleanup
RUN apt-get update
RUN apt-get install -y apache2 libapache2-mod-auth-mellon libapache2-modsecurity
# RUN rm -rf /var/lib/apt/lists/*

# Enable Apache Module
RUN a2enmod proxy_http proxy ssl rewrite auth_mellon security2

# Configure ModSecurity
ADD modsecurity.conf /etc/modsecurity/

# Modify the site (vhost) configuration
# /etc/apache2/sites-enabled
# COPY apache-conf /etc/apache2/apache2.conf
COPY 000-default.conf /etc/apache2/sites-enabled/000-default.conf

# Create SAML SP metadatta files (/etc/apache2/mellon/ > mellon_create_metadata.sh urn_myservicenname.cert urn_myservicenname.key urn_myservicenname.xml)
RUN mkdir -p /etc/apache2/mellon/
ADD mellon_create_metadata.sh /etc/apache2/mellon/

# Move Certs and Metadatas
# bash mellon_create_metadata.sh urn:myservicenname https://<YOURDOMAIN>/secret/endpoint
ADD urn_opengrok.cert /etc/apache2/mellon/
ADD urn_opengrok.key /etc/apache2/mellon/
ADD urn_opengrok.xml /etc/apache2/mellon/
ADD idp.xml /etc/apache2/mellon/

# Copy files (EXTRA)

ADD index.html /var/www/html/
ADD login.html /var/www/html/

# Expose Apache
EXPOSE 8443
EXPOSE 80

# Launch Apache
CMD ["/usr/sbin/apache2ctl", "-DFOREGROUND"]

# RUN COMMAND
# docker build -t opengrok . && docker run -it -p 8446:80 opengrok bash
