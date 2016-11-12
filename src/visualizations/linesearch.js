import {GradientContour} from "./gradientDescent";
import {flower} from "./functions";

export function LineSearchContour(div) {
    GradientContour.call(this, div, true);
    this.duration = 1000;
    this.colour = d3.schemeCategory10[1];
    this.current = flower;
}
LineSearchContour.prototype = Object.create(GradientContour.prototype);

LineSearchContour.prototype.calculateStates = function(initial) {
    this.stateIndex = 0;
    this.states = [];
    var f = (x, fxprime) => { this.current.fprime(x, fxprime); return this.current.f(x); };
    fmin.gradientDescentLineSearch(f, initial, {"history": this.states, 'maxIterations' : 5000});
};

LineSearchContour.prototype.displayState = function(){
    if (this.stateIndex) {
        var d = this.states[this.stateIndex-1];
        var g = this.plot.svg.select(".current .under")
            .append("g");

        g.selectAll("circle")
            .data(d.functionCalls)
            .enter()
            .append("circle")
            .attr("stroke-opacity", 0.8)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill-opacity", 0)
            .attr("cx", p => this.plot.xScale(p[0]))
            .attr("cy", p => this.plot.yScale(p[1]))
            .attr("r", 3);
    } else {
        this.plot.svg.selectAll(".current .under g").data([]).exit().remove();
    }
    GradientContour.prototype.displayState.call(this);
};
