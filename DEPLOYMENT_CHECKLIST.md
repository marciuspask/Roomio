# Deployment Checklist

## Statusas
- [x] CI/CD workflow failai sukurti (`.github/workflows/`)
- [x] CI veikia GitHub Actions
- [x] Google Maps API raktas ištrauktas iš git
- [ ] Google Maps API raktas ištrintas / pakeistas Google Console
- [ ] Repo padaryta public (galima po aukščiau esančio žingsnio)
- [ ] Backend deployas į Cloud Run veikia
- [ ] Frontend deployas į Cloudflare Pages veikia
- [ ] Domenas prijungtas

---

## 1. CI ✅ Padaryta

- [x] Workflow failai sukurti ir pushinti
- [x] CI praeina GitHub Actions (backend lint + typecheck, frontend lint + typecheck + testai)

---

## 2. Repo paviešinimas (prieš tai — Google Maps raktas!)

- [ ] Eik į [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- [ ] Rask Google Maps API raktą ir **ištrink jį** (arba sukurk naują)
- [ ] Naują raktą išsaugok tik lokaliai į `frontend/.env.production` (jis nebėra git'e)
- [ ] Repo → **Settings → Danger Zone → Change visibility → Public**

---

## 3. Google Cloud setup

### Projektas
- [ ] Sukurk Google Cloud projektą → [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Įjunk billing
- [ ] Įdiek `gcloud` CLI: `brew install google-cloud-sdk`
- [ ] Prisijunk: `gcloud auth login`

### Artifact Registry
- [ ] Sukurk repository:
  ```
  gcloud artifacts repositories create roomio \
    --repository-format=docker \
    --location=europe-north1
  ```
- [ ] Sukonfigūruok Docker auth:
  ```
  gcloud auth configure-docker europe-north1-docker.pkg.dev
  ```

### Cloud Run
- [ ] Įjunk Cloud Run API Google Console
- [ ] Pirmą kartą deploy'insi rankiniu būdu (po to GitHub Actions darys automatiškai)

### Service Account (GitHub Actions naudos)
- [ ] Sukurk service account:
  ```
  gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions"
  ```
- [ ] Pridėk teises:
  ```
  gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

  gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

  gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
  ```
- [ ] Atsisiųsk JSON raktą:
  ```
  gcloud iam service-accounts keys create key.json \
    --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
  ```
- [ ] Išsaugok `key.json` turinį — reikės kaip GitHub secret (po to ištrink failą!)

---

## 4. Cloudflare setup

### Domenas
- [ ] Nusipirk domeną (pvz. Namecheap, Porkbun)
- [ ] Pridėk domeną į Cloudflare → [dash.cloudflare.com](https://dash.cloudflare.com)
- [ ] Pakeisk nameserverius į Cloudflare (domeno registrar puslapyje)
- [ ] Palaukyk kol Cloudflare patvirtins domeną (iki 24h, dažniausiai ~15min)

### Cloudflare Pages (frontend)
- [ ] Sukurk Pages projektą:
  ```
  bunx wrangler pages project create roomio-frontend
  ```
- [ ] Prisijunk prie Cloudflare: `bunx wrangler login`
- [ ] Sukurk API Token: **Cloudflare → My Profile → API Tokens → Create Token**
  - Template: `Cloudflare Pages: Edit`
- [ ] Užsirašyk **Account ID** (dešinysis šonas Cloudflare dashboard)

### DNS įrašai
- [ ] Sukurk CNAME įrašą frontendui:
  - Name: `@` (arba `app`)
  - Target: `roomio-frontend.pages.dev`
- [ ] Sukurk CNAME įrašą backendui:
  - Name: `api`
  - Target: Cloud Run URL (be `https://`)

---

## 5. GitHub Secrets

Eik į: **GitHub repo → Settings → Secrets and variables → Actions**

- [ ] `GCP_PROJECT_ID` — Google Cloud projekto ID
- [ ] `GCP_SA_KEY` — `key.json` failo visas turinys (JSON tekstas)
- [ ] `CLOUDFLARE_API_TOKEN` — Cloudflare API token
- [ ] `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID
- [ ] `CF_PAGES_PROJECT_NAME` — `roomio-frontend` (arba koks pavadinimas buvo sukurtas)

---

## 6. `deploy.yml` kintamieji

Atidaryti `.github/workflows/deploy.yml` ir patikrinti ar sutampa:

```yaml
env:
  GCP_REGION: europe-north1        # regionas kurį pasirinkau
  AR_REPO: roomio                  # Artifact Registry repo pavadinimas
  CLOUDRUN_SERVICE: roomio-backend # Cloud Run service pavadinimas
```

- [ ] Patikrini ir atitaisai jei reikia

---

## 7. Pirmas deploy

- [ ] `git tag v1.0.0`
- [ ] `git push origin v1.0.0`
- [ ] Eik į **GitHub → Actions → Deploy** ir stebėk
- [ ] Patikrink backend: `curl https://api.DOMENAS.com/health`
- [ ] Atidaryik frontend: `https://DOMENAS.com`

---

## Kasdienė darbo eiga (kai viskas sutvarkyta)

```bash
# 1. Rašai kodą ir pushinsi į main (CI tikrins automatiškai)
git push

# 2. Kai nori releasinti naują versiją:
git tag v1.2.0
git push origin v1.2.0
# GitHub Actions automatiškai deployo
```
