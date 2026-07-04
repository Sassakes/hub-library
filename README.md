# The Hub · Library

Bibliothèque perso pour héberger et organiser tes fichiers `.html` (masterclass, dashboards, explainers…). Page publique avec menu par catégories + panel admin protégé par mot de passe.

**Stack :** Next.js 14 (App Router) · Vercel Blob (stockage fichiers + manifest) · zéro base de données.

---

## Identifiants générés

- **URL admin :** `/admin`
- **Mot de passe :** `h6XEif5ZwwxalpXGhCQEUTbd`

⚠️ Le mot de passe n'est jamais stocké en clair : seul son hash SHA-256 est dans les variables d'environnement. Change-le si tu veux (voir plus bas).

---

## Déploiement sur Vercel (5 min)

1. **Push le projet sur GitHub** (repo privé recommandé).
2. Sur [vercel.com](https://vercel.com) → **Add New Project** → importe le repo. Framework détecté : Next.js, rien à changer.
3. **Storage → Create Database → Blob** → attache le store au projet. La variable `BLOB_READ_WRITE_TOKEN` est injectée automatiquement.
4. **Settings → Environment Variables**, ajoute :
   - `ADMIN_PASSWORD_HASH` = `325eed9141f5905c7db8813e6c1ddf3a2edd50178f86ffba829144d0893f3875`
   - `SESSION_SECRET` = `5b5dd9f8ee739cf53ec96fb29fe06aeef324367613f0572836fc8191364e4bac`
5. **Deploy**. C'est en ligne.

## En local

```bash
npm install
cp .env.example .env.local   # puis colle ton BLOB_READ_WRITE_TOKEN dedans
npm run dev
```

Le token Blob se récupère dans Vercel → Storage → ton store → onglet `.env.local`.

---

## Changer le mot de passe

```bash
echo -n "TonNouveauMotDePasse" | sha256sum
```

Colle le hash obtenu dans `ADMIN_PASSWORD_HASH` (Vercel → Env Variables) et redéploie.

Pour régénérer un `SESSION_SECRET` :

```bash
openssl rand -hex 32
```

---

## Fonctionnalités

**Public (`/`)**
- Sidebar avec catégories + compteurs, filtre par catégorie
- Grille de cartes (titre, date, taille)
- Viewer plein écran (`/view/[slug]`) en iframe sandboxée

**Admin (`/admin`)**
- Login par mot de passe, session signée HMAC (cookie httpOnly, 12h)
- Upload multiple par drag & drop (`.html` / `.htm`, max 8 Mo/fichier), catégorie cible au choix
- Catégories : créer, renommer, supprimer, réordonner (↑↓)
- Documents : renommer, changer de catégorie, réordonner (↑↓), supprimer, ouvrir

## Sécurité — ce que ça couvre (et pas)

✅ Hash du mot de passe côté serveur (comparaison à temps constant), cookie de session signé HMAC httpOnly/sameSite strict, rate-limit sur le login (5 essais / 10 min par IP, best-effort en serverless), routes admin toutes protégées.

⚠️ Limites connues :
- Les fichiers sur Vercel Blob sont en accès "public" (URLs non devinables mais pas d'auth dessus). Le manifest est aussi lisible si quelqu'un connaît l'URL exacte du store. Pour du contenu vraiment sensible, il faudrait passer sur un stockage privé (S3 + URLs signées).
- Mono-utilisateur par design. Pas de 2FA.

Pour ton usage (héberger des explainers HTML), c'est largement suffisant.

## Structure

```
app/
  page.js                 → page publique
  view/[slug]/page.js     → viewer iframe
  admin/page.js           → panel admin (client)
  api/
    auth/login, logout    → session
    admin/upload          → upload multipart
    admin/manifest        → GET/PUT organisation (catégories, ordre, titres)
    admin/docs/[slug]     → DELETE document
    raw/[slug]            → sert le HTML brut
lib/
  session.js              → HMAC cookie + check password
  store.js                → Vercel Blob (manifest + fichiers)
```
