import {dot, norm2, scale, weightedSum, gemv} from "./blas1";
import {wolfeLineSearch} from "./linesearch";

export function conjugateGradient(f, initial, params) {
    // allocate all memory up front here, keep out of the loop for perfomance
    // reasons
    var current = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
        next = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
        yk = initial.slice(),
        pk, temp,
        a = 1,
        maxIterations;

    params = params || {};
    maxIterations = params.maxIterations || initial.length * 20;

    current.fx = f(current.x, current.fxprime);
    pk = current.fxprime.slice();
    scale(pk, current.fxprime,-1);

    for (var i = 0; i < maxIterations; ++i) {
        a = wolfeLineSearch(f, pk, current, next, a);

        // todo: history in wrong spot?
        if (params.history) {
            params.history.push({x: current.x.slice(),
                                 fx: current.fx,
                                 fxprime: current.fxprime.slice(),
                                 alpha: a});
        }

        if (!a) {
            // faiiled to find point that satifies wolfe conditions.
            // reset direction for next iteration
            scale(pk, current.fxprime, -1);

        } else {
            // update direction using Polak–Ribiere CG method
            weightedSum(yk, 1, next.fxprime, -1, current.fxprime);

            var delta_k = dot(current.fxprime, current.fxprime),
                beta_k = Math.max(0, dot(yk, next.fxprime) / delta_k);

            weightedSum(pk, beta_k, pk, -1, next.fxprime);

            temp = current;
            current = next;
            next = temp;
        }

        if (norm2(current.fxprime) <= 1e-5) {
            break;
        }
    }

    if (params.history) {
        params.history.push({x: current.x.slice(),
                             fx: current.fx,
                             fxprime: current.fxprime.slice(),
                             alpha: a});
    }

    return current;
}

/// Solves a system of lienar equations Ax =b for x
/// using the conjugate gradient method.
export function conjugateGradientSolve(A, b, x, history) {
    var r = x.slice(),
        Ap = x.slice(), p, rsold, rsnew, alpha;

    // r = b - A*x
    gemv(Ap, A, x);
    weightedSum(r, 1, b, -1, Ap);
    p = r.slice();
    rsold = dot(r, r);

    for (var i = 0; i < b.length; ++i) {
        gemv(Ap, A, p);
        alpha = rsold / dot(p, Ap);
        if (history) {
            history.push({x: x.slice(),
                         p: p.slice(),
                         alpha: alpha});
        }

        //x=x+alpha*p;
        weightedSum(x, 1, x, alpha, p);

        // r=r-alpha*Ap;
        weightedSum(r, 1, r, -alpha, Ap);
        rsnew = dot(r, r);
        if (Math.sqrt(rsnew) <= 1e-10) break;

        // p=r+(rsnew/rsold)*p;
        weightedSum(p, 1, r, rsnew/rsold, p);
        rsold=rsnew;
    }
    if (history) {
        history.push({x: x.slice(),
                     p: p.slice(),
                     alpha: alpha});
    }
    return x;
}
