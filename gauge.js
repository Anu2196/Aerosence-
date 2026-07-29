/**
 * AQI Gauge Canvas Renderer
 * Renders an interactive, glowing semi-circular air quality meter with animated needle.
 */
class AQIGauge {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Internal state
    this.currentVal = 0;
    this.targetVal = 0;
    this.animationId = null;
    
    // Scale properties (AQI Scale 0 - 500)
    this.minVal = 0;
    this.maxVal = 500;
    
    // High-DPI Canvas scaling
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 300) * dpr;
    this.canvas.height = (rect.height || 180) * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width || 300;
    this.height = rect.height || 180;
    this.render();
  }

  setValue(val) {
    this.targetVal = Math.min(Math.max(val, 0), 500);
    this.animate();
  }

  animate() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    
    const step = () => {
      const diff = this.targetVal - this.currentVal;
      if (Math.abs(diff) < 0.2) {
        this.currentVal = this.targetVal;
        this.render();
      } else {
        this.currentVal += diff * 0.12; // Smooth spring interpolation
        this.render();
        this.animationId = requestAnimationFrame(step);
      }
    };
    step();
  }

  getStatusInfo(val) {
    if (val <= 50) {
      return { text: 'GOOD', color: '#10b981', class: 'status-good', bg: 'rgba(16, 185, 129, 0.15)' };
    } else if (val <= 100) {
      return { text: 'MODERATE', color: '#f59e0b', class: 'status-moderate', bg: 'rgba(245, 158, 11, 0.15)' };
    } else if (val <= 200) {
      return { text: 'POOR', color: '#f97316', class: 'status-poor', bg: 'rgba(249, 115, 22, 0.15)' };
    } else {
      return { text: 'HAZARDOUS', color: '#ef4444', class: 'status-hazardous', bg: 'rgba(239, 68, 68, 0.2)' };
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h - 25;
    const radius = Math.min(w, h * 1.6) / 2 - 20;

    const startAngle = Math.PI * 0.85;
    const endAngle = Math.PI * 2.15;
    const totalAngle = endAngle - startAngle;

    // 1. Draw Outer Track Background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.lineWidth = 18;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Draw Color Arcs (4 Tiers: Good 0-50, Moderate 51-100, Poor 101-200, Hazardous 201-500)
    const zones = [
      { from: 0, to: 50, color: '#10b981' },
      { from: 50, to: 100, color: '#f59e0b' },
      { from: 100, to: 200, color: '#f97316' },
      { from: 200, to: 500, color: '#ef4444' }
    ];

    zones.forEach(z => {
      const zStartAngle = startAngle + (z.from / this.maxVal) * totalAngle;
      const zEndAngle = startAngle + (z.to / this.maxVal) * totalAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, zStartAngle, zEndAngle);
      ctx.lineWidth = 14;
      ctx.strokeStyle = z.color;
      ctx.globalAlpha = 0.45;
      ctx.lineCap = 'butt';
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // 3. Draw Active Glow Arc up to Current Value
    const activePercent = this.currentVal / this.maxVal;
    const activeAngle = startAngle + activePercent * totalAngle;
    const status = this.getStatusInfo(this.currentVal);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, activeAngle);
    ctx.lineWidth = 18;
    ctx.strokeStyle = status.color;
    ctx.shadowColor = status.color;
    ctx.shadowBlur = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 4. Draw Tick Marks
    for (let i = 0; i <= 10; i++) {
      const tickVal = (this.maxVal / 10) * i;
      const tickAngle = startAngle + (i / 10) * totalAngle;
      const innerR = radius - 24;
      const outerR = radius - 16;

      const x1 = cx + Math.cos(tickAngle) * innerR;
      const y1 = cy + Math.sin(tickAngle) * innerR;
      const x2 = cx + Math.cos(tickAngle) * outerR;
      const y2 = cy + Math.sin(tickAngle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = i % 2.5 === 0 ? 2.5 : 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();
    }

    // 5. Draw Animated Needle
    ctx.save();
    ctx.translate(cx, cy);
    const needleAngle = startAngle + (this.currentVal / this.maxVal) * totalAngle;
    ctx.rotate(needleAngle);

    // Needle shadow
    ctx.shadowColor = status.color;
    ctx.shadowBlur = 12;

    // Needle body
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -radius + 8);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center Cap
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = status.color;
    ctx.stroke();

    ctx.restore();

    // 6. Draw Value Text Display in Center
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Large AQI Number
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(Math.round(this.currentVal), cx, cy - 45);

    // AQI Label
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.fillStyle = status.color;
    ctx.fillText('AIR QUALITY INDEX (AQI)', cx, cy - 20);
  }
}

window.AQIGauge = AQIGauge;
