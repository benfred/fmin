var tape = require("tape"),
    fmin = require("../");

var SMALL = 1e-5;

function nearlyEqual(test, left, right, tolerance, message) {
    message = message || "nearlyEqual";
    tolerance = tolerance || SMALL;
    test.ok(Math.abs(left - right) < tolerance,
            message + ": " + left + " ~== " + right);
}

function lessThan(test, left, right, message) {
    message = message || "lessThan";
    test.ok(left < right, message + ": " + left + " < " + right);
}

var optimizers = [fmin.nelderMead,
                  fmin.gradientDescent,
                  fmin.gradientDescentLineSearch,
                  fmin.conjugateGradient];

    optimizerNames = ["Nelder Mead",
                      "Gradient Descent",
                      "Gradient Descent w/ Line Search",
                      "Conjugate Gradient"];

tape("himmelblau", function(test) {
    // due to a bug, this used to not converge to the minimum
    var x = 4.9515014216303825, y = 0.07301421370357275;

    var params = {'learnRate' : 0.1};

    function himmelblau(X, fxprime) {
        fxprime = fxprime || [0, 0];
        var x = X[0], y = X[1];
        fxprime[0] = 2 * (x + 2 *y  - 7) + 4 * (2 * x + y - 5);
        fxprime[1] = 4 * (x + 2 * y - 7) + 2 * (2 * x + y - 5);
        return Math.pow(x + 2 * y - 7, 2) + Math.pow(2 * x + y - 5, 2);
    }

    for (var i = 0; i < optimizers.length; ++i) {
        var solution = optimizers[i](himmelblau, [x, y], params);
        nearlyEqual(test, solution.fx, 0, SMALL, "himmelblau:" + optimizerNames[i]);
    }

    test.end();
});

tape("banana", function(test) {
    var x = 1.6084564160555601, y = -1.5980748860165477;

    function banana(X, fxprime) {
        fxprime = fxprime || [0, 0];
        var x = X[0], y = X[1];
        fxprime[0] = 400 * x * x * x - 400 * y * x + 2 * x - 2;
        fxprime[1] = 200 * y - 200 * x * x;
        return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x);
    }

    var params = {'learnRate' : 0.0003, 'maxIterations' : 50000};
    for (var i = 0; i < optimizers.length; ++i) {
        var solution = optimizers[i](banana, [x, y], params);
        nearlyEqual(test, solution.fx, 0, 1e-3, "banana:" + optimizerNames[i]);
    }
    test.end();
});

tape("quadratic1D", function(test) {
    var loss = function(x, xprime) {
        xprime = xprime || [0, 0];
        xprime[0] = 2 * (x[0] - 10);
        return (x[0] - 10) * (x[0] - 10);

    };

    var params = {'learnRate' : 0.5};

    for (var i = 0; i < optimizers.length; ++i) {
        var solution = optimizers[i](loss, [0], params);
        nearlyEqual(test, solution.fx, 0, SMALL, "quadratic_1d:" + optimizerNames[i]);
    }

    test.end();
});

tape("nelderMead", function(test) {
    function loss(X) {
        var x = X[0], y = X[1];
        return Math.sin(y) * x  + Math.sin(x) * y  +  x * x +  y *y;
    }

    var solution = fmin.nelderMead(loss, [-3.5, 3.5]);
    nearlyEqual(test, solution.fx, 0, SMALL, "nelderMead");
    test.end();
});

tape("conjugateGradientSolve", function(test) {
    // matyas function
    var A = [[0.52, -0.48],
             [-0.48, 0.52]],
        b = [0, 0],
        initial = [-9.08, -7.83];
    var x = fmin.conjugateGradientSolve(A, b, initial);
    nearlyEqual(test, x[0], 0, SMALL, 'matyas.x');
    nearlyEqual(test, x[1], 0, SMALL, 'matyas.y');

    // booth's function
    var history = [];
    A = [[10, 8],
         [8, 10]];
    b = [34, 38];
    x = fmin.conjugateGradientSolve(A, b, initial, history);
    nearlyEqual(test, x[0], 1, SMALL, 'booth.x');
    nearlyEqual(test, x[1], 3, SMALL, 'booth.y');
    console.log(history);
    test.end();
});
