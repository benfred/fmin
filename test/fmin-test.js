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

// TODO: run all optimizers on all functions
tape("fmin_himmelblau", function(test) {
    // due to a bug, this used to not converge to the minimum
    var x = 4.9515014216303825, y = 0.07301421370357275;
    function himmelblau(x, y) {
        return (x * x + y - 11) * ( x * x + y - 11) + (x + y * y - 7) * (x + y * y - 7);
    }
    var solution = fmin.nelderMead(function (x) { return himmelblau(x[0], x[1]);}, [x, y]);
    nearlyEqual(test, solution.f, 0);
    test.end();
});

tape("fmin_banana", function(test) {
    var x = 1.6084564160555601, y = -1.5980748860165477;

    function banana(x, y) {
        return (1 - x) * (1 - x) + 100 * (y - x * x) * ( y - x * x)
    }

    var solution = fmin.nelderMead(function (x) { return banana(x[0], x[1]);}, [x, y]);
    nearlyEqual(test, solution.f, 0);
    test.end();
});

tape("fmin", function(test) {
    var iterations =0;
    // minimize simple 1 diminesial quadratic
    var loss = function(values) { return (values[0] - 10) * (values[0] - 10); }
    var solution = fmin.nelderMead(loss, [0], {minErrorDelta:1e-10}).solution;

    nearlyEqual(test, solution[0], 10, 1e-10);
    test.end();
});

tape("minimizeGD", function(test) {
    // minimize simple 1 diminesial quadratic
    var loss = function(x, xprime) {
        xprime[0] = 2 * (x[0] - 10);
        return (x[0] - 10) * (x[0] - 10);
    }
    var solution = fmin.gradientDescentLineSearch(loss, [0], {'learnRate' : 0.5}).x;
    nearlyEqual(test, solution[0], 10, 1e-10);
    test.end();
});

tape("conjugateGradient", function(test) {
    // minimize simple 1 diminesial quadratic
    var loss = function(x, xprime) {
        xprime[0] = 2 * (x[0] - 10);
        return (x[0] - 10) * (x[0] - 10);
    }
    var solution = fmin.conjugateGradient(loss, [0]).x;
    nearlyEqual(test, solution[0], 10, 1e-10);
    test.end();
});
