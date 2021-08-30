const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const port = process.env.API_PORT || 3000;


//Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});