# MongoDB Atlas Pricing Calculator

A small, dependency-free static site for comparing estimated MongoDB Atlas dedicated cluster costs and resources.

**Live site:** https://joaoderocha.github.io/atlas-pricing-calculator/

## Project structure

```text
.
├── index.html          # Page structure and calculator controls
├── assets/
│   ├── app.js          # Pricing data, calculations, and charts
│   └── styles.css      # Site styles and responsive layout
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

Tier specifications and prices are maintained in the `TIERS` array near the top of `assets/app.js`. Update those values when the underlying Atlas pricing changes.

The calculator provides baseline estimates for AWS `us-east-1`. It excludes additional storage, backups, data transfer, taxes, discounts, and other usage-based charges. Verify current prices before using the estimates for purchasing decisions.

## Deployment

GitHub Pages publishes the root of the `main` branch. Pushing changes to `main` updates the live site automatically.
