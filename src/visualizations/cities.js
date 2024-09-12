import { createDropShadowFilter } from './dropshadow';
import { Slider } from './slider';

function mdsGradient(x, distances, fxprime) {
    let loss = 0;
    let i;
    fxprime = fxprime || fmin.zeros(x.length);
    for (let i = 0; i < fxprime.length; ++i) {
        fxprime[i] = 0;
    }

    for (let i = 0; i < distances.length; ++i) {
        const xi = x[2 * i];
        const yi = x[2 * i + 1];
        for (let j = i + 1; j < distances.length; ++j) {
            const xj = x[2 * j];
            const yj = x[2 * j + 1];
            const dij = distances[i][j];

            const squaredDistance = (xj - xi) * (xj - xi) + (yj - yi) * (yj - yi);
            const distance = Math.sqrt(squaredDistance);
            const delta = squaredDistance - dij * dij;

            loss += 2 * delta * delta;

            fxprime[2 * i] += 4 * delta * (xi - xj);
            fxprime[2 * i + 1] += 4 * delta * (yi - yj);

            fxprime[2 * j] += 4 * delta * (xj - xi);
            fxprime[2 * j + 1] += 4 * delta * (yj - yi);
        }
    }
    return loss;
}

function mds(distances, params) {
    // fully normalize solution (so that initial guess is somewhat reasonable looking
    const norm = fmin.norm2(distances.map(fmin.norm2)) / distances.length;

    // TODO: why is this needed for CG? norm = 1; understaqnd for GD
    distances = distances.map((row) => row.map((value) => value / norm));

    params = params || {};
    params.history = [];

    // minimize maintaining history (so we can animate the solution)
    const solver = params.solver || fmin.conjugateGradient;
    const solution = solver(
        (x, fxprime) => mdsGradient(x, distances, fxprime),
        params.initial || fmin.zeros(distances.length * 2).map(Math.random),
        params,
    );

    // convert the history back to a matrix of unnormalized (x,y) points
    return params.history.map((state) => {
        const ret = fmin.zerosM(distances.length, 2);
        for (let i = 0; i < distances.length; ++i) {
            ret[i][0] = norm * state.x[2 * i];
            ret[i][1] = norm * state.x[2 * i + 1];
        }
        return ret;
    });
}

function normalizeSolution(solution) {
    const finalPositions = solution[solution.length - 1];
    // rotate everything in place such that city 0 (vancouver) is
    // directly north of city 1 (Portland)
    const rotation = Math.atan2(
        finalPositions[0][0] - finalPositions[1][0],
        finalPositions[0][1] - finalPositions[1][1],
    );

    solution.map((positions) => {
        const c = Math.cos(rotation);
        const s = Math.sin(rotation);
        let x;
        let y;
        for (let i = 0; i < positions.length; ++i) {
            x = positions[i][0];
            y = positions[i][1];
            positions[i][0] = c * x - s * y;
            positions[i][1] = s * x + c * y;
        }
        return positions;
    });

    // mirror solution around X if vancouver isn't east of city 2
    if (finalPositions[0][0] > finalPositions[2][0]) {
        solution.map((positions) => {
            for (let i = 0; i < positions.length; ++i) {
                positions[i][0] *= -1;
            }
        });
    }
}

function getDomain(positions, index) {
    const values = positions.map((pos) => pos[index]);
    return [Math.min.apply(null, values), Math.max.apply(null, values)];
}

function animatedScatterPlot(element, history, labels, duration) {
    // global setup
    const w = element.nodes()[0].offsetWidth;
    const h = w * 0.7;
    const padding = 20 + w / 20;
    const pointRadius = w > 400 ? 5 : 3;
    let stopped = false;

    // create the svg element if it doesn't already exist
    element.selectAll('svg').data([0]).enter().append('svg');
    const svg = element.selectAll('svg').data([0]).attr('width', w).attr('height', h);

    createDropShadowFilter(svg);

    const under = svg.append('g');
    const over = svg.append('g');

    const colours = d3.schemeCategory20;

    // setup per trial
    const positions = history[history.length - 1];
    const xDomain = getDomain(positions, 0);
    const yDomain = getDomain(positions, 1).reverse();

    const xScale = d3
        .scaleLinear()
        .domain(xDomain)
        .range([padding, w - padding]);
    const yScale = d3
        .scaleLinear()
        .domain(yDomain)
        .range([padding, h - padding]);

    function updateState(state) {
        if (stopped) {
            return;
        }
        element.select('.iterations').text(`Iteration ${state + 1}/${history.length}`);
        const positions = history[state];

        const nodes = over.selectAll('g').data(positions);

        const enter = nodes.enter().append('g');

        enter
            .append('circle')
            .attr('filter', 'url(#dropshadow)')
            .attr('r', pointRadius)
            .attr('fill', (d, i) => colours[i % colours.length])
            .attr('cx', (d) => xScale(d[0]))
            .attr('cy', (d) => yScale(d[1]));

        enter
            .append('text')
            .style('text-anchor', 'middle')
            .style('font-size', w < 400 ? '10px' : '12px')
            .attr('x', (d, i) => xScale(d[0]))
            .attr('y', (d, i) => yScale(d[1]) - 2 - pointRadius)
            .text((d, i) => labels[i]);

        const update = nodes.transition().duration(duration).ease(d3.easeLinear);

        if (state) {
            const previous = history[state - 1];
            under
                .selectAll(`.line${state}`)
                .data(positions)
                .enter()
                .append('line')
                .attr('stroke', (d, i) => colours[i % colours.length])
                .attr('stroke-width', w > 400 ? 5 : 1)
                .attr('stroke-opacity', '.25')
                .attr('x1', (d, i) => xScale(previous[i][0]))
                .attr('y1', (d, i) => yScale(previous[i][1]))
                .attr('x2', (d, i) => xScale(previous[i][0]))
                .attr('y2', (d, i) => yScale(previous[i][1]))
                .transition()
                .duration(duration)
                .ease(d3.easeLinear)
                .attr('x2', (d) => xScale(d[0]))
                .attr('y2', (d) => yScale(d[1]));
        }

        update
            .select('circle')
            .attr('cx', (d) => xScale(d[0]))
            .attr('cy', (d) => yScale(d[1]));

        update
            .select('text')
            .attr('x', (d, i) => xScale(d[0]))
            .attr('y', (d, i) => yScale(d[1]) - 2 - pointRadius);

        if (state < history.length - 1) {
            svg.transition()
                .duration(duration)
                .on('end', () => {
                    updateState(state + 1);
                });
        }
    }
    updateState(0);

    return {
        setDuration: (d) => {
            duration = d;
        },
        stop: () => {
            stopped = true;
        },
    };
}

export function createCitiesAnimation(div) {
    const params = {};
    const distances = can_us.distances;
    const labels = can_us.labels;
    let duration = 500;
    let count = 20;
    let previous = null;

    params.learnRate = 0.002;
    params.maxIterations = 12000;

    function recalculateSolution() {
        if (previous) {
            previous.stop();
        }

        const truncated = distances.slice(0, count).map((x) => x.slice(0, count));

        const solution = mds(truncated, params);
        normalizeSolution(solution);
        div.select('svg').selectAll('g').data([]).exit().remove();
        previous = animatedScatterPlot(div, solution, labels.slice(0, count), duration);
    }

    function setAlgorithm(name, solver, showSlider) {
        div.select('.learningrateslider').style('display', showSlider ? 'block' : 'none');
        params.solver = solver;
        div.select('.algorithm_label').text(name);
        recalculateSolution();

        return true;
    }

    function setSpeed(speed) {
        duration = speed;
        previous.setDuration(duration);
        div.select('.speed_label').text(`${speed}ms / Iteration`);
    }

    function setCount(c) {
        count = c;
        div.select('.count_label').text(`${c} Cities`);
        recalculateSolution();
    }

    function setLearnRate(c) {
        params.learnRate = c;
        div.select('#learningratevalue').text(c.toFixed(5));
        recalculateSolution();
    }

    div.select('.randomize').on('click', recalculateSolution);
    div.select('.algo_cg').on('click', () => {
        setAlgorithm('Conjugate Gradient', fmin.conjugateGradient);
    });
    div.select('.algo_gd').on('click', () => {
        setAlgorithm('Gradient Descent', fmin.gradientDescent, true);
    });
    div.select('.algo_gdls').on('click', () => {
        setAlgorithm('Gradient Descent w/ Linesearch', fmin.gradientDescentLineSearch);
    });
    div.select('.algo_neldermead').on('click', () => {
        setSpeed(25);
        if (count > 15) {
            setCount(15);
        }

        setAlgorithm('Nelder Mead', fmin.nelderMead);
    });

    div.select('.speed_500').on('click', () => {
        setSpeed(500);
    });
    div.select('.speed_100').on('click', () => {
        setSpeed(100);
    });
    div.select('.speed_50').on('click', () => {
        setSpeed(50);
    });
    div.select('.speed_25').on('click', () => {
        setSpeed(25);
    });

    div.select('.count5').on('click', () => {
        setCount(5);
    });
    div.select('.count10').on('click', () => {
        setCount(10);
    });
    div.select('.count15').on('click', () => {
        setCount(15);
    });
    div.select('.count20').on('click', () => {
        setCount(20);
    });
    div.select('.count25').on('click', () => {
        setCount(25);
    });

    Slider(div.select('#learningrate'), [0.00001, 0.01], (x) => setLearnRate(x), {
        format: (d) => d.toString(),
        initial: params.learnRate,
        scale: d3.scaleLog(),
        ticks: 3,
    });

    setAlgorithm('Conjugate Gradient', fmin.conjugateGradient);
}
