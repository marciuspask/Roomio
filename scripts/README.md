# Deploy scripts

## Backend

Builds a Docker image, pushes it to Artifact Registry, and deploys to Cloud Run.

```bash
./scripts/deploy-backend.sh v1.0.3
```

The version tag is optional — defaults to `v1.0.0` if omitted.

**Prerequisites:** `docker`, `gcloud` (authenticated, correct project set)

## Frontend

Builds the Vite production bundle and deploys to Cloudflare Pages.

```bash
./scripts/deploy-frontend.sh
```

**Prerequisites:** `npm`, `wrangler` (authenticated via `wrangler login`)
