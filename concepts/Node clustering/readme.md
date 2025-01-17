# Node Clustering

This project demonstrates how to set up and run a Node.js application with clustering to take advantage of multi-core systems.

## Prerequisites

- Node.js installed on your machine
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Running the Project

To run the project, you can use the scripts defined in the `package.json` file. Here are the common scripts:

- **Start the application:**
    ```sh
    npm start:basic # without clustering
    npm start:cluster # with clustering
    ```

- **Run in development mode:**
    ```sh
    npm run dev:basic # without clustering using nodemon
    npm run dev:cluster # with clustering using nodemon
    ```

## Clustering

The application uses the `cluster` module to fork multiple worker processes. This allows the application to handle more load by utilizing multiple CPU cores.