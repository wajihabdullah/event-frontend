# EventHub — frontend (Tier 1)

Next.js 16 (App Router) UI for the event management system.

## Pages

| Route | Purpose |
|---|---|
| `/` | login |
| `/register` | create an account (auto-signs you in) |
| `/events` | event list, requires a token in `localStorage` |

## How it talks to the backend

The browser only ever calls **relative** `/api/*` URLs on the frontend origin.
`next.config.js` rewrites `/api/:path*` to `http://backend:5000/api/:path*`
inside the cluster, so there is no CORS configuration and the backend stays
`ClusterIP` (not reachable from outside the cluster).

## Exposure

Service type `NodePort`, `30080` → container port `3000`.
App URL: `http://98.81.219.10:30080`

## First deploy (manual)

Run from the repo root **on the VM**, after the backend tier is running:

```bash
docker build -t event-frontend:v1 .

sudo -u jenkins -H minikube image load event-frontend:v1
sudo -u jenkins -H minikube image ls --format short | grep event-frontend

sudo -u jenkins -H kubectl apply -f k8s/
sudo -u jenkins -H kubectl -n event-app get pods,svc
```

## CI pipeline

Checkout → Build → Load into minikube → Deploy → Verify.

The verify stage calls `/api/health` through the frontend pod, which exercises
frontend → Next.js rewrite → backend → PostgreSQL in a single request.

Images use `imagePullPolicy: Never` because they are loaded straight into the
minikube node instead of coming from a registry.
