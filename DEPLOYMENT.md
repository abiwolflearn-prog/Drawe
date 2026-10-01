# DEPLOYMENT

## Environments
- Development
- Staging
- Production

## Environment variables
### Backend
DATABASE_URL
JWT_SECRET or session secret
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
FRONTEND_URL
PAYMENT_ACCOUNT_DISPLAY_DATA
CLOUDINARY credentials if screenshots are stored

### Frontend
VITE_API_URL

Never commit .env files.

## Production checklist
- [ ] HTTPS
- [ ] Production database
- [ ] Database backup
- [ ] CORS configured
- [ ] Secure cookies
- [ ] Telegram webhook configured
- [ ] Logs enabled
- [ ] Error monitoring
- [ ] Rate limiting
- [ ] Admin account secured
- [ ] Smoke tests passed
