let pieChartInstance = null;
let barChartInstance = null;

function initCharts() {
    // Configuración global de fuentes y colores de Chart.js
    Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
    Chart.defaults.color = '#64748B'; // var(--text-muted) equivalente
}

function updateCharts(partidos, votosTotalesMap, tendenciaData = null) {
    const isMobile = window.innerWidth <= 768;

    // 1. Datos para gráfico de Dona (Totales por Partido)
    const partidosOrdenados = [...partidos].sort((a, b) => (votosTotalesMap[b.id] || 0) - (votosTotalesMap[a.id] || 0));
    const labelsDonut = partidosOrdenados.map(p => p.sigla);
    const dataDonut = partidosOrdenados.map(p => votosTotalesMap[p.id] || 0);
    const colorsDonut = partidosOrdenados.map(p => p.color);

    // 2. Datos para gráfico de Barras (Tendencia por Zona)
    const labelsBar = tendenciaData ? tendenciaData.labels : labelsDonut;
    const valuesBar = tendenciaData ? tendenciaData.values : dataDonut;
    const colorsBar = tendenciaData ? tendenciaData.colors : colorsDonut;

    // =======================================================
    // GRÁGICO DE BARRAS (TENDENCIA)
    // =======================================================
    const barCtx = document.getElementById('barChart').getContext('2d');
    if (barChartInstance) {
        barChartInstance.options.indexAxis = isMobile ? 'y' : 'x';
        barChartInstance.data.labels = labelsBar;
        barChartInstance.data.datasets[0].data = valuesBar;
        barChartInstance.data.datasets[0].backgroundColor = colorsBar;
        barChartInstance.update();
    } else {
        barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labelsBar,
                datasets: [{
                    label: 'Votos Ganador',
                    data: valuesBar,
                    backgroundColor: colorsBar,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: isMobile ? 'y' : 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                let label = `Votos: ${ctx.parsed[isMobile ? 'x' : 'y'].toLocaleString()}`;
                                if (tendenciaData && tendenciaData.names && tendenciaData.names[ctx.dataIndex]) {
                                    return [`Partido: ${tendenciaData.names[ctx.dataIndex]}`, label];
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E2E8F0', drawBorder: false },
                        ticks: { font: { size: isMobile ? 10 : 12 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: isMobile ? 10 : 12 } }
                    }
                }
            }
        });
    }

    // =======================================================
    // GRÁGICO DE DONA (DISTRIBUCIÓN TOTAL)
    // =======================================================
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    if (pieChartInstance) {
        pieChartInstance.options.plugins.legend.position = isMobile ? 'top' : 'left';
        pieChartInstance.data.labels = labelsDonut;
        pieChartInstance.data.datasets[0].data = dataDonut;
        pieChartInstance.data.datasets[0].backgroundColor = colorsDonut;
        pieChartInstance.update();
    } else {
        pieChartInstance = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: labelsDonut,
                datasets: [{
                    data: dataDonut,
                    backgroundColor: colorsDonut,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: isMobile ? 'top' : 'left',
                        labels: {
                            usePointStyle: true,
                            font: { size: isMobile ? 9 : 10, weight: '600' },
                            padding: isMobile ? 10 : 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(2) + '%' : '0%';
                                return `${label}: ${context.parsed.toLocaleString()} votos (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    }
}