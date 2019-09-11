FROM ubuntu:16.04

# Apache ENVs
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_PID_FILE /var/run/apache2/apache2.pid
ENV APACHE_SERVER_NAME localhost

# Install services, packages and do cleanup
#RUN apt-get update \
# && apt-get install -y \
#  apache2, libapache2-mod-auth-mellon, libapache2-modsecurity \
# && rm -rf /var/lib/apt/lists/*
# RUN a2enmod proxy_http proxy ssl rewrite auth_mellon security2


# Copy files
COPY apache-conf /etc/apache2/apache2.conf
COPY index.html /var/www/html/index.html

# Expose Apache
EXPOSE 8443

# Launch Apache
CMD ["/usr/sbin/apache2ctl", "-DFOREGROUND"]
