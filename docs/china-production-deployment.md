# China Production Deployment

This runbook deploys BandMate AI on a mainland China Linux server. It is designed for a small MVP and uses Docker, Nginx, HTTPS, Supabase, and the existing server-side AI routes.

## Architecture

```text
User browser
  -> filed custom domain (HTTPS)
  -> Tencent Cloud / Alibaba Cloud CVM or Lighthouse (mainland China)
  -> Nginx (TLS, upload limit, reverse proxy)
  -> Docker: Next.js on 127.0.0.1:3000
  -> Supabase + AI provider APIs
```

## Decisions to complete first

1. Register a domain with real-name verification and complete the provider's ICP filing flow before serving the public production site from mainland China.
2. Create a mainland China Tencent Cloud Lighthouse or CVM instance. For the MVP, choose Ubuntu 24.04 LTS, at least 2 vCPU and 4 GB RAM, with a public IPv4 address.
3. Open the server security-group ports `80` and `443` only. Do not expose port `3000` publicly.
4. Add an `A` record for the root domain and `www` that points to the server's public IPv4 address. Wait until DNS resolves before issuing a certificate.

## Server preparation

Connect to the server through SSH, then install Docker, Compose, Nginx, and Certbot using your cloud provider's current Ubuntu instructions. Confirm these commands work:

```bash
docker --version
docker compose version
nginx -v
certbot --version
```

Clone the GitHub repository outside the web root:

```bash
sudo mkdir -p /opt/bandmate-ai
sudo chown "$USER":"$USER" /opt/bandmate-ai
git clone https://github.com/yanzhisun168/IELStars.git /opt/bandmate-ai
cd /opt/bandmate-ai
```

## Production environment

Create the production environment file on the server only:

```bash
cp deploy/env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

Fill in the real Supabase and AI credentials. Do not paste this file into GitHub, chat, or a browser form. The file is ignored by Git.

## Start the application

```bash
cd /opt/bandmate-ai
docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml ps
curl -I http://127.0.0.1:3000
```

The container only listens on `127.0.0.1:3000`; Nginx is the public entry point.

## Configure Nginx and HTTPS

Copy the template and replace `example.com` with the actual domain:

```bash
sudo cp deploy/nginx/bandmate.conf.example /etc/nginx/sites-available/bandmate
sudo nano /etc/nginx/sites-available/bandmate
sudo ln -s /etc/nginx/sites-available/bandmate /etc/nginx/sites-enabled/bandmate
sudo nginx -t
sudo systemctl reload nginx
```

After the domain resolves to this server, issue the certificate. Replace the two domains below with the actual ones:

```bash
sudo certbot --nginx -d example.com -d www.example.com --redirect
```

Confirm certificate renewal is active:

```bash
sudo systemctl status certbot.timer
```

## Release updates

For each approved GitHub update:

```bash
cd /opt/bandmate-ai
git pull --ff-only origin main
docker compose -f docker-compose.production.yml up -d --build
docker image prune -f
```

## Critical China-access check

The web server can be in mainland China while its upstream AI services are elsewhere. Test these separately after deployment:

1. Load the home page using China Mobile, China Unicom, and China Telecom networks.
2. Register and sign in with a new test user.
3. Record a short answer and upload it.
4. Confirm Supabase reads/writes work.
5. Confirm transcription and feedback complete.

Gemini availability from a mainland server can be unreliable. If the audio routes cannot reach Gemini consistently, keep the UI and database on the mainland server but move transcription/evaluation to a provider that is reachable from the server. A domestic ASR provider plus DeepSeek for text feedback is the practical fallback. Do not attempt to solve this by exposing API keys in the browser.

## Go-live checklist

- [ ] ICP filing approved and the filing number displayed in the site footer when required.
- [ ] Domain resolves to the mainland server.
- [ ] HTTPS is valid for both root and `www` domains.
- [ ] Vercel Authentication is disabled or the Vercel project is no longer the public production entry point.
- [ ] `.env.production` exists only on the server and is permission-restricted.
- [ ] Supabase redirect URLs include `https://your-domain.example`.
- [ ] Browser, registration, recording, history, dashboard, transcription, and feedback are tested on a mainland network.
