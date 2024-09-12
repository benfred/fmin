import { AnimatedContour } from './animatedContour';
import { Slider } from './slider';

export function GradientContour(div) {
    this.stepSize = 0.01;
    this.colour = this.colour || d3.schemeCategory10[1];
    this.duration = this.duration || 500;
    this.enableLineSearch = false;

    AnimatedContour.call(this, div);
    div.select('#linesearchcheck').on('change', () => {
        this.enableLineSearch = document.getElementById('linesearchcheck').checked;
        this.initialize(this.initial);
    });
}

GradientContour.prototype = Object.create(AnimatedContour.prototype);

GradientContour.prototype.drawControls = function () {
    this.learnRate = Slider(
        this.div.select('#learningrate'),
        [0.0001, 1],
        // TODO: why can't I just go 'this.setStepSize' here instead?
        // feel like I fundamentally am missing something with JS
        (x) => this.setStepSize(x),
        {
            format: (d) => d.toString(),
            initial: this.stepSize,
            scale: d3.scaleLog(),
            ticks: 4,
        },
    );
};

GradientContour.prototype.setStepSize = function (x) {
    this.stepSize = x;
    this.initialize(this.initial);
    this.div.select('#learningratevalue').text(` = ${x.toFixed(4)}`);
};

GradientContour.prototype.calculateStates = function (initial) {
    this.stateIndex = 0;
    this.states = [];
    const f = (x, fxprime) => {
        this.current.fprime(x, fxprime);
        return this.current.f(x);
    };

    const params = {
        history: this.states,
        maxIterations: 5000,
        learnRate: this.stepSize,
    };

    if (this.enableLineSearch) {
        fmin.gradientDescentLineSearch(f, initial, params);
    } else {
        fmin.gradientDescent(f, initial, params);
    }
};

GradientContour.prototype.initialize = function (initial) {
    this.stop();
    this.initial = initial.slice();
    this.calculateStates(initial);

    const svg = this.plot.svg;
    const xScale = this.plot.xScale;
    const yScale = this.plot.yScale;
    svg.selectAll('.current').data([]).exit().remove();
    const group = svg.selectAll('.current').data([this.states[0]]).enter().append('g').attr('class', 'current');

    group.append('g').attr('class', 'under');

    group.append('g').attr('class', 'gradient');

    group
        .append('circle')
        .attr('class', 'ball')
        .style('fill', 'red')
        .style('fill-opacity', 0.9)
        .attr('filter', 'url(#dropshadow)')
        .attr('r', 5)
        .attr('cx', (d) => xScale(d.x[0]))
        .attr('cy', (d) => yScale(d.x[1]));

    this.increment(this.cycle, this.duration);
};

GradientContour.prototype.displayState = function () {
    const state = this.states[this.stateIndex];
    const group = this.plot.svg
        .selectAll('.current')
        .data([state])
        .transition()
        .duration(this.stateIndex ? this.duration : 0);

    group
        .select('.ball')
        .attr('cx', (d) => this.plot.xScale(d.x[0]))
        .attr('cy', (d) => this.plot.yScale(d.x[1]));

    if (this.stateIndex) {
        const d = this.states[this.stateIndex - 1];

        if (this.enableLineSearch) {
            this.learnRate.move(d.learnRate, this.duration);
            this.div.select('#learningratevalue').text(` = ${d.learnRate.toFixed(4)}`);
        }

        const line = this.plot.svg
            .selectAll('.current .gradient')
            .append('line')
            .attr('stroke-opacity', 0.9)
            .attr('stroke', 'red')
            .attr('stroke-width', 3)
            .attr('x1', this.plot.xScale(d.x[0]))
            .attr('y1', this.plot.yScale(d.x[1]))
            .attr('x2', this.plot.xScale(d.x[0]))
            .attr('y2', this.plot.yScale(d.x[1]));

        line.transition()
            .duration(this.duration)
            .attr('x2', this.plot.xScale(state.x[0]))
            .attr('y2', this.plot.yScale(state.x[1]));
    } else {
        this.plot.svg.selectAll('.current line').data([]).exit().remove();
    }
};
