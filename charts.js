let pieChartInstance = null;
let barChartInstance = null;

function initCharts() {
    // Configuración global de fuentes y colores de Chart.js
    Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
    Chart.defaults.color = '#64748B'; // var(--text-muted) equivalente
}

function updateCharts(partidos, votosTotalesMap) {
    // Ordenar partidos por cantidad de votos de mayor a menor localmente para los charts
    const partidosOrdenados = [...partidos].sort((a, b) => {
        const votosA = votosTotalesMap[a.id] || 0;
        const votosB = votosTotalesMap[b.id] || 0;
        return votosB - votosA;
    });

    const labels = partidosOrdenados.map(p => p.sigla);
    const data = partidosOrdenados.map(p => votosTotalesMap[p.id] || 0);
    const backgroundColors = partidosOrdenados.map(p => p.color);

    // =======================================================
    // GRÁFICO DE BARRAS
    // =======================================================
    const barCtx = document.getElementById('barChart').getContext('2d');
    if (barChartInstance) {
        barChartInstance.data.labels = labels;
        barChartInstance.data.datasets[0].data = data;
        barChartInstance.data.datasets[0].backgroundColor = backgroundColors;
        barChartInstance.update();
    } else {
        barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votos Totales',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 14 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E2E8F0', drawBorder: false },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // =======================================================
    // GRÁFICO DE DONA (DISTRIBUCIÓN)
    // =======================================================
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    if (pieChartInstance) {
        pieChartInstance.data.labels = labels;
        pieChartInstance.data.datasets[0].data = data;
        pieChartInstance.data.datasets[0].backgroundColor = backgroundColors;
        pieChartInstance.update();
    } else {
        pieChartInstance = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'left',
                        align: 'start',
                        labels: {
                            usePointStyle: true,
                            padding: 12,
                            font: { size: 10, weight: '600' }
                        }
                    },
                    tooltip: {
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(2) + '%' : '0%';
                                    label += context.parsed + ' votos (' + percentage + ')';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
}
