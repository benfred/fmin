import {Slider} from "./slider";
import {AnimatedContour} from "./animatedContour";

export function GradientContour(div, noslider) {
    AnimatedContour.call(this, div);
    this.colour = d3.schemeCategory10[1];
    this.stepSize = 0.05;
    this.duration = 100;

    var obj = this;
    $(window).on("load", function() {
        obj.redraw();
        obj.initialize([-1, -1]);
        if (!noslider) {
            obj.learnRate = Slider(div.select("#learningrate"), [0.0001, 1],
                    function(x) {
                        obj.stepSize = x;
                        obj.initialize(obj.initial);
                        div.select("#learningratevalue").text(" = " + x.toFixed(4));
                    },
                    {'format': function(d) { return d.toString(); },
                      'initial': 0.05,
                      'scale': d3.scaleLog(),
                      'ticks' : 3});
        }
    });
}
GradientContour.prototype = Object.create(AnimatedContour.prototype);

GradientContour.prototype.calculateStates = function(initial) {
    this.stateIndex = 0;
    this.states = [];
    var f = (x, fxprime) => { this.current.fprime(x, fxprime); return this.current.f(x); };
    fmin.gradientDescent(f, initial, {"history": this.states, 'maxIterations' : 5000, 'learnRate' : this.stepSize});
};

GradientContour.prototype.initialize = function(initial) {
    this.initial = initial.slice();
    this.calculateStates(initial);

    var svg = this.plot.svg, xScale = this.plot.xScale, yScale = this.plot.yScale;
    svg.selectAll(".current").data([]).exit().remove();
    var group = svg.selectAll(".current").data([this.states[0]])
        .enter()
        .append("g")
        .attr("class", "current");

    group.append("g")
        .attr("class", "gradient");

    group.append("circle")
           .style("fill", "red")
           .style("fill-opacity", 0.9)
           .attr("filter", "url(#dropshadow)")
           .attr("r", 5)
           .attr("cx", function(d) { return xScale(d.x[0]); })
           .attr("cy", function(d) { return yScale(d.x[1]); });

    this.cycle += 1;
    this.increment(this.cycle, this.duration);
};

GradientContour.prototype.displayState = function(){
    var state = this.states[this.stateIndex];
    var group = this.plot.svg.selectAll(".current")
                    .data([state])
        .transition()
        .duration(this.stateIndex ? this.duration :0);

    group.select("circle")
       .attr("cx", d => this.plot.xScale(d.x[0]))
       .attr("cy", d => this.plot.yScale(d.x[1]));

    if (this.stateIndex) {
        var d = this.states[this.stateIndex-1];
        var line = this.plot.svg.selectAll(".current .gradient").append("line")
            .attr("stroke-opacity", 0.9)
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("x1", this.plot.xScale(d.x[0]))
            .attr("y1", this.plot.yScale(d.x[1]))
            .attr("x2", this.plot.xScale(d.x[0]))
            .attr("y2", this.plot.yScale(d.x[1]));

        line.transition().duration(this.duration)
           .attr("x2", this.plot.xScale(state.x[0]))
           .attr("y2", this.plot.yScale(state.x[1]));
    } else {
        this.plot.svg.selectAll(".current line").data([]).exit().remove();
    }
};
