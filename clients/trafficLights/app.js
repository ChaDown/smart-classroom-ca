// Import the libraries we need to use
const readlineSync = require('readline-sync')
const grpc = require('@grpc/grpc-js')
const protLoader = require('@grpc/proto-loader')

const PROTO_PATH_TRAFFIC = __dirname + '/protos/traffic.proto';
const packageDefinitionTraffic = protLoader.loadSync(PROTO_PATH_TRAFFIC);
const traffic_proto = grpc.loadPackageDefinition(packageDefinitionTraffic).traffic;

// Create a new client and link it to the same port as our server, 4040
const client = new traffic_proto.Traffic("0.0.0.0:4040", grpc.credentials.createInsecure())

// Get the students response, in real world students name will be automiatically inputted but here we will do it manually. 
let understandingLevel = 0;
// Use a while loop to guarantee correct input, make it an int using parseInt
while (!(understandingLevel === 1 || understandingLevel === 2 || understandingLevel === 3)) {
    const inputNumber = (readlineSync.question("What's your understanding level?\n1 = Very Good\n2 = Okay, but would like to review\n3 = Need some help\n"));
   // If it is a number and not a string, then parse it and if it's valid it will break the loop
    if (!isNaN(inputNumber)) understandingLevel = parseInt(inputNumber);
}

// Get students name 
let studentName = "";
// Similar check and loop if it's a string and not empty
while (typeof studentName !== 'string' || studentName.trim() === '') {
    studentName = readlineSync.question("Enter your name\n");
}

// Make a request object to match the TrafficRequest in protos
const request = {
    understandingLevel,
    studentName
};


client.TrafficInputs(request, (e, response) => {
    if (e) {
        console.error('Error sending traffic inputs:', e.message);
    } else {
        console.log('Traffic inputs sent successfully:', response);
    }
});


