// Atlas Pricing Calculator snapshot retrieved 2026-11-26.
// Baselines: one standard three-node replica set, default storage, no backup or network cost.
const PROVIDERS = {
  aws: {
    label: "AWS",
    region: "N. Virginia (us-east-1)",
    color: "#00684a",
    tiers: [
      { tier: "M30", instanceClass: "M30_GEN_2", ramGB: 8, vcpu: 2, defaultStorageGB: 40, monthlyUSD: 431.99 },
      { tier: "M40", instanceClass: "M40", ramGB: 16, vcpu: 4, defaultStorageGB: 80, monthlyUSD: 736.56 },
      { tier: "M50", instanceClass: "M50", ramGB: 32, vcpu: 8, defaultStorageGB: 160, monthlyUSD: 1416.96 },
      { tier: "M60", instanceClass: "M60", ramGB: 64, vcpu: 16, defaultStorageGB: 320, monthlyUSD: 2808.00 },
      { tier: "M80", instanceClass: "M80", ramGB: 128, vcpu: 32, defaultStorageGB: 750, monthlyUSD: 5186.16 },
      { tier: "M140", instanceClass: "M140", ramGB: 192, vcpu: 48, defaultStorageGB: 1024, monthlyUSD: 7806.24 },
      { tier: "M200", instanceClass: "M200", ramGB: 256, vcpu: 64, defaultStorageGB: 1536, monthlyUSD: 10363.68 },
      { tier: "M300", instanceClass: "M300", ramGB: 384, vcpu: 96, defaultStorageGB: 2048, monthlyUSD: 15519.60 }
    ]
  },
  gcp: {
    label: "Google Cloud",
    region: "Iowa (us-central1)",
    color: "#4285f4",
    tiers: [
      { tier: "M40", instanceClass: "M40", ramGB: 16, vcpu: 4, defaultStorageGB: 80, monthlyUSD: 736.56 },
      { tier: "M50", instanceClass: "M50", ramGB: 32, vcpu: 8, defaultStorageGB: 160, monthlyUSD: 1416.96 },
      { tier: "M60", instanceClass: "M60", ramGB: 64, vcpu: 16, defaultStorageGB: 320, monthlyUSD: 2808.00 },
      { tier: "M80", instanceClass: "M80", ramGB: 128, vcpu: 32, defaultStorageGB: 750, monthlyUSD: 5186.16 },
      { tier: "M140", instanceClass: "M140", ramGB: 192, vcpu: 48, defaultStorageGB: 1024, monthlyUSD: 7806.24 },
      { tier: "M200", instanceClass: "M200", ramGB: 256, vcpu: 64, defaultStorageGB: 1536, monthlyUSD: 10363.68 },
      { tier: "M300", instanceClass: "M300", ramGB: 360, vcpu: 96, defaultStorageGB: 2048, monthlyUSD: 15519.60 }
    ]
  },
  azure: {
    label: "Azure",
    region: "Virginia-East2 (eastus2)",
    color: "#0078d4",
    tiers: [
      { tier: "M40", instanceClass: "M40", ramGB: 16, vcpu: 4, defaultStorageGB: 64, monthlyUSD: 736.56 },
      { tier: "M50", instanceClass: "M50", ramGB: 32, vcpu: 8, defaultStorageGB: 128, monthlyUSD: 1416.96 },
      { tier: "M60", instanceClass: "M60", ramGB: 64, vcpu: 16, defaultStorageGB: 128, monthlyUSD: 2808.00 },
      { tier: "M80", instanceClass: "M80", ramGB: 128, vcpu: 32, defaultStorageGB: 256, monthlyUSD: 5186.16 },
      { tier: "M200", instanceClass: "M200", ramGB: 256, vcpu: 64, defaultStorageGB: 256, monthlyUSD: 10363.68 }
    ]
  }
};

const METRIC_LABELS = {
  ramGB: "RAM (GB)",
  vcpu: "vCPUs",
  defaultStorageGB: "Included Storage (GB)"
};

const state = {
  metric: "ramGB",
  providerA: "aws",
  tierA: "M60",
  countA: 1,
  providerB: "azure",
  tierB: "M40",
  countB: 4
};

const providerASelect = document.getElementById("providerA");
const providerBSelect = document.getElementById("providerB");
const tierASelect = document.getElementById("tierA");
const tierBSelect = document.getElementById("tierB");

function populateProviderSelect(select, selectedProvider) {
  Object.entries(PROVIDERS).forEach(([key, provider]) => {
    select.add(new Option(`${provider.label} — ${provider.region}`, key));
  });
  select.value = selectedProvider;
}

function populateTierSelect(select, providerKey, selectedTier) {
  const tiers = PROVIDERS[providerKey].tiers;
  select.replaceChildren();

  tiers.forEach(tier => {
    const classLabel = tier.instanceClass === tier.tier ? tier.tier : `${tier.tier} Gen2`;
    select.add(new Option(`${classLabel} (${tier.ramGB} GB / ${tier.vcpu} vCPU)`, tier.tier));
  });

  const nextTier = tiers.some(tier => tier.tier === selectedTier)
    ? selectedTier
    : tiers.find(tier => tier.tier === "M60")?.tier ?? tiers[0].tier;

  select.value = nextTier;
  return nextTier;
}

populateProviderSelect(providerASelect, state.providerA);
populateProviderSelect(providerBSelect, state.providerB);
state.tierA = populateTierSelect(tierASelect, state.providerA, state.tierA);
state.tierB = populateTierSelect(tierBSelect, state.providerB, state.tierB);

const fmtUSD = value => "$" + value.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const fmtNum = (value, suffix = "") => `${Number(value.toFixed(2)).toLocaleString("en-US")}${suffix}`;

function findTier(providerKey, tierName) {
  return PROVIDERS[providerKey].tiers.find(tier => tier.tier === tierName);
}

function calcTotals(providerKey, tierName, count) {
  const tier = findTier(providerKey, tierName);
  return {
    monthly: tier.monthlyUSD * count,
    hourly: (tier.monthlyUSD / 720) * count,
    ram: tier.ramGB * count,
    vcpu: tier.vcpu * count,
    storageGB: tier.defaultStorageGB * count
  };
}

function configurationName(providerKey, tierName, count) {
  return `${count}× ${PROVIDERS[providerKey].label} ${tierName}`;
}

const tierChart = new Chart(document.getElementById("tierChart"), {
  type: "scatter",
  data: { datasets: [] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: context => {
            const tier = context.raw.meta;
            return [
              `${tier.providerLabel} ${tier.tier} — ${fmtUSD(tier.monthlyUSD)}/mo (${fmtUSD(tier.monthlyUSD / 720)}/hr)`,
              `RAM: ${tier.ramGB} GB | vCPUs: ${tier.vcpu}`,
              `Included storage: ${tier.defaultStorageGB} GB | ${tier.region}`
            ];
          }
        }
      }
    },
    scales: {
      x: { title: { display: true, text: METRIC_LABELS[state.metric] } },
      y: {
        title: { display: true, text: "Estimated Monthly Cost (USD)" },
        ticks: { callback: value => "$" + value.toLocaleString() }
      }
    }
  }
});

const compareChart = new Chart(document.getElementById("compareChart"), {
  type: "bar",
  data: {
    labels: ["Monthly Cost ($100s)", "Total RAM (GB)", "Total vCPUs", "Included Storage (GB)"],
    datasets: [
      { label: "Config A", data: [], backgroundColor: "#00684a", borderRadius: 6 },
      { label: "Config B", data: [], backgroundColor: "#2563eb", borderRadius: 6 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } }
  }
});

function buildTierDataset(providerKey) {
  const provider = PROVIDERS[providerKey];
  const selectedA = state.providerA === providerKey ? state.tierA : null;
  const selectedB = state.providerB === providerKey ? state.tierB : null;

  return {
    label: `${provider.label} — ${provider.region}`,
    data: provider.tiers.map(tier => ({
      x: tier[state.metric],
      y: tier.monthlyUSD,
      meta: { ...tier, providerLabel: provider.label, region: provider.region }
    })),
    pointRadius: provider.tiers.map(tier => selectedA === tier.tier || selectedB === tier.tier ? 9 : 6),
    pointBackgroundColor: provider.tiers.map(tier => {
      if (selectedA === tier.tier && selectedB === tier.tier) return "#7c3aed";
      if (selectedA === tier.tier) return "#00684a";
      if (selectedB === tier.tier) return "#2563eb";
      return provider.color;
    }),
    showLine: true,
    borderColor: provider.color,
    borderWidth: 2
  };
}

function render() {
  const a = calcTotals(state.providerA, state.tierA, state.countA);
  const b = calcTotals(state.providerB, state.tierB, state.countB);
  const nameA = configurationName(state.providerA, state.tierA, state.countA);
  const nameB = configurationName(state.providerB, state.tierB, state.countB);

  document.getElementById("labelA").textContent = nameA;
  document.getElementById("labelB").textContent = nameB;
  document.getElementById("countAVal").textContent = state.countA;
  document.getElementById("countBVal").textContent = state.countB;
  document.getElementById("thA").textContent = nameA;
  document.getElementById("thB").textContent = nameB;

  const costDiff = a.monthly - b.monthly;
  const percentage = ((costDiff / b.monthly) * 100).toFixed(1);
  const direction = costDiff < 0 ? "cheaper" : costDiff > 0 ? "more expensive" : "the exact same cost";
  document.getElementById("deltaBanner").innerHTML = costDiff === 0
    ? `<strong>${nameA}</strong> and <strong>${nameB}</strong> cost the same (${fmtUSD(a.monthly)}/mo).`
    : `<strong>${nameA}</strong> is <strong>${Math.abs(percentage)}% ${direction}</strong> than <strong>${nameB}</strong> (${costDiff > 0 ? "+" : "-"}${fmtUSD(Math.abs(costDiff))}/mo).`;

  const rows = [
    ["Estimated Monthly Cost", fmtUSD(a.monthly), fmtUSD(b.monthly), costDiff, value => (value > 0 ? "+" : "-") + fmtUSD(Math.abs(value)), true],
    ["Estimated Hourly Cost", fmtUSD(a.hourly), fmtUSD(b.hourly), a.hourly - b.hourly, value => (value > 0 ? "+" : "-") + fmtUSD(Math.abs(value)), true],
    ["Total RAM", fmtNum(a.ram, " GB"), fmtNum(b.ram, " GB"), a.ram - b.ram, value => (value > 0 ? "+" : "") + fmtNum(value, " GB"), false],
    ["Total vCPUs", fmtNum(a.vcpu), fmtNum(b.vcpu), a.vcpu - b.vcpu, value => (value > 0 ? "+" : "") + fmtNum(value), false],
    ["Included Storage", fmtNum(a.storageGB, " GB"), fmtNum(b.storageGB, " GB"), a.storageGB - b.storageGB, value => (value > 0 ? "+" : "") + fmtNum(value, " GB"), false]
  ];

  document.getElementById("summaryBody").innerHTML = rows.map(([label, valueA, valueB, difference, formatDifference, isCost]) => {
    let className = "";
    if (difference !== 0) className = isCost ? (difference > 0 ? "pos" : "neg") : (difference > 0 ? "neg" : "pos");
    return `
      <tr>
        <td>${label}</td>
        <td>${valueA}</td>
        <td>${valueB}</td>
        <td class="${className}">${difference === 0 ? "Same" : formatDifference(difference)}</td>
      </tr>`;
  }).join("");

  const selectedProviders = [...new Set([state.providerA, state.providerB])];
  tierChart.data.datasets = selectedProviders.map(buildTierDataset);
  tierChart.options.scales.x.title.text = METRIC_LABELS[state.metric];
  tierChart.update();

  compareChart.data.datasets[0].label = nameA;
  compareChart.data.datasets[1].label = nameB;
  compareChart.data.datasets[0].data = [+(a.monthly / 100).toFixed(2), a.ram, a.vcpu, a.storageGB];
  compareChart.data.datasets[1].data = [+(b.monthly / 100).toFixed(2), b.ram, b.vcpu, b.storageGB];
  compareChart.update();
}

document.getElementById("metricButtons").addEventListener("click", event => {
  if (event.target.tagName !== "BUTTON") return;
  document.querySelectorAll("#metricButtons button").forEach(button => button.classList.remove("active"));
  event.target.classList.add("active");
  state.metric = event.target.dataset.metric;
  render();
});

providerASelect.addEventListener("change", event => {
  state.providerA = event.target.value;
  state.tierA = populateTierSelect(tierASelect, state.providerA, state.tierA);
  render();
});
providerBSelect.addEventListener("change", event => {
  state.providerB = event.target.value;
  state.tierB = populateTierSelect(tierBSelect, state.providerB, state.tierB);
  render();
});
tierASelect.addEventListener("change", event => { state.tierA = event.target.value; render(); });
tierBSelect.addEventListener("change", event => { state.tierB = event.target.value; render(); });
document.getElementById("countA").addEventListener("input", event => { state.countA = +event.target.value; render(); });
document.getElementById("countB").addEventListener("input", event => { state.countB = +event.target.value; render(); });

render();
