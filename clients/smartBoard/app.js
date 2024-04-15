// Import the libraries we need to use
const readlineSync = require('readline-sync')
const grpc = require('@grpc/grpc-js')
const protLoader = require('@grpc/proto-loader')

const PROTO_PATH_SMARTBOARD = __dirname + '/protos/smartBoard.proto';
const packageDefinitionSmartBoard = protLoader.loadSync(PROTO_PATH_SMARTBOARD);
const smartBoard_proto = grpc.loadPackageDefinition(packageDefinitionSmartBoard).smartBoardPackage;


// Create a new client and link it to the same port as our server, 4040
const client = new smartBoard_proto.SmartBoard("0.0.0.0:4040", grpc.credentials.createInsecure());

// MAke a stream, which will log any errors that happened during the stream and allow us to use call.write() to send multiple requests
const call = client.SnapshotsInput((error, response) => {
    if (error) {
        console.error('Error sending snapshots:', error);
    } else {
        console.log('Snapshots sent successfully:', response.message);
    }
});

// Function to send snapshots to the server, made seperate function for readibility
const sendSnapshot = (snapshot, dateTime) => {
    const request = {
        snapshot: snapshot,
        dateTime: dateTime
    };
    // Write the request to the stream
    call.write(request);
    console.log("call written");
}

// Use a while loop for multiple calls, when we want to break the loop use "break"
while (true) {
    const snapshot = readlineSync.question("Enter the snapshot (enter q to quit): \n");
    if (snapshot.toLowerCase() === 'q') {
        break;
    }
    const dateTime = new Date().toISOString(); // Uses the current dateTime
    sendSnapshot(snapshot, dateTime);
}

// This ends the stream when the teacher wants to quit by pressing "q"
call.end();