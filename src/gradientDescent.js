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
    // TODO: figure out proper wolf line search integration here
    params = params || {};
    var current = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
        maxIterations =  params.maxIterations || initial.length * 100,
        learnRate = params.learnRate || 0.001,
        progress = 0;


    current.fx = f(current.x, current.fxprime);


    for (var i = 0; i < maxIterations; ++i) {
    /*
        learnRate = wolfeLineSearch(f, pk, current, next, learnRate);
        if (learnRate === 0) {
            learnRate = params.learnRate || 0.0001;
            // todo: is this right?
//            return current;
        }
        */
        var previous = current.fx;
        current.fx = f(current.x, current.fxprime);

        if (params.history) {
            params.history.push({x: current.x.slice(),
                                 fx: current.fx,
                                 fxprime: current.fxprime.slice()});
        }

        if (norm2(current.fxprime) < 1e-5) break;

        weightedSum(current.x, 1, current.x, -learnRate, current.fxprime);


        if (current.fx >= previous) {
            learnRate *= 0.5;
            progress = 0;
        } else {
            progress += 1;
            if (progress > 5) {
                learnRate *= 1.1;
                progress = 0;
            }
        }
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
