import { himmelblau } from './functions';
import { GradientContour } from './gradientDescent';
import { Slider } from './slider';

export function LineSearchContour(div) {
    this.duration = 1000;
    this.colour = d3.schemeCategory10[1];
    this.current = himmelblau;
    this.params = { c1: 1e-4, c2: 0.5 };
    GradientContour.call(this, div, true);
}

LineSearchContour.prototype = Object.create(GradientContour.prototype);

LineSearchContour.prototype.drawControls = function () {
    Slider(
        this.div.select('#c1'),
        [1e-5, 1],
        (x) => {
            this.params.c1 = x;
            this.div.select('#c1value').text(` = ${x.toFixed(4)}`);
            this.initialize(this.initial);
        },
        {
            format: (d) => d.toString(),
            initial: this.params.c1,
            scale: d3.scaleLog(),
            ticks: 5,
        },
    );

    Slider(
        this.div.select('#c2'),
        [1e-5, 1],
        (x) => {
            this.params.c2 = x;
            this.div.select('#c2value').text(` = ${x.toFixed(4)}`);
            this.initialize(this.initial);
        },
        {
            format: (d) => d.toString(),
            initial: this.params.c2,
            scale: d3.scaleLog(),
            ticks: 5,
        },
    );
};

LineSearchContour.prototype.calculateStates = function (initial) {
    this.stateIndex = 0;
    this.states = [];
    const f = (x, fxprime) => {
        this.current.fprime(x, fxprime);
        return this.current.f(x);
    };
    this.params.history = this.states;
    this.params.maxIterations = 5000;
    fmin.gradientDescentLineSearch(f, initial, this.params);
};

LineSearchContour.prototype.displayState = function () {
    if (this.stateIndex) {
        const d = this.states[this.stateIndex - 1];
        const g = this.plot.svg.select('.current .under').append('g');

        g.selectAll('circle')
            .data(d.functionCalls)
            .enter()
            .append('circle')
            .attr('stroke-opacity', 0.8)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill-opacity', 0)
            .attr('cx', (p) => this.plot.xScale(p[0]))
            .attr('cy', (p) => this.plot.yScale(p[1]))
            .attr('r', 3);
    } else {
        this.plot.svg.selectAll('.current .under g').data([]).exit().remove();
    }
    GradientContour.prototype.displayState.call(this);
};
