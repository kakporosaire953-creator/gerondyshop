# Gérondy Shop

Application complète avec frontend statique et backend Node.js + MongoDB.

## Installation

1. Copier `.env.example` en `.env`.
2. Installer les dépendances :

```bash
npm install
```

3. Lancer le serveur :

```bash
npm start
```

4. Ouvrir dans le navigateur via le serveur :

```
http://localhost:3000
```

> Important : n'ouvrez pas les fichiers HTML directement avec `file://` si vous voulez tester l'API. Le site doit être servi par le backend pour que `/api/...` fonctionne correctement.

## Fonctionnalités

- Création de compte utilisateur
- Connexion avec authentification JWT
- Stockage des utilisateurs dans MongoDB
- API de messagerie
- API de demandes concierge
- Pages statiques existantes (`index.html`, `privacy.html`, `terms.html`, `loading.html`, `seller-dashboard.html`)

## Configuration

- `MONGODB_URI` : adresse de la base MongoDB
- `JWT_SECRET` : clé secrète pour les tokens
- `PORT` : port du serveur Express

### Email / SMTP (optionnel)

Pour activer l'envoi d'emails (notifications des demandes concierge, export CSV automatique), copiez `.env.example` en `.env` et remplissez les variables SMTP :

- `SMTP_HOST` - hôte SMTP (ex: smtp.sendgrid.net)
- `SMTP_PORT` - port (ex: 587)
- `SMTP_USER` - utilisateur SMTP (ex: `apikey` pour SendGrid)
- `SMTP_PASS` - mot de passe / clé API
- `SMTP_FROM` - adresse expéditrice (optionnel)
- `SMTP_SECURE` - `true` si TLS (ex: 465), sinon `false`
- `ADMIN_EMAIL` - adresse destinataire pour les notifications (par défaut schekinacamille@gmail.com)

Exemples rapides :

PowerShell - installer et lancer :
```powershell
npm install
npm start
```

Tester l'envoi d'une notification (si SMTP configuré) :

```powershell
curl -X POST http://localhost:3000/api/notify -H "Content-Type: application/json" -d '{"to":"schekinacamille@gmail.com","subject":"Test","text":"Ceci est un test depuis Gérondy Shop"}'
```

Si SMTP n'est pas configuré, le serveur journalisera les notifications et le frontend ouvrira un lien `mailto:` comme solution de secours.
