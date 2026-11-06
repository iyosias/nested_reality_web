const http = require("http");

http.createServer(function (req, res) {
	res.write("Stage 1 of the website setup completed");
	res.end();
}).listen(3000);

console.log("Server started on port 3000");
