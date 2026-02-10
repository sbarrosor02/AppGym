// ========== Lightweight Canvas Chart ==========
const Chart = {
    draw(canvas, data, options = {}) {
        if (!canvas || !data || data.length === 0) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 16, bottom: 32, left: 44 };

        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        // Extract values
        const values = data.map(d => d.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || 1;
        const yMin = minVal - range * 0.1;
        const yMax = maxVal + range * 0.1;

        const color = options.color || '#a29bfe';

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Y axis labels
        ctx.fillStyle = '#555570';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'right';

        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const val = yMin + (yMax - yMin) * (i / ySteps);
            const y = padding.top + chartH - (chartH * (i / ySteps));

            ctx.fillText(val.toFixed(1), padding.left - 8, y + 4);

            // Grid line
            ctx.strokeStyle = 'rgba(42, 42, 62, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartW, y);
            ctx.stroke();
        }

        if (data.length === 1) {
            // Single point
            const x = padding.left + chartW / 2;
            const y = padding.top + chartH / 2;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#8888a0';
            ctx.font = '10px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(data[0].label, x, height - 8);
            return;
        }

        // Points
        const points = data.map((d, i) => ({
            x: padding.left + (chartW * i) / (data.length - 1),
            y: padding.top + chartH - (chartH * (d.value - yMin) / (yMax - yMin))
        }));

        // Fill area
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartH);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Dots
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#0a0a0f';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // X labels
        ctx.fillStyle = '#555570';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';

        const maxLabels = 6;
        const step = Math.max(1, Math.floor(data.length / maxLabels));
        data.forEach((d, i) => {
            if (i % step === 0 || i === data.length - 1) {
                ctx.fillText(d.label, points[i].x, height - 8);
            }
        });
    }
};
