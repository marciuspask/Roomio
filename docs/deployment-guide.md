# Roomio Deployment Guide — Student Learning Path

## Context

You have built a FastAPI backend (Roomio) with PostgreSQL, async SQLAlchemy, Clerk authentication, and a React frontend. Everything works locally. Now it's time to make it real — deploy it to the internet so anyone can use it.

This guide does not contain code or commands. You will use Claude Code, ChatGPT, and official documentation to figure out every step. The guide gives you **why**, **what to investigate**, and **what success looks like**. The doing is yours.

---

## Milestone 1: Dockerize the Backend & Deploy to Google Cloud Run

### Why This Milestone Matters

Your FastAPI app runs on your Mac. But your Mac is not a server — it sleeps, it's behind your home network, and it runs macOS. Production servers run Linux. Docker solves this gap: you describe your app's environment once, and it runs identically everywhere. Google Cloud Run takes your Docker image and runs it as a scalable web service with HTTPS, load balancing, and pay-per-request pricing — no server management required.

Without this milestone, your app exists only on your laptop. With it, anyone in the world can hit your API.

---

### Step 1.1 — Understand What Docker Actually Is

**Why:** Before writing a single Dockerfile, you need a mental model of what Docker does. Many students start copying Dockerfiles from the internet without understanding layers, images vs containers, or build context. This leads to bloated images, security issues, and debugging nightmares.

**Breadcrumbs to investigate:**
- What is the difference between a Docker **image** and a Docker **container**? Think of it like a class vs an instance
- What is a **Dockerfile**? What does each instruction (FROM, COPY, RUN, CMD) actually do to the filesystem?
- What are **layers**, and why does the order of instructions in a Dockerfile matter for build speed?
- What does "multi-stage build" mean, and why would you use it for a Python app?
- What is the difference between `linux/amd64` and `linux/arm64`? Your Mac uses ARM (Apple Silicon), but Google Cloud Run expects AMD64 — this mismatch will bite you if you don't understand it

**Small goal:** Install Docker Desktop on your Mac. Run `docker run hello-world`. Then run `docker run -it python:3.12-slim bash` and explore — you're inside a Linux machine running on your Mac. Type `uname -m` and notice it says `aarch64` (ARM). This is your Mac's architecture emulated. Cloud Run needs `x86_64`.

---

### Step 1.2 — Create a Docker Image for Your Backend

**Why:** Your FastAPI app has dependencies (Python, asyncpg, uvicorn, etc.), configuration (.env), and a specific startup command. A Dockerfile captures all of this so anyone (or any cloud service) can run your app without knowing anything about it.

**Breadcrumbs to investigate:**
- Which base image should you use? `python:3.12` vs `python:3.12-slim` vs `python:3.12-alpine` — research the tradeoffs (size, compatibility, build time)
- How does your app find its dependencies? You use `pyproject.toml` — research how to install from it inside Docker
- Your app needs environment variables (database URL, Clerk keys). Should these be baked into the image or provided at runtime? Research the difference and why one is a security risk
- How do you build for `linux/amd64` on an ARM Mac? Research `docker buildx` and the `--platform` flag
- What is `.dockerignore` and why should you create one? Think about what happens if your `.env` file or `__pycache__` gets copied into the image

**Small goal:** Build a Docker image that can run your FastAPI app locally with `docker run`. You'll need to figure out how to pass environment variables and how to expose the correct port. The app should respond to `curl http://localhost:8000/health`.

---

### Step 1.3 — Set Up Google Cloud on Your Mac

**Why:** Google Cloud Run is where your container will live in production. Before you can push anything there, you need a Google Cloud project, billing enabled, and the `gcloud` CLI authenticated on your machine. This is the "plumbing" step — boring but essential.

**Breadcrumbs to investigate:**
- What is a Google Cloud **project**? Why does everything live inside one?
- What is **Artifact Registry** (not Container Registry — that's the old one)? It's where your Docker images are stored in Google Cloud
- How do you install `gcloud` CLI on macOS? Research `brew install google-cloud-sdk` or the official installer
- What does `gcloud auth login` do vs `gcloud auth configure-docker`? You need both — one authenticates you, the other lets Docker push to Google's registry
- What is a **service account**, and when would you use one instead of your personal login?

**Small goal:** Run `gcloud projects list` and see your project. Run `gcloud artifacts repositories list` and see an empty registry you created. You should understand what region you chose and why.

---

### Step 1.4 — Push Your Image to Google Artifact Registry

**Why:** Google Cloud Run can only run images stored in Google's own registry. You need to tag your local image with the registry path and push it. This is like `git push` but for Docker images.

**Breadcrumbs to investigate:**
- What is an image **tag** and why does the full tag include the registry host, project, repository, and version? (e.g., `europe-north1-docker.pkg.dev/my-project/my-repo/roomio-backend:v1`)
- How do you tag a local image for a remote registry? Research `docker tag`
- How do you push to Artifact Registry? Research `docker push` after configuring auth
- What happens if you push the same tag twice? Research **tag mutability** and why version tags matter

**Small goal:** See your image listed in the Google Cloud Console under Artifact Registry. You should be able to pull it from another machine (or after deleting your local copy).

---

### Step 1.5 — Deploy to Google Cloud Run

**Why:** This is the moment your API goes live. Cloud Run takes your image, starts a container, gives it a public HTTPS URL, and scales it from zero to many instances based on traffic. You pay only when requests are being handled.

**Breadcrumbs to investigate:**
- What does Cloud Run do when it receives no traffic? Research "scale to zero" and cold starts
- How do you pass environment variables to Cloud Run? Research `--set-env-vars` and **Secret Manager** (for sensitive values like database passwords and API keys)
- What is the difference between `--allow-unauthenticated` and requiring authentication? Your API has its own auth (Clerk), so think about what makes sense
- What region should you deploy to? Think about where your database is and where your users are
- What is the Cloud Run **service URL** and how does it look? (hint: `https://servicename-xxxx-region.a.run.app`)

**Small goal:** Hit your Cloud Run URL with `curl https://your-service-url/health` and get a 200 response. Your FastAPI docs should be available at `/docs`.

---

### Milestone 1 Checkpoint

**What success looks like:**
- Your backend Docker image is built, tagged, and pushed to Google Artifact Registry
- Your backend is running on Google Cloud Run with a public HTTPS URL
- The `/health` endpoint responds successfully
- Environment variables (database URL, Clerk keys) are configured via Cloud Run, not baked into the image
- You can redeploy by building a new image and running a single deploy command

**Self-Assessment Questions — Research these deeply before moving on:**

1. **What happens inside Docker when you change one line of code and rebuild?** Explain how layer caching works, why the order of COPY and RUN instructions matters, and what "cache busting" means. If you changed only your Python source code, which layers get rebuilt and which are reused?

2. **Your Docker image works on your Mac but crashes on Cloud Run with a segfault. What is the most likely cause, and how do you prevent it?** Think about CPU architecture (ARM vs AMD64), native extensions (like `asyncpg`), and how `docker buildx --platform` solves this.

3. **You accidentally pushed a Docker image that contains your `.env` file with database credentials. The image is in Artifact Registry. What is your incident response?** Think about: can you delete the image? Can someone who already pulled it still access it? What steps do you take to rotate secrets? Why is prevention (`.dockerignore`) better than response?

4. **Explain the difference between Google Artifact Registry and Google Container Registry. Why did Google deprecate the latter?** Research the access control model, multi-format support, and regional storage differences.

5. **A Cloud Run service has 0 instances running. A user sends a request. Describe exactly what happens from the moment the request arrives until the response is sent.** Include: cold start, container startup, your FastAPI lifespan function, request handling, and what happens after the response. Why does cold start time matter, and how can you minimize it?

---

## Milestone 2: Custom Domain with Cloudflare

### Why This Milestone Matters

Your backend is live but the URL looks like `https://roomio-backend-abc123-ew.a.run.app`. This is fine for testing, not for a product. A custom domain like `api.roomio.com` is professional, memorable, and gives you control over DNS, caching, and security. Cloudflare sits between your users and Google Cloud Run — it provides DNS, SSL certificates, DDoS protection, and a CDN, mostly for free.

Without this milestone, your app is reachable but unprofessional and unprotected. With it, you have a real domain with enterprise-grade infrastructure in front of it.

---

### Step 2.1 — Understand DNS and Domains

**Why:** Before touching Cloudflare, you need to understand what a domain actually is, how DNS resolution works, and what happens when someone types `api.roomio.com` into a browser. Without this, Cloudflare's configuration panel will be a wall of confusing options.

**Breadcrumbs to investigate:**
- What is the difference between a **registrar** (where you buy domains) and a **DNS provider** (where you configure where the domain points)? Cloudflare can be both
- What is an **A record** vs a **CNAME record** vs an **AAAA record**? When would you use each?
- What is a **subdomain**? How is `api.roomio.com` different from `roomio.com` in DNS terms?
- What does **TTL** mean on a DNS record, and why would you set it low during setup?
- What is **DNS propagation** and why do changes take time to become visible worldwide?

**Small goal:** Buy a cheap domain (`.com` or `.dev`) from a registrar. You can use this domain for future projects too. Point its nameservers to Cloudflare.

---

### Step 2.2 — Set Up Cloudflare

**Why:** Cloudflare is the control plane for your domain. It handles DNS, generates SSL certificates automatically, protects against attacks, and can cache responses. Understanding Cloudflare is a career-long skill — it powers a significant chunk of the internet.

**Breadcrumbs to investigate:**
- What is Cloudflare's **proxy mode** (orange cloud vs grey cloud)? What does proxying actually do to the request path?
- What are Cloudflare's **SSL/TLS modes** (Off, Flexible, Full, Full Strict)? Why is "Flexible" dangerous and "Full Strict" correct for your setup?
- What is an **origin server** in Cloudflare terminology? (hint: it's your Cloud Run service)
- What does Cloudflare's **free tier** include? Research WAF, DDoS protection, SSL, and analytics
- What is the difference between Cloudflare managing your DNS vs just being a CDN?

**Small goal:** Add your domain to Cloudflare. See the Cloudflare dashboard showing your domain as active. Understand what the nameserver change did.

---

### Step 2.3 — Connect Your Domain to Cloud Run

**Why:** You need to create a DNS record in Cloudflare that points `api.yourdomain.com` to your Cloud Run service. This involves understanding Cloud Run's domain mapping feature and Cloudflare's proxy configuration.

**Breadcrumbs to investigate:**
- How does Cloud Run **custom domain mapping** work? Research `gcloud run domain-mappings`
- What DNS records does Cloud Run require you to create? (CNAME or A records?)
- When Cloudflare proxies your traffic, what does Cloud Run see as the client IP? Research the `X-Forwarded-For` header
- What SSL certificate does Cloud Run use for custom domains? What about Cloudflare's certificate? Research the **double TLS termination** that happens with Cloudflare proxy mode
- How do you verify that DNS is correctly configured? Research `dig` and `nslookup` commands

**Small goal:** Open `https://api.yourdomain.com/health` in a browser and get a valid response with a valid SSL certificate. Check that the certificate is issued by Cloudflare (not Google), confirming the proxy is working.

---

### Step 2.4 — Explore Cloudflare CLI (Wrangler)

**Why:** Clicking through dashboards doesn't scale. Cloudflare's CLI tool (`wrangler`) lets you manage DNS, workers, and configuration from the terminal. This sets you up for automation later.

**Breadcrumbs to investigate:**
- What is **Wrangler** and how do you install it?
- Can you manage DNS records from the CLI? Research `wrangler` or the Cloudflare API
- What are **Cloudflare Workers** and **Cloudflare Pages**? You'll use Pages for the React app in Milestone 3
- How does Cloudflare's API authentication work? Research API tokens vs API keys

**Small goal:** List your DNS records using the Cloudflare CLI or API. Understand the authentication flow.

---

### Milestone 2 Checkpoint

**What success looks like:**
- You own a domain (e.g., `roomio.dev` or similar)
- Cloudflare manages DNS for your domain
- `api.yourdomain.com` routes to your Google Cloud Run backend
- SSL certificates are valid and working (Full Strict mode)
- You understand the request path: User -> Cloudflare (DNS + Proxy) -> Google Cloud Run -> Your container
- You can manage basic Cloudflare settings from the CLI

**Self-Assessment Questions — Research these deeply before moving on:**

1. **A user in Tokyo requests `api.yourdomain.com/listings`. Trace the complete network path of this request.** Include: DNS resolution (which Cloudflare PoP?), TLS handshake (with whom?), proxy to origin, Cloud Run cold start (if applicable), response path back. Where does caching happen or could happen?

2. **You set Cloudflare SSL mode to "Flexible" instead of "Full Strict". Your app works fine in the browser. Explain why this is a security vulnerability.** What is the encryption state between Cloudflare and Cloud Run? What kind of attack becomes possible? Draw the connection diagram with and without encryption on each leg.

3. **Your domain's nameservers are pointed to Cloudflare, but you want to add an MX record for email. Where do you configure this and why?** Research how nameserver delegation works — when Cloudflare owns your DNS, what happens to records managed elsewhere?

4. **Explain what happens if Cloudflare goes down. Can users still reach your Cloud Run backend?** Research Cloudflare outages (they've happened), and what "grey cloud" mode means. What is the tradeoff between proxied and DNS-only records?

5. **What is the difference between Cloudflare Pages, Cloudflare Workers, and Cloudflare R2?** For each, give one example of when you'd use it in the Roomio project. Which one will you use for the React frontend?

---

## Milestone 3: Deploy the React Frontend

### Why This Milestone Matters

Your backend is live with a custom domain. Now the frontend needs to reach it. Cloudflare Pages is a natural fit — it hosts static sites (like a built React app) on Cloudflare's CDN, giving you global distribution, automatic HTTPS, and zero server management. After this, your full application is accessible to users.

Without this milestone, you have an API but no UI. With it, you have a complete, deployed product.

---

### Step 3.1 — Understand Static Site Hosting

**Why:** A React app in production is just HTML, CSS, and JavaScript files. There is no Node.js server — the browser downloads and runs everything. Understanding this distinction (server-rendered vs client-rendered vs static) is fundamental to choosing the right hosting.

**Breadcrumbs to investigate:**
- What does `npm run build` (or your build command) actually produce? Look at the output directory
- What is the difference between a **static site host** (Cloudflare Pages, Netlify, Vercel) and a **server** (Cloud Run, EC2)?
- Why does a single-page app (SPA) need special routing configuration? What happens when someone refreshes `/listings/123` on a static host?
- What are **environment variables at build time** vs **runtime**? In a React app, when are env vars injected?

**Small goal:** Run your React build command locally and inspect the output folder. Understand that these files are all that needs to be deployed.

---

### Step 3.2 — Configure Environment Variables for Production

**Why:** Your React app currently calls `http://localhost:8000` for API requests. In production, it needs to call `https://api.yourdomain.com`. This switch must happen at build time for a static React app — you can't change environment variables after the build.

**Breadcrumbs to investigate:**
- How does your React app reference the API URL? Research `.env` files, `VITE_` prefix (if using Vite), or `REACT_APP_` prefix (if using CRA)
- How do you have different env vars for local development vs production? Research `.env.local`, `.env.production`, and build-time variable injection
- What happens if an env var is missing at build time? Does the app fail or silently use `undefined`?
- How do CORS settings on your backend need to change now that the frontend has a different origin? Research your FastAPI CORS middleware and add the production domain

**Small goal:** Build the React app with the production API URL and verify (by inspecting the built JS files or running locally) that API calls point to `https://api.yourdomain.com`.

---

### Step 3.3 — Deploy to Cloudflare Pages

**Why:** Cloudflare Pages takes your built files and distributes them across 300+ data centers worldwide. Users get served from the closest location. Deployment is a single command or a git push.

**Breadcrumbs to investigate:**
- What is **Cloudflare Pages** and how does it differ from Cloudflare Workers?
- How do you deploy using the Wrangler CLI? Research `wrangler pages deploy`
- How do you connect a custom domain (e.g., `yourdomain.com` or `app.yourdomain.com`) to a Cloudflare Pages project?
- What is a **preview deployment** and how does it work with branches?
- How does SPA routing work on Cloudflare Pages? Research the `_redirects` file or the Pages routing configuration

**Small goal:** Visit `https://yourdomain.com` (or your chosen subdomain) in a browser and see your React app. Log in, create a listing, send a message — the full app should work end-to-end.

---

### Step 3.4 — Create Deployment Automation

**Why:** You've now deployed manually — built images, pushed them, ran CLI commands. This is fine for learning but unsustainable for ongoing development. A deployment script captures the exact steps and makes deploys repeatable, fast, and error-proof.

**Breadcrumbs to investigate:**
- What should a deployment script do? Think: build, tag, push, deploy, verify
- Should you use a shell script, a Makefile, or something else? Research the tradeoffs
- How do you parameterize the script? (e.g., deploy to staging vs production)
- What is a **health check** after deployment, and why should your script include one?
- How do you handle failures? What if the build succeeds but the deploy fails — is the old version still running?

**Small goal:** Create a script (or set of scripts) that lets you deploy both backend and frontend with a single command each. Something like `./deploy.sh backend production` and `./deploy.sh frontend production`.

---

### Milestone 3 Checkpoint

**What success looks like:**
- React frontend is deployed to Cloudflare Pages
- Frontend is accessible at your custom domain (e.g., `yourdomain.com` or `app.yourdomain.com`)
- SSL certificates are valid for both frontend and backend domains
- The React app communicates with the backend at `api.yourdomain.com`
- CORS is configured correctly — no browser errors
- Full user flow works: sign up, create profile, post listing, send message
- You have CLI scripts to deploy both frontend and backend

**Self-Assessment Questions — Research these deeply before moving on:**

1. **Your React app makes an API call to `api.yourdomain.com` from `yourdomain.com`. The browser blocks it with a CORS error. Explain exactly what CORS is, why the browser enforces it, and what headers your FastAPI backend must return.** Include: preflight requests (OPTIONS), `Access-Control-Allow-Origin`, credentials, and why `allow_origins=["*"]` is dangerous with credentials.

2. **You set `VITE_API_URL=https://api.yourdomain.com` in your `.env.production` file but forgot to rebuild before deploying. The deployed app still calls `localhost:8000`. Explain why.** Describe how environment variables work in a static React build vs a server-side app. When exactly are they "baked in"?

3. **Compare deploying your React app on Cloudflare Pages vs deploying it as a Docker container on Cloud Run. List three advantages and three disadvantages of each approach.** Consider: cost, cold starts, global distribution, build complexity, server-side rendering capability, and deployment speed.

4. **Your deployment script successfully pushes a new backend image to Cloud Run, but the new version has a bug that crashes on startup. What happens to users?** Research Cloud Run's revision management, traffic splitting, rollback, and minimum instances. How would you design your deployment to prevent downtime?

5. **Explain the complete architecture of your deployed application.** Draw (or describe) every component: the user's browser, Cloudflare DNS, Cloudflare Pages CDN, Cloudflare proxy, Google Cloud Run, your PostgreSQL database, Clerk authentication. Show which connections use HTTPS, where certificates are terminated, and where environment variables live.

---

## Milestone 4: Release Process & Development Workflow

### Why This Milestone Matters

You can deploy. But deploying is not the same as releasing. A release is a deliberate, versioned, traceable event. Without a release process, you'll eventually deploy the wrong code, overwrite a working version with a broken one, or lose track of what's running in production. This milestone turns your deployment capability into a disciplined workflow.

---

### Step 4.1 — Git Tagging for Releases

**Why:** A git tag is a permanent bookmark on a specific commit. When you tag `v1.2.0`, you're saying "this exact code is version 1.2.0." If production breaks, you can immediately see which commit is running, diff it against the previous release, and roll back to a known-good tag.

**Breadcrumbs to investigate:**
- What is the difference between a **lightweight tag** and an **annotated tag** in git? Which should you use for releases and why?
- What is **semantic versioning** (semver)? What do major, minor, and patch numbers mean?
- How do you list all tags? How do you check out a specific tag?
- How do you push tags to the remote? (hint: `git push` doesn't push tags by default)
- What happens if you try to move a tag to a different commit? Research tag immutability

**Small goal:** Tag your current working state as `v1.0.0`. Push the tag to GitHub. Verify you can see it in the GitHub UI under releases/tags.

---

### Step 4.2 — Enforce Tag-Based Releases

**Why:** Your deployment script should refuse to deploy code that isn't tagged. This prevents "oops I deployed my work-in-progress" accidents. The tag becomes the gatekeeper — no tag, no deploy.

**Breadcrumbs to investigate:**
- How do you check in a shell script whether the current commit has a tag?
- What should the script do if there's no tag? Exit with a clear error message
- Should the deploy script read the version from the tag and use it as the Docker image tag? Think about traceability — if you see image `v1.2.0` in Artifact Registry, you should be able to find the exact commit
- What is a **git hook**? Research `pre-push` hooks and whether they can prevent pushing without tags
- How can you prevent deploying from a dirty working directory (uncommitted changes)?

**Small goal:** Modify your deployment script to check for a git tag on the current commit. If no tag exists, the script should print an error and exit. Test it by trying to deploy from an untagged commit.

---

### Step 4.3 — Environment Variable Management

**Why:** Your app needs different configuration for local development, Docker, and production. If a developer has to edit `.env` files before deploying, someone will eventually deploy with `DATABASE_URL=localhost` and break production.

**Breadcrumbs to investigate:**
- How many environments do you have? (local, Docker local, production — at minimum)
- How does each environment get its variables? (`.env` file for local, Docker `--env-file` for Docker, Cloud Run env vars / Secret Manager for production)
- Should `.env` be in git? Research `.env.example` patterns — committed template with placeholder values, actual `.env` in `.gitignore`
- How do you ensure a developer can clone the repo, copy `.env.example` to `.env`, fill in their values, and have everything work?
- What is **Secret Manager** in Google Cloud and why should database passwords live there instead of in Cloud Run environment variables?

**Small goal:** A new developer (or you, after a fresh clone) should be able to get the backend running locally with: `cp .env.example .env`, fill in values, `docker compose up`. No code changes required.

---

### Step 4.4 — Supporting CLI Scripts & Developer Experience

**Why:** Every manual step is a step that can be done wrong. A `scripts/` directory with clear, documented scripts makes your project approachable and your workflow reliable.

**Breadcrumbs to investigate:**
- What scripts should exist? Think about: `dev.sh` (run locally), `build.sh` (build Docker), `deploy.sh` (deploy to cloud), `logs.sh` (view production logs)
- How do you make scripts self-documenting? Research: a `--help` flag, a top-level `Makefile` with `help` target, or a README in the scripts directory
- How do you view Cloud Run logs from the terminal? Research `gcloud run services logs read`
- How do you quickly check what version is running in production? (hint: health endpoint could return the version/tag)
- What is a **Makefile** and why is it often used as a task runner even outside of C projects?

**Small goal:** Create a set of scripts that cover the full lifecycle: develop, build, deploy, verify, rollback, view logs. Another developer should be able to read the script names and understand the workflow.

---

### Milestone 4 Checkpoint

**What success looks like:**
- Every release has a git tag following semantic versioning
- Deployment scripts refuse to deploy untagged commits
- Docker image tags match git tags for full traceability
- Environment variables are managed per-environment without code changes
- `.env.example` exists with all required variables documented
- A `scripts/` directory contains CLI tools for the full development and deployment lifecycle
- A new developer can set up the project locally by following a simple README

**Self-Assessment Questions — Research these deeply:**

1. **You deployed `v1.3.0` to production and it has a critical bug. Describe your complete rollback procedure.** Include: how you identify the previous good version, how you redeploy it on Cloud Run, whether you need to rebuild the Docker image, and how git tags help you. What is the fastest possible rollback, and what is the safest?

2. **Explain the difference between a git tag, a Docker image tag, and a Cloud Run revision. How do these three versioning concepts relate to each other in your deployment pipeline?** For a given release `v1.2.0`, describe where each identifier appears and how you trace from a user-reported bug back to a specific line of code.

3. **Your `.env` file contains `DATABASE_URL=postgresql+asyncpg://user:password@localhost/roomio`. You accidentally commit and push it. What is your incident response?** Think about: git history (the secret is in a commit forever), credential rotation, tools like `git-secrets` or pre-commit hooks for prevention, and GitHub's secret scanning feature.

4. **You run `./deploy.sh backend production` and it succeeds, but the health check fails. What could have gone wrong?** List at least five possible causes spanning: Docker build issues, environment variable misconfiguration, database connectivity, Cloud Run configuration, and DNS/Cloudflare issues.

5. **What is the difference between continuous integration (CI), continuous delivery (CD), and continuous deployment? Which of these have you implemented so far, and what would you need to add for full CI/CD?** Research GitHub Actions, and describe what a pipeline would look like for your project — from `git push` to production.

---

## Final Architecture Overview

After completing all four milestones, your system should look like this:

```
Developer's Mac
  |
  |-- git push (tagged commit)
  |
  v
GitHub Repository
  |
  |-- (future: GitHub Actions CI/CD)
  |
  v
Build & Deploy Scripts
  |
  |-- Backend: docker build -> push to Artifact Registry -> deploy to Cloud Run
  |-- Frontend: npm build -> deploy to Cloudflare Pages
  |
  v
Production
  |
  |-- Cloudflare DNS (yourdomain.com)
  |     |
  |     |-- yourdomain.com -> Cloudflare Pages (React SPA)
  |     |-- api.yourdomain.com -> Cloudflare Proxy -> Google Cloud Run (FastAPI)
  |
  |-- Google Cloud Run
  |     |-- Pulls image from Artifact Registry
  |     |-- Env vars from Cloud Run config + Secret Manager
  |     |-- Connects to PostgreSQL database
  |
  |-- Clerk (authentication, external service)
```

**The goal is not just to have this running — it's to understand every arrow in this diagram.** If someone asks "what happens when a user opens your app?", you should be able to trace the request from their browser through every component and back.
