import {Slider} from "./slider";
import {AnimatedContour} from "./animatedContour";
import {himmelblau} from "./functions";

export function NelderMeadContour(div) {
    AnimatedContour.call(this, div);
    this.colour = d3.schemeCategory10[0];
    this.current = himmelblau;
    this.duration = 500;
    this.params = {'chi' : 2, 'psi' : -0.5, 'sigma' : 0.5, 'rho' : 1};

    var obj = this, params = this.params;
    $(window).load( function() {
        obj.redraw();
        obj.initialize([1.5, -1.5]);
        Slider(div.select("#expansion"), [1, 5],
                function(x) {
                    params.chi = x;
                    obj.initialize(obj.initial);
                    div.select("#expansionvalue").text(" = " + x.toFixed(1) + "x");

                },
                {'format': function(d) { return d.toFixed(1) + "x"; }, 'initial' : 2.0});

        Slider(div.select("#contraction"), [0.2, 1],
                function(x) {
                    params.sigma = x;
                    params.psi = -1 * x;
                    obj.initialize(obj.initial);
                    div.select("#contractionvalue").text(" = " + x.toFixed(2) + "x");
                },
                {'format': function(d) { return (d).toFixed(1) + "x"; },
                 'initial': 0.5});
    });
}
NelderMeadContour.prototype = Object.create(AnimatedContour.prototype);

NelderMeadContour.prototype.initialize = function(initial) {
    this.initial = initial.slice();
    var states = this.states = [];
    this.stateIndex = 0;
    function pushState(x) {
        var state=  [];
        for (var i =0; i < x.length; ++i) {
            state.push({'x': x[i][0], 'y' : x[i][1], 'id' : x[i].id });
        }
        state.sort(function(a,b) { return a.id - b.id; });

        // todo: have nelder mead store this in history, format like others
        state.fx = x[0].fx;
        states.push(state);
    }
    this.params.callback = pushState;
    fmin.nelderMead(this.current.f, initial, this.params);

    var lines = this.plot.svg.selectAll(".simplex_line").data(this.states[0]);
    lines.enter()
        .append("line")
        .attr("class", "simplex_line")
        .attr("stroke-opacity", 0.7)
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    var circles = this.plot.svg.selectAll("circle").data(this.states[0]);

    circles.enter()
           .append("circle")
           .style("fill", "red")
           .style("fill-opacity", 0.9)
           .attr("r", 5)
           .attr("cx", d => this.plot.xScale(d.x))
           .attr("cy", d => this.plot.yScale(d.y))
           .attr("filter", "url(#dropshadow)");
    this.increment(this.cycle, this.duration);
};

NelderMeadContour.prototype.displayState = function() {
    var duration = duration || this.duration;
    var state = this.states[this.stateIndex];

    var lines = this.plot.svg.selectAll(".simplex_line")
       .data(state)
       .transition()
       .duration(this.stateIndex ? duration :0)
       .attr("x1", d => this.plot.xScale(d.x))
       .attr("y1", d => this.plot.yScale(d.y))
       .attr("x2", (d, i) => this.plot.xScale(state[i ? i - 1 : 2].x))
       .attr("y2", (d, i) => this.plot.yScale(state[i ? i - 1 : 2].y));

    var circles = this.plot.svg.selectAll("circle")
        .data(state)
        .transition()
        .duration(this.stateIndex ? duration :0)
        .attr("cx", d => this.plot.xScale(d.x))
        .attr("cy", d => this.plot.yScale(d.y));
};

//var simplex_contour = new NelderMeadContour(d3.select("#simplex"));

