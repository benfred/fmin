import { banana, matyas } from './functions';
import { GradientContour } from './gradientDescent';

export function ConjugateGradientContour(div) {
    this.colour = d3.schemeCategory10[2];
    this.current = this.current || banana;
    this.duration = 1000;
    GradientContour.call(this, div);
}

ConjugateGradientContour.prototype = Object.create(GradientContour.prototype);

ConjugateGradientContour.prototype.drawControls = () => {
    // TODO
};

ConjugateGradientContour.prototype.redraw = function () {
    // add an arrow marker for the gradients
    GradientContour.prototype.redraw.call(this);
    this.plot.svg
        .append('marker')
        .attr('id', 'arrow')
        .attr('fill', 'yellow')
        .attr('fill-opacity', '1')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 0)
        .attr('refY', 5)
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z');
};

ConjugateGradientContour.prototype.calculateStates = function (initial) {
    this.stateIndex = 0;
    this.states = [];
    const f = (x, fxprime) => {
        this.current.fprime(x, fxprime);
        return this.current.f(x);
    };
    fmin.conjugateGradient(f, initial, { history: this.states });
};

ConjugateGradientContour.prototype.displayState = function () {
    GradientContour.prototype.displayState.call(this);
    if (this.stateIndex) {
        const d = this.states[this.stateIndex - 1];
        this.plot.svg
            .selectAll('.current .gradient')
            .append('line')
            .attr('stroke-opacity', 0.9)
            .attr('stroke', 'yellow')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow)')
            .attr('x1', this.plot.xScale(d.x[0]))
            .attr('y1', this.plot.yScale(d.x[1]))
            .attr('x2', this.plot.xScale(d.x[0] - d.alpha * d.fxprime[0]))
            .attr('y2', this.plot.yScale(d.x[1] - d.alpha * d.fxprime[1]));
    }
};

export function ConjugateGradientSolverContour(div) {
    this.current = matyas;
    ConjugateGradientContour.call(this, div);
}

ConjugateGradientSolverContour.prototype = Object.create(ConjugateGradientContour.prototype);

ConjugateGradientSolverContour.prototype.calculateStates = function (initial) {
    this.stateIndex = 0;
    this.states = [];
    fmin.conjugateGradientSolve(this.current.A, this.current.b, initial, this.states);

    for (let i = 0; i < this.states.length; ++i) {
        const state = this.states[i];
        state.fx = this.current.f(state.x);
        state.fxprime = this.current.fprime(state.x);
    }
};
