export function Slider(div, domain, callback, params) {
    params = params || {};
    const margin = params.margin || { right: 13, left: 10 };
    const height = params.height || 35;
    const format = params.format || ((d) => `${d}*`);
    const width = params.width || div.nodes()[0].offsetWidth;

    div.selectAll('svg').data([0]).enter().append('svg');
    const svg = div.select('svg').attr('width', width).attr('height', height);

    const x = (params.scale || d3.scaleLinear())
        .domain(domain)
        .range([0, width - margin.left - margin.right])
        .clamp(true);

    const slider = svg.append('g').attr('class', 'slider').attr('transform', `translate(${margin.left},${10})`);

    slider
        .append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-inset')

        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-overlay');

    // ugh: stroke-width on safari of track-overlay seems messed. drag on whole svg
    // instead
    svg.call(
        d3
            .drag()
            .on('start.interrupt', () => {
                slider.interrupt();
            })
            .on('start drag', () => {
                const value = x.invert(d3.event.x);
                handle.attr('cx', x(value));
                callback(value);
            }),
    );

    slider
        .insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', `translate(0,${18})`)
        .selectAll('text')
        .data(x.ticks(params.ticks || 5))
        .enter()
        .append('text')
        .attr('x', x)
        .attr('text-anchor', 'middle')
        .text(format);

    const handle = slider
        .insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(params.initial || x.invert(0)));

    function move(value, duration) {
        handle.transition().duration(duration).attr('cx', x(value));
    }

    function change(value) {
        handle.attr('cx', x(value));
        callback(value);
    }

    return { change: change, move: move };
}
