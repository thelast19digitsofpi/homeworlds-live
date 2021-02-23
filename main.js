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
require("./server/archive.js");
require("./server/otherPages.js");
require("./server/complaints.js");
require("./server/admin.js");
// this has to be last
require("./server/errors.js");