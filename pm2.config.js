module.exports = {
  apps: [
    {
      name: "morphin",
      script: "src/server.ts",
      exec_mode: "cluster",
      instances: 4, // or set a number like 4
      interpreter: "./node_modules/.bin/ts-node",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
    },
  ],
};
