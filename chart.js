/**
 * Live Environmental Chart Manager powered by Chart.js
 * Renders all sensor streams simultaneously in real-time on the same graph.
 */
class LiveChartManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.chart = null;
    this.maxPoints = 20;
    
    this.initChart();
  }

  initChart() {
    const gradientAQI = this.ctx.createLinearGradient(0, 0, 0, 250);
    gradientAQI.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    gradientAQI.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    const gradientMQ135 = this.ctx.createLinearGradient(0, 0, 0, 250);
    gradientMQ135.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    gradientMQ135.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'AQI Index',
            data: [],
            borderColor: '#06b6d4',
            backgroundColor: gradientAQI,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#06b6d4',
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#ffffff',
            yAxisID: 'y'
          },
          {
            label: 'MQ135 Gas (PPM)',
            data: [],
            borderColor: '#8b5cf6',
            backgroundColor: gradientMQ135,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#8b5cf6',
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#ffffff',
            yAxisID: 'y'
          },
          {
            label: 'Temperature (°C)',
            data: [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            borderWidth: 2,
            borderDash: [4, 2],
            fill: false,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#f59e0b',
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#ffffff',
            yAxisID: 'y1'
          },
          {
            label: 'Humidity (%)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 2,
            borderDash: [2, 2],
            fill: false,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#10b981',
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#ffffff',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 11, weight: '500' },
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 6,
              boxHeight: 6,
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleFont: { family: 'Outfit', size: 13, weight: '600' },
            bodyFont: { family: 'Fira Code', size: 11 },
            borderColor: 'rgba(6, 182, 212, 0.3)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            usePointStyle: true
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.04)'
            },
            ticks: {
              color: '#64748b',
              font: { family: 'Fira Code', size: 10 },
              maxTicksLimit: 8
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(255, 255, 255, 0.04)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Fira Code', size: 10 }
            },
            title: {
              display: true,
              text: 'AQI / PPM',
              color: '#64748b',
              font: { family: 'Outfit', size: 10 }
            },
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false // prevent grid line overlap
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Fira Code', size: 10 }
            },
            title: {
              display: true,
              text: '°C / %',
              color: '#64748b',
              font: { family: 'Outfit', size: 10 }
            },
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  setMetric(metric) {
    // Legacy support method maintained for API compatibility
  }

  addDataPoint(timestamp, dataObj) {
    if (!this.chart) return;

    this.chart.data.labels.push(timestamp);
    this.chart.data.datasets[0].data.push(dataObj.aqi);
    this.chart.data.datasets[1].data.push(dataObj.ppm);
    this.chart.data.datasets[2].data.push(dataObj.temp);
    this.chart.data.datasets[3].data.push(dataObj.humidity);

    if (this.chart.data.labels.length > this.maxPoints) {
      this.chart.data.labels.shift();
      this.chart.data.datasets.forEach(ds => ds.data.shift());
    }

    this.chart.update('none'); // Update smoothly without full redraw
  }
}

window.LiveChartManager = LiveChartManager;
