# MongoDB Atlas Pricing Calculator

A small, dependency-free static site for comparing estimated MongoDB Atlas dedicated cluster costs and resources across AWS, Google Cloud, and Azure.

**Live site:** https://joaoderocha.github.io/atlas-pricing-calculator/

## Project structure

```text
.
├── index.html          # Page structure and calculator controls
├── assets/
│   ├── app.js          # Pricing data, calculations, and charts
│   └── styles.css      # Site styles and responsive layout
├── docs/
│   └── pricing-sources.md # Official pricing research and caveats
└── README.md
```

Chart rendering uses [Chart.js](https://www.chartjs.org/) from a CDN. No package manager or build step is required.

## Run locally

Open `index.html` directly in a browser, or serve the directory with any static file server:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Updating pricing

Provider metadata, tier specifications, and prices are maintained in the `PROVIDERS` object near the top of `assets/app.js`. The supporting official sources, retrieval method, effective date, and known limitations are recorded in `docs/pricing-sources.md`.

The current snapshot uses the Atlas calculator's default baseline regions: AWS `us-east-1`, Google Cloud `us-central1`, and Azure `eastus2`. It models one standard three-node replica set with default storage and excludes backups, network costs, taxes, discounts, and other usage-based charges. Verify current prices before using the estimates for purchasing decisions.

Tier availability and hardware differ by provider. The UI only offers combinations that were available in the official Atlas calculator when the pricing snapshot was retrieved.

## Deployment

GitHub Pages publishes the root of the `main` branch. Pushing changes to `main` updates the live site automatically.
