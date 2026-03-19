/**
 * charts.js — Chart.js grafik yönetimi
 */

const Charts = (() => {
  let monthlyChart = null;
  let materialChart = null;

  const GRID   = 'rgba(255,255,255,0.04)';
  const MUTED  = '#6b7090';
  const COLORS = ['#ff6b35','#4a9eff','#2ecc8a','#a78bfa','#ffaa00','#ff4757','#1dd1a1','#feca57'];

  function _applyDefaults() {
    Chart.defaults.color      = MUTED;
    Chart.defaults.font.family = "'Syne', sans-serif";
    Chart.defaults.font.size  = 12;
  }

  function init() {
    _applyDefaults();

    // Monthly bar chart
    const mc = document.getElementById('chart-monthly');
    if (mc) {
      monthlyChart = new Chart(mc, {
        type: 'bar',
        data: { labels: [], datasets: [{
          data: [],
          backgroundColor: 'rgba(255,107,53,0.55)',
          borderColor: '#ff6b35',
          borderWidth: 1,
          borderRadius: 5,
          borderSkipped: false,
        }]},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} baskı`,
            },
          }},
          scales: {
            x: { grid: { color: GRID }, ticks: { color: MUTED } },
            y: { grid: { color: GRID }, ticks: { color: MUTED, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    }

    // Material doughnut
    const dc = document.getElementById('chart-material');
    if (dc) {
      materialChart = new Chart(dc, {
        type: 'doughnut',
        data: { labels: [], datasets: [{
          data: [],
          backgroundColor: COLORS,
          borderWidth: 0,
          hoverOffset: 6,
        }]},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 12, font: { size: 11 }, color: MUTED, boxWidth: 10, borderRadius: 3 },
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${ctx.parsed}g`,
              },
            },
          },
        },
      });
    }

    update();
  }

  function update() {
    _updateMonthly();
    _updateMaterial();
  }

  function _updateMonthly() {
    if (!monthlyChart) return;
    const prints = Store.getPrints();
    const labels = [], counts = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      labels.push(d.toLocaleDateString('tr-TR', { month: 'short' }));
      counts.push(prints.filter(p => {
        const pd = new Date(p.date);
        return pd.getMonth() === m && pd.getFullYear() === y;
      }).length);
    }

    monthlyChart.data.labels              = labels;
    monthlyChart.data.datasets[0].data    = counts;
    monthlyChart.update('none');
  }

  function _updateMaterial() {
    if (!materialChart) return;
    const prints    = Store.getPrints();
    const filaments = Store.getFilaments();
    const map = {};

    prints.forEach(p => {
      const fil = filaments.find(f => f.id === p.filament);
      if (fil) map[fil.type] = (map[fil.type] || 0) + (p.grams || 0);
    });

    materialChart.data.labels           = Object.keys(map);
    materialChart.data.datasets[0].data = Object.values(map);
    materialChart.update('none');
  }

  return { init, update };
})();
