export function LineGraph() {
    let xDomain = [-4.9, 6];
    let yDomain = [0, 5];
    let f = (x) => Math.log(1 + Math.abs(x) ** (2 + Math.sin(x)));

    function chart(div) {
        const width = div.nodes()[0].offsetWidth;
        const height = width * 0.5;
        const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
        const yScale = d3
            .scaleLinear()
            .domain(yDomain)
            .range([height - 8, 8]);

        // create svg if not already existing
        div.selectAll('svg').data([0]).enter().append('svg');

        const svg = div.select('svg').attr('width', width).attr('height', height);

        const colours = d3.schemeCategory10;
        function line(f) {
            return d3
                .line()
                .x((d) => xScale(d))
                .y((d) => yScale(f(d)));
        }
        const samples = 2000;
        const data = d3.range(xDomain[0], xDomain[1], xDomain[1] / samples);

        const paths = svg
            .selectAll('path')
            .data([f])
            .enter()
            .append('path')
            .attr('stroke', (d, i) => colours[0])
            .attr('stroke-width', 2)
            .style('stroke-opacity', 0.8)
            .attr('fill', 'None')
            .attr('d', (f) => line(f)(data));

        d3.select('body')
            .selectAll('.tooltip')
            .data([0])
            .enter()
            .append('div')
            .attr('class', 'tooltip')
            .style('font-size', '12px')
            .style('position', 'absolute')
            .style('text-align', 'center')
            .style('width', '128px')
            .style('height', '32px')
            .style('background', '#333')
            .style('color', '#ddd')
            .style('padding', '0px')
            .style('border', '0px')
            .style('border-radius', '8px')
            .style('opacity', '0');

        const tooltip = d3.selectAll('.tooltip');

        const linetip = svg.append('line').attr('stroke-width', 1).attr('stroke-opacity', 0).attr('stroke', '#CCC');

        const circletip = svg
            .append('circle')
            .attr('stroke-opacity', 0)
            .attr('fill-opacity', 0)
            .attr('r', 3)
            .attr('stroke', '#AAA')
            .attr('fill', '#AAA');

        function showtooltip() {
            tooltip.style('opacity', 0.9);
            linetip.style('stroke-opacity', 1);
            circletip.style('fill-opacity', 1);
            tooltip.style('z-index', '');
        }

        function hidetooltip() {
            tooltip.style('z-index', -1);
            tooltip.style('opacity', 0);
            linetip.style('stroke-opacity', 0);
            circletip.style('fill-opacity', 0);
        }

        svg.attr('width', width)
            .attr('height', height)
            .on('mouseover', showtooltip)
            .on('mouseout', hidetooltip)
            .on('mousemove', function () {
                const point = d3.mouse(this);
                const x = xScale.invert(point[0]);
                const fx = f(x);
                const y = yScale(fx);

                if (y < 0 || y > height) {
                    hidetooltip();
                } else {
                    showtooltip();
                    tooltip.style('left', `${d3.event.pageX}px`).style('top', `${d3.event.pageY - 44}px`);
                    tooltip.html(`x = ${x.toFixed(2)}<br>f(x) = ${fx.toFixed(2)}`);

                    linetip.attr('x1', point[0]).attr('x2', point[0]).attr('y1', point[1]).attr('y2', yScale(fx));
                    circletip.attr('cx', point[0]).attr('cy', yScale(fx));
                }
            });
        return { svg: svg, xScale: xScale, yScale: yScale };
    }

    chart.xDomain = (_) => {
        if (!arguments.length) return xDomain;
        xDomain = _;
        return chart;
    };

    chart.yDomain = (_) => {
        if (!arguments.length) return yDomain;
        yDomain = _;
        return chart;
    };

    chart.f = (_) => {
        if (!arguments.length) return f;
        f = _;
        return chart;
    };

    return chart;
}
