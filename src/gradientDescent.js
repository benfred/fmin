import {dot, norm2, scale, zeros, weightedSum} from "./blas1";
import {wolfeLineSearch} from "./linesearch";

export function RMSProp(f, initial, params) {
    params = params || {};
    var current = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
        maxIterations =  params.maxIterations || initial.length * 100,
        learnRate = params.learnRate || 0.001,
        p = 0.999, epsilon = 1e-4;

    var sumFxprime2 = zeros(current.fxprime.length);

    for (var i = 0; i < maxIterations; ++i) {
        current.fx = f(current.x, current.fxprime);

        if (params.history) {
            params.history.push({x: current.x.slice(),
                                 fx: current.fx,
                                 fxprime: current.fxprime.slice()});
        }

        if (norm2(current.fxprime) < 1e-5) break;

        for (var j = 0; j < current.fxprime.length; j++) {
            // maintain a decaying sum of previous squared gradient
            sumFxprime2[j] = p * sumFxprime2[j] + (1 - p) * current.fxprime[j] * current.fxprime[j];

            // modify the learning rate in this dimension by the RMS
            current.x[j] -= learnRate *  current.fxprime[j] / Math.sqrt(sumFxprime2[j] + epsilon);
        }
    }
    return current;
}

export function gradientDescentLineSearch(f, initial, params) {
    params = params || {};
    var current = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
        next = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
        maxIterations = params.maxIterations || initial.length * 100,
        learnRate = params.learnRate || 0.001,
        pk = initial.slice(),
        temp;

    current.fx = f(current.x, current.fxprime);
    for (var i = 0; i < maxIterations; ++i) {
        if (params.history) {
            params.history.push({x: current.x.slice(),
                                 fx: current.fx,
                                 fxprime: current.fxprime.slice()});
        }
        if ((learnRate === 0) || (norm2(current.fxprime) < 1e-5)) break;

        scale(pk, current.fxprime, -1);
        learnRate = wolfeLineSearch(f, pk, current, next, learnRate);

        temp = current;
        current = next;
        next = temp;
    }

    return current;
}

export function gradientDescent(f, initial, params) {
    params = params || {};
    var maxIterations = params.maxIterations || initial.length * 100,
        learnRate = params.learnRate || 0.001,
        current = {x: initial.slice(), fx: 0, fxprime: initial.slice()};

    for (var i = 0; i < maxIterations; ++i) {
        current.fx = f(current.x, current.fxprime);
        if (params.history) {
            params.history.push({x: current.x.slice(),
                                 fx: current.fx,
                                 fxprime: current.fxprime.slice()});
        }

        weightedSum(current.x, 1, current.x, -learnRate, current.fxprime);
        if (norm2(current.fxprime) <= 1e-5) {
            break;
        }
    }

    return current;
}
