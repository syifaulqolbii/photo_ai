# Deploy Guide

## 1. Update Next.js config for standalone

Add to `next.config.ts`:
```ts
output: "standalone",
```

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/photoai.git
git push -u origin main
```

## 3. VPS Setup

SSH to VPS:
```bash
git clone https://github.com/yourusername/photoai.git
cd photoai
cp .env.example .env.production
nano .env.production  # Fill all values
```

## 4. Docker Build + Run

```bash
docker compose up -d --build
```

## 5. Nginx Reverse Proxy

```bash
sudo cp nginx/photobooth.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/photobooth.conf /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-enabled/photobooth.conf  # Replace yourdomain.com
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL via Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Done. App runs at https://yourdomain.com
