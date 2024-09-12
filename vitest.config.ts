/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        include: ['test/fmin-test.js'],
        exclude: [],
    },
});
