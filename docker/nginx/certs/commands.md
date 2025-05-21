Um ein SSL Zertifikat zu generieren muss man folgenden Befehl ausführen:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout docker/nginx/certs/selfsigned.key -out docker/nginx/certs/selfsigned.crt -config docker/nginx/certs/san.cnf -extensions v3_req
```