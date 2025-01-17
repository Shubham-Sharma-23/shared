const cluster = require('cluster');
const express = require('express');
const numCPUs = require('os').cpus().length;
const loadFunction = require('./loadFunction').default;

class ClusterManager {
    constructor() {
        this.workers = new Map();
        this.metrics = {
            requestCount: 0,
            errorCount: 0
        };
    }

    start() {
        if (cluster.isPrimary) {
            console.log(`Primary process starting`);
            this.initializeMaster();
        } else {
            console.log(`Worker process starting`);
            this.initializeWorker();
        }
    }

    initializeMaster() {
        console.log(`Master process starting with ${numCPUs} workers`);

        // Initialize workers
        for (let i = 0; i < numCPUs; i++) {
            const worker = cluster.fork();
            this.workers.set(worker.id, {
                pid: worker.process.pid,
                requests: 0,
                errors: 0
            });
        }

        // Handle worker messages
        cluster.on('message', (worker, message) => {
            const stats = this.workers.get(worker.id);
            if (stats && message.type === 'metrics') {
                stats.requests = message.requests;
                stats.errors = message.errors;
            }
        });

        // Replace failed workers
        cluster.on('exit', (worker, code, signal) => {
            this.workers.delete(worker.id);
            cluster.fork();
        });

        // Monitoring endpoint
        const monitor = express();
        monitor.get('/status', (req, res) => {
            res.json({
                workers: Array.from(this.workers.values()),
                totalWorkers: this.workers.size
            });
        });
        monitor.listen(9999);
    }

    initializeWorker() {
        const app = express();
        let requestCount = 0;
        let errorCount = 0;

        // Request tracking
        app.use((req, res, next) => {
            requestCount++;
            res.on('finish', () => {
                if (res.statusCode >= 400) errorCount++;
            });
            next();
        });

        app.get('/api/task', (req, res) => {
            try {
                const result = loadFunction();
                res.json({ result, worker: process.pid });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.listen(process.env.PORT, () => {
            console.log(`Worker ${process.pid} started`);
        });

        // Report metrics
        setInterval(() => {
            process.send({ 
                type: 'metrics', 
                requests: requestCount,
                errors: errorCount
            });
        }, 5000);
    }
}

new ClusterManager().start();