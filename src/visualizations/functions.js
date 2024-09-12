export const trid = {
    f: (X) => {
        const x = X[0];
        const y = X[1];
        return (x - 1) * (x - 1) + (y - 1) * (y - 1) - x * y;
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = 2 * (x - 1) - y;
        fxprime[1] = 2 * (y - 1) - x;
        return fxprime;
    },

    xDomain: [-4, 4],
    yDomain: [4, -4],
};

export const dixonPrice = {
    f: (X) => {
        const x = X[0];
        const y = X[1];

        return (x - 1) * (x - 1) + 2 * (2 * y - x) * (2 * y - x);
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = 2 * (x - 1) - 2 * (2 * y - x);
        fxprime[1] = 4 * (2 * y - x);
        return fxprime;
    },

    xDomain: [-10, 10],
    yDomain: [10, -10],
};

export const banana = {
    initial: [-1, -1],
    f: (X) => {
        const x = X[0];
        const y = X[1];
        return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x);
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = 400 * x * x * x - 400 * y * x + 2 * x - 2;
        fxprime[1] = 200 * y - 200 * x * x;
        return fxprime;
    },

    xDomain: [-2, 2],
    yDomain: [2, -2],
};

export const matyas = {
    initial: [-9.08, -7.83],

    f: (X) => {
        const x = X[0];
        const y = X[1];
        return 0.26 * (x * x + y * y) - 0.48 * x * y;
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = 0.52 * x - 0.48 * y;
        fxprime[1] = 0.52 * y - 0.48 * x;
        return fxprime;
    },

    // directly from fprime
    A: [
        [0.52, -0.48],
        [-0.48, 0.52],
    ],
    b: [0, 0],

    xDomain: [-10, 10],
    yDomain: [10, -10],
};

export const booth = {
    f: (X) => {
        const x = X[0];
        const y = X[1];
        return (x + 2 * y - 7) ** 2 + (2 * x + y - 5) ** 2;
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = 2 * (x + 2 * y - 7) + 4 * (2 * x + y - 5);
        fxprime[1] = 4 * (x + 2 * y - 7) + 2 * (2 * x + y - 5);
        return fxprime;
    },

    initial: [-8, 7],
    A: [
        [10, 8],
        [8, 10],
    ],
    b: [34, 38],

    xDomain: [-10, 10],
    yDomain: [10, -10],
};

export const himmelblau = {
    initial: [-0.15, 0.67],
    f: (X) => {
        const x = X[0];
        const y = X[1];
        return (x * x + y - 11) * (x * x + y - 11) + (x + y * y - 7) * (x + y * y - 7);
    },
    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = 4 * (x * x + y - 11) * x + 2 * (x + y * y - 7);
        fxprime[1] = 2 * (x * x + y - 11) + 4 * (x + y * y - 7) * y;
        return fxprime;
    },
    xDomain: [-6.1, 6],
    yDomain: [6, -6],
    minima: [
        { x: 3.584428, y: -1.848126 },
        { x: -2.805118, y: 3.131312 },
        { x: -3.77931, y: -3.283186 },
        { x: 3, y: 2 },
    ],
    colourDomain: [2, 13],
};

export const flower = {
    initial: [-3.5, 2.75],

    f: (X) => {
        const x = X[0];
        const y = X[1];
        return Math.sin(y) * x + Math.sin(x) * y + x * x + y * y;
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = Math.sin(y) + Math.cos(x) * y + 2 * x;
        fxprime[1] = Math.sin(x) + Math.cos(y) * x + 2 * y;
        return fxprime;
    },

    xDomain: [-6, 6],
    yDomain: [6, -6],
};

export const mccormick = {
    f: (X) => {
        const x = X[0];
        const y = X[1];
        return Math.sin(x + y) + (x - y) * (x - y) - 1.5 * x + 2.5 * y + 3;
    },

    fprime: (X, fxprime) => {
        fxprime = fxprime || [0, 0];
        const x = X[0];
        const y = X[1];
        fxprime[0] = Math.sin(y) + Math.cos(x) * y + 2 * x;
        fxprime[1] = Math.sin(x) + Math.cos(y) * x + 2 * y;
        return fxprime;
    },

    xDomain: [-6, 6],
    yDomain: [6, -6],
};
