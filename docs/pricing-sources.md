# MongoDB Atlas dedicated-cluster pricing sources

Research date: **2026-11-26**. All sources below are first-party MongoDB pages, documentation, or public calculator assets. Prices are USD and can change.

## Recommended baseline regions

Use the current Atlas Pricing Calculator defaults, not an assumed “cheapest” region:

| Provider | Calculator region key | Displayed region | Cloud region ID |
|---|---|---|---|
| AWS | `US_EAST_1` | N. Virginia | `us-east-1` |
| Google Cloud | `CENTRAL_US` | Iowa | `us-central1` |
| Azure | `US_EAST_2` | Virginia-East2 | `eastus2` |

These are defaults exposed by the official calculator’s public provider/region metadata; they are not a MongoDB guarantee that these regions are always cheapest. Region availability and names are also documented on the provider reference pages.[1][3][4][5]

## Current calculator rates in those regions

The following are the **two-decimal hourly values displayed by MongoDB’s interactive calculator** with Network Cost set to `0`, Backup off, one standard three-node Atlas cluster, and default included storage. The selectable standard tiers produced the same values in the three baseline regions on the research date.[1]

| Tier | AWS N. Virginia | Google Cloud Iowa | Azure Virginia-East2 |
|---|---:|---:|---:|
| M30 | Not available as selectable standard M30; `M30_GEN_2` is **$0.60/hr** | Not available in the calculator’s instance selector | Not available in the calculator’s instance selector |
| M40 | **$1.02/hr** | **$1.02/hr** | **$1.02/hr** |
| M50 | **$1.97/hr** | **$1.97/hr** | **$1.97/hr** |
| M60 | **$3.90/hr** | **$3.90/hr** | **$3.90/hr** |
| M80 | **$7.20/hr** | **$7.20/hr** | **$7.20/hr** |
| M140 | **$10.84/hr** | **$10.84/hr** | **Unavailable:** Azure has no standard M140 |
| M200 | **$14.39/hr** | **$14.39/hr** | **$14.39/hr** |
| M300 | **$21.56/hr** | **$21.56/hr** | **Unavailable:** no standard M300; only M300 low-CPU and NVMe variants |

### Exact monthly values

These are the exact 30-day monthly amounts corresponding to the calculator’s zero-network annual-cent totals. Values were identical across the tested baseline regions where the standard tier was available.[1]

| Tier | AWS N. Virginia | Google Cloud Iowa | Azure Virginia-East2 |
|---|---:|---:|---:|
| M30 | `M30_GEN_2`: **$431.99/mo** | Unavailable | Unavailable |
| M40 | **$736.56/mo** | **$736.56/mo** | **$736.56/mo** |
| M50 | **$1,416.96/mo** | **$1,416.96/mo** | **$1,416.96/mo** |
| M60 | **$2,808.00/mo** | **$2,808.00/mo** | **$2,808.00/mo** |
| M80 | **$5,186.16/mo** | **$5,186.16/mo** | **$5,186.16/mo** |
| M140 | **$7,806.24/mo** | **$7,806.24/mo** | Unavailable |
| M200 | **$10,363.68/mo** | **$10,363.68/mo** | **$10,363.68/mo** |
| M300 | **$15,519.60/mo** | **$15,519.60/mo** | Unavailable |

The visible UI abbreviates amounts at or above $1,000—for example, M200 displays `$10.36K/mo` and M300 displays `$15.52K/mo`. The table gives the exact underlying amounts used before compact display formatting.

#### Observation method

1. Opened the official calculator at each baseline provider/region, selected the tier and its default included storage, disabled backup, and set Network Cost to `0`.
2. Captured the calculator’s own first-party `mongodb.com/pricing/calculator/_serverFn/...` response and decoded its serialized cluster object.
3. Required the response to match the requested provider, region, and instance class and to contain `network_cost_percentage: 0`; then read `cost_data.yearly_cost_usd_cents`.
4. Applied the calculator client’s formula `yearly / 365 * 30` and rounded the currency display to two decimals. The resulting M40 value (`$736.56/mo`) and compact high-tier values were checked against the rendered UI.

A non-obvious calculator behavior required this response-level check: selecting another tier can restore the backend’s default 7% network assumption even when the route or input previously showed zero. Each tier was therefore selected first, then the network value was changed and verified at zero before accepting its response. The earlier 7%-inclusive observations were discarded.

### Official-source discrepancy

MongoDB’s static pricing page publishes M30 `$0.54`, M40 `$1.04`, M50 `$2.00`, M60 `$3.95`, M80 `$7.30`, M140 `$10.99`, M200 `$14.59`, and M300 `$21.85` per hour.[2] These conflict with the calculator’s zero-network annual-derived values above. The static page’s provider-tab content also does not expose an unambiguous, independently attributable GCP/Azure rate table in its fetched page content.

For a provider selector intended to mirror MongoDB’s current estimator, prefer the verified interactive-calculator observations, record an effective date, and expect updates. Do **not** treat the static table as current provider-specific data without resolving this discrepancy with MongoDB. The public UI rounds hourly rates and compact-formats larger monthly totals; its first-party response exposes higher-precision annual cents but is not documented as a stable public pricing API.

M30 is especially unsuitable for inference: a direct standard-M30 URL can render an incomplete estimate, while the selector exposes AWS `M30_GEN_2` and omits M30 for the other two providers. No exact current standard-M30 GCP or Azure baseline rate was available from the public static docs/calculator, so none is invented here.

## Hardware differs by provider

Default storage is included in the base cluster configuration, but the included amount is provider- and tier-specific.[3][4][5][6]

| Tier | AWS RAM / vCPU / storage | Google Cloud RAM / vCPU / storage | Azure RAM / vCPU / storage |
|---|---|---|---|
| M30 | 8 GiB / 2 / 40 GB | 8 GiB / 2 / 40 GB | 8 GB / 2 / 32 GB |
| M40 | 16 GiB / 4 / 80 GB | 16 GiB / 4 / 80 GB | 16 GB / 4 / 64 GB |
| M50 | 32 GiB / 8 / 160 GB | 32 GiB / 8 / 160 GB | 32 GB / 8 / 128 GB |
| M60 | 64 GiB / 16 / 320 GB | 64 GiB / 16 / 320 GB | 64 GB / 16 / 128 GB |
| M80 | 128 GiB / 32 / 750 GB | 128 GiB / 32 / 750 GB | 128 GB / 32 / 256 GB |
| M140 | 192 GiB / 48 / 1 TB | 192 GiB / 48 / 1 TB | Not offered as a standard tier |
| M200 | 256 GiB / 64 / 1.5 TB | 256 GiB / 64 / 1.5 TB | 256 GB / 64 / 256 GB |
| M300 | 384 GiB / 96 / 2 TB | **360 GB** / 96 / 2 TB | Not offered as a standard tier |

Notes:

- AWS and Google Cloud are aligned through M200, but Google Cloud standard M300 has 360 GB RAM versus AWS’s 384 GiB.[3][4]
- Azure included storage is substantially smaller and Azure cannot represent the existing eight-tier list unchanged.[5]
- MongoDB’s AWS reference has an M80 inconsistency: a general table reports 131 GB, while Gen2 documentation and current calculator metadata report 128 GiB. Use 128 GiB only when modeling the currently exposed configuration and retain this caveat.[1][3]
- Low-CPU, NVMe, and Gen2 variants are distinct instance classes and must not be silently substituted for a missing standard tier.

## Monthly-estimate calculation

MongoDB bills Atlas usage hourly and issues invoices monthly. The official calculator’s public client source calculates display periods from an annual amount:

```text
hourly = annual / 365 / 24
monthly = annual / 365 * 30
```

Therefore:

```text
monthly = unrounded_hourly * 720
```

Use the underlying unrounded amount, then round only the displayed result. Do not multiply the calculator’s already rounded two-decimal hourly label by 720 when exact parity matters. For example, zero-network M40 displays `$1.02/hr` and `$736.56/mo`; `$1.02 × 720` would incorrectly produce `$734.40`.[1]

The base hourly cluster amount depends on provider, region, tier, and included/default storage. Custom storage, backup, data transfer/network assumptions, additional or multi-region nodes, support, and taxes can add cost; negotiated terms can also change actual charges.[1][6]

## Implementation constraints

- Keep provider + region + instance class as the pricing key; do not assume one global tier price even though the tested baseline-region displays currently match.
- Store an effective/retrieval date and distinguish standard, Gen2, low-CPU, and NVMe classes.
- Mark Azure M140/M300 standard as unavailable rather than substituting another class.
- Mark standard M30 GCP/Azure pricing as unavailable until MongoDB exposes an attributable current value or supplies one directly.
- Treat displayed rates as estimates, not a durable price API. No stable public static API/rate sheet exposing exact provider-region annual amounts was found.

## Official sources

1. [MongoDB Atlas Pricing Calculator](https://www.mongodb.com/pricing/calculator) — interactive provider, region, tier, specification, hourly, and monthly outputs; public calculator metadata/assets.
2. [MongoDB Pricing](https://www.mongodb.com/pricing) — static dedicated-tier hourly table.
3. [MongoDB Atlas on Amazon Web Services](https://www.mongodb.com/docs/atlas/reference/amazon-aws/) — AWS regions, instance sizes, RAM/vCPU, and storage.
4. [MongoDB Atlas on Google Cloud](https://www.mongodb.com/docs/atlas/reference/google-gcp/) — Google Cloud regions, instance sizes, RAM/vCPU, and storage.
5. [MongoDB Atlas on Microsoft Azure](https://www.mongodb.com/docs/atlas/reference/microsoft-azure/) — Azure regions, supported instance sizes, RAM/vCPU, and storage.
6. [Atlas cluster configuration costs](https://www.mongodb.com/docs/atlas/billing/cluster-configuration-costs/) — hourly billing and configuration-dependent costs.
