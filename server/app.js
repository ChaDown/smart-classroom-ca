
// Import the libraries we need to use
const grpc = require('@grpc/grpc-js')
const protLoader = require('@grpc/proto-loader')

const PROTO_PATH_TRAFFIC = __dirname + '/protos/traffic.proto';
const packageDefinitionTraffic = protLoader.loadSync(PROTO_PATH_TRAFFIC);
const traffic_proto = grpc.loadPackageDefinition(packageDefinitionTraffic).traffic;

// Traffic implementation on server side

// The teacher will get an array of responses, one from each student.
let studentResponsesArr = [];

// Logic for handling requests;
const TrafficInputs = (call, callback) => {
    try {
        const understandingLevel = parseInt(call.request.understandingLevel); // Be sure it's an int
        const studentName = call.request.studentName;
        // If they're both defined then we can proceed
        if(understandingLevel || studentName){
        // Add to responses array
        studentResponsesArr.push({understandingLevel, studentName});
        console.log(studentResponsesArr);
        callback(null, {
            message: "Successfully submitted"
        })
        }else{
        callback(null,{
            message: "Successfully submitted"
        })
        }
        }catch(e){
        callback(null, {
        message: `An error occured: ${e.message}`
        })
}
}
// Start our gRPC server 
const server = new grpc.Server(); 

// Add the service for receiving requests 
server.addService(traffic_proto.Traffic.service, { TrafficInputs });

//Bind the server 
server.bindAsync("0.0.0.0:4040", grpc.ServerCredentials.createInsecure(), function(){
    console.log("Server running on port 4040")
    })
