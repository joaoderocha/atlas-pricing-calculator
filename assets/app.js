// Published AWS us-east-1 dedicated tier specs & pricing
const TIERS = [
  { tier: "M30",  ramGB: 8,   vcpu: 2,  defaultStorageGB: 40,   maxStdStorageTB: 0.5, maxExtStorageTB: 0.5, hourlyUSD: 0.54,  monthlyUSD: 387.62 },
  { tier: "M40",  ramGB: 16,  vcpu: 4,  defaultStorageGB: 80,   maxStdStorageTB: 1,   maxExtStorageTB: 4,   hourlyUSD: 1.04,  monthlyUSD: 746.79 },
  { tier: "M50",  ramGB: 32,  vcpu: 8,  defaultStorageGB: 160,  maxStdStorageTB: 4,   maxExtStorageTB: 8,   hourlyUSD: 2.00,  monthlyUSD: 1436.64 },
  { tier: "M60",  ramGB: 64,  vcpu: 16, defaultStorageGB: 320,  maxStdStorageTB: 4,   maxExtStorageTB: 8,   hourlyUSD: 3.95,  monthlyUSD: 2847.00 },
  { tier: "M80",  ramGB: 128, vcpu: 32, defaultStorageGB: 750,  maxStdStorageTB: 4,   maxExtStorageTB: 14,  hourlyUSD: 7.30,  monthlyUSD: 5258.19 },
  { tier: "M140", ramGB: 192, vcpu: 48, defaultStorageGB: 1024, maxStdStorageTB: 4,   maxExtStorageTB: 14,  hourlyUSD: 10.99, monthlyUSD: 7914.65 },
  { tier: "M200", ramGB: 256, vcpu: 64, defaultStorageGB: 1536, maxStdStorageTB: 4,   maxExtStorageTB: 14,  hourlyUSD: 14.59, monthlyUSD: 10507.62 },
  { tier: "M300", ramGB: 384, vcpu: 96, defaultStorageGB: 2048, maxStdStorageTB: 4,   maxExtStorageTB: 14,  hourlyUSD: 21.85, monthlyUSD: 15735.15 }
];

const METRIC_LABELS = {
  ramGB: "RAM (GB)",
  vcpu: "vCPUs",
  maxStdStorageTB: "Max Standard Storage (TB)",
  maxExtStorageTB: "Max Extended Storage (TB)"
};

const state = {
  metric: "ramGB",
  tierA: "M60",
  countA: 1,
  tierB: "M40",
  countB: 4
};

const tierMap = Object.fromEntries(TIERS.map(t => [t.tier, t]));

// Populate dropdowns
const selA = document.getElementById("tierA");
const selB = document.getElementById("tierB");
TIERS.forEach(t => {
  const label = `${t.tier} (${t.ramGB} GB / ${t.vcpu} vCPU)`;
  selA.add(new Option(label, t.tier));
  selB.add(new Option(label, t.tier));
});
selA.value = state.tierA;
selB.value = state.tierB;

// Formatting helpers
const fmtUSD = n => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtNum = (n, suffix = "") => `${Number(n.toFixed(2)).toLocaleString("en-US")}${suffix}`;

function calcTotals(tierName, count) {
  const t = tierMap[tierName];
  return {
    monthly: t.monthlyUSD * count,
    hourly: t.hourlyUSD * count,
    ram: t.ramGB * count,
    vcpu: t.vcpu * count,
    stdTB: t.maxStdStorageTB * count,
    extTB: t.maxExtStorageTB * count
  };
}

// Initialize Top Chart (Scatter: Resource vs Monthly Cost)
const tierChart = new Chart(document.getElementById("tierChart"), {
  type: "scatter",
  data: { datasets: [] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const t = ctx.raw.meta;
            return [
              `${t.tier} — ${fmtUSD(t.monthlyUSD)}/mo (${fmtUSD(t.hourlyUSD)}/hr)`,
              `RAM: ${t.ramGB} GB | vCPUs: ${t.vcpu}`,
              `Storage: ${t.defaultStorageGB} GB def | ${t.maxStdStorageTB} TB std | ${t.maxExtStorageTB} TB ext`
            ];
          }
        }
      }
    },
    scales: {
      x: { title: { display: true, text: METRIC_LABELS[state.metric] } },
      y: {
        title: { display: true, text: "Monthly Cost (USD)" },
        ticks: { callback: v => "$" + v.toLocaleString() }
      }
    }
  }
});

// Initialize Bottom Chart (Grouped Bar Comparison)
const compareChart = new Chart(document.getElementById("compareChart"), {
  type: "bar",
  data: {
    labels: ["Monthly Cost ($100s)", "Total RAM (GB)", "Total vCPUs", "Max Std Storage (TB)", "Max Ext Storage (TB)"],
    datasets: [
      { label: "Config A", data: [], backgroundColor: "#00684a", borderRadius: 6 },
      { label: "Config B", data: [], backgroundColor: "#2563eb", borderRadius: 6 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

function render() {
  const a = calcTotals(state.tierA, state.countA);
  const b = calcTotals(state.tierB, state.countB);
  const nameA = `${state.countA}× ${state.tierA}`;
  const nameB = `${state.countB}× ${state.tierB}`;

  // Labels
  document.getElementById("labelA").textContent = nameA;
  document.getElementById("labelB").textContent = nameB;
  document.getElementById("countAVal").textContent = state.countA;
  document.getElementById("countBVal").textContent = state.countB;
  document.getElementById("thA").textContent = nameA;
  document.getElementById("thB").textContent = nameB;

  // Cost delta banner
  const costDiff = a.monthly - b.monthly;
  const pct = ((costDiff / b.monthly) * 100).toFixed(1);
  const direction = costDiff < 0 ? "cheaper" : costDiff > 0 ? "more expensive" : "the exact same cost";
  document.getElementById("deltaBanner").innerHTML =
    costDiff === 0
      ? `<strong>${nameA}</strong> and <strong>${nameB}</strong> cost the same (${fmtUSD(a.monthly)}/mo).`
      : `<strong>${nameA}</strong> is <strong>${Math.abs(pct)}% ${direction}</strong> than <strong>${nameB}</strong> (${costDiff > 0 ? "+" : "-"}${fmtUSD(Math.abs(costDiff))}/mo).`;

  // Summary table
  const rows = [
    ["Monthly Cost", fmtUSD(a.monthly), fmtUSD(b.monthly), costDiff, v => (v > 0 ? "+" : "-") + fmtUSD(Math.abs(v)), true],
    ["Hourly Cost", fmtUSD(a.hourly), fmtUSD(b.hourly), a.hourly - b.hourly, v => (v > 0 ? "+" : "-") + fmtUSD(Math.abs(v)), true],
    ["Total RAM", fmtNum(a.ram, " GB"), fmtNum(b.ram, " GB"), a.ram - b.ram, v => (v > 0 ? "+" : "") + fmtNum(v, " GB"), false],
    ["Total vCPUs", fmtNum(a.vcpu), fmtNum(b.vcpu), a.vcpu - b.vcpu, v => (v > 0 ? "+" : "") + fmtNum(v), false],
    ["Max Standard Storage", fmtNum(a.stdTB, " TB"), fmtNum(b.stdTB, " TB"), a.stdTB - b.stdTB, v => (v > 0 ? "+" : "") + fmtNum(v, " TB"), false],
    ["Max Extended Storage", fmtNum(a.extTB, " TB"), fmtNum(b.extTB, " TB"), a.extTB - b.extTB, v => (v > 0 ? "+" : "") + fmtNum(v, " TB"), false]
  ];

  document.getElementById("summaryBody").innerHTML = rows.map(([label, valA, valB, diff, fmtDiff, isCost]) => {
    let cls = "";
    if (diff !== 0) cls = isCost ? (diff > 0 ? "pos" : "neg") : (diff > 0 ? "neg" : "pos");
    return `
      <tr>
        <td>${label}</td>
        <td>${valA}</td>
        <td>${valB}</td>
        <td class="${cls}">${diff === 0 ? "Same" : fmtDiff(diff)}</td>
      </tr>`;
  }).join("");

  // Update Top Chart
  tierChart.data.datasets = [{
    data: TIERS.map(t => ({ x: t[state.metric], y: t.monthlyUSD, meta: t })),
    pointRadius: TIERS.map(t => (t.tier === state.tierA || t.tier === state.tierB) ? 9 : 6),
    pointBackgroundColor: TIERS.map(t => {
      if (t.tier === state.tierA && t.tier === state.tierB) return "#7c3aed";
      if (t.tier === state.tierA) return "#00684a";
      if (t.tier === state.tierB) return "#2563eb";
      return "#94a3b8";
    }),
    showLine: true,
    borderColor: "#cbd5e1",
    borderWidth: 2
  }];
  tierChart.options.scales.x.title.text = METRIC_LABELS[state.metric];
  tierChart.update();

  // Update Bottom Chart
  compareChart.data.datasets[0].label = nameA;
  compareChart.data.datasets[1].label = nameB;
  compareChart.data.datasets[0].data = [+(a.monthly / 100).toFixed(2), a.ram, a.vcpu, a.stdTB, a.extTB];
  compareChart.data.datasets[1].data = [+(b.monthly / 100).toFixed(2), b.ram, b.vcpu, b.stdTB, b.extTB];
  compareChart.update();
}

// Event listeners
document.getElementById("metricButtons").addEventListener("click", e => {
  if (e.target.tagName !== "BUTTON") return;
  document.querySelectorAll("#metricButtons button").forEach(b => b.classList.remove("active"));
  e.target.classList.add("active");
  state.metric = e.target.dataset.metric;
  render();
});

selA.addEventListener("change", e => { state.tierA = e.target.value; render(); });
selB.addEventListener("change", e => { state.tierB = e.target.value; render(); });
document.getElementById("countA").addEventListener("input", e => { state.countA = +e.target.value; render(); });
document.getElementById("countB").addEventListener("input", e => { state.countB = +e.target.value; render(); });

render();
