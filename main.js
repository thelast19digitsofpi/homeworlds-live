// main.js
//
// Entry point for server.
//

// Order is important here...
require("./server/https.js");
//require("./server/httpRedirect.js");
require("./server/accounts.js");
require("./server/main-page.js");
require("./server/socket.js");
require("./server/lobby.js");
require("./server/gameManager.js");
require("./server/tutorials.js");