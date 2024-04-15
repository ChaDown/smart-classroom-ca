
// Import the libraries we need to use
const grpc = require('@grpc/grpc-js')
const protLoader = require('@grpc/proto-loader')

// Load proto for trafficLights
const PROTO_PATH_TRAFFIC = __dirname + '/protos/traffic.proto';
const packageDefinitionTraffic = protLoader.loadSync(PROTO_PATH_TRAFFIC);
const traffic_proto = grpc.loadPackageDefinition(packageDefinitionTraffic).traffic;

// Load proto for smartBoard
const PROTO_PATH_SMARTBOARD = __dirname + '/protos/smartBoard.proto';
const packageDefinitionSmartBoard = protLoader.loadSync(PROTO_PATH_SMARTBOARD);
const smartBoard_proto = grpc.loadPackageDefinition(packageDefinitionSmartBoard).smartBoardPackage;

// Load TutorChat proto 
const PROTO_PATH_TUTORCHAT = __dirname + '/protos/tutorChat.proto';
const packageDefinitionTutorChat = protLoader.loadSync(PROTO_PATH_TUTORCHAT);
const tutorChat_proto = grpc.loadPackageDefinition(packageDefinitionTutorChat).tutorChatPackage;

// Traffic implementation on server side

// The teacher will get an array of responses, one from each student.
let studentResponsesArr = [];

// Logic for handling requests;
const TrafficInputs = (call, callback) => {
    try {
        const understandingLevel = parseInt(call.request.understandingLevel); // Be sure it's an int
        const studentName = call.request.studentName;
        // If they're both defined then we can proceed
        if(understandingLevel && studentName){
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

// SmartBoard implementation on server side

const SnapshotsInput = (call, callback) => {
    try {
        // Array for storing the snapshots
        const snapshots = [];

        // 
        call.on('data', (message) => {
            // Add each snapshot to the array, first destructure the message 
            const {snapshot, dateTime} = message;
            snapshots.push({snapshot, dateTime});
        });

        call.on('end', () => {
            
            // Message when the stream ends
            console.log('Snapshots received:', snapshots);

            // // Add the snapshots to the array or perform any other processing logic
            // smartBoardSnapshotsArray.push(...snapshots);

            // Send response message back as defined in the proto
            callback(null, { message: 'Snapshots received successfully' });
        });
    } catch (e) {
        // Handle any errors that occur during request processing
        callback({
            message: `An error occurred: ${e.message}`
        });
    }
};

// TutorChat implementation on server side

// This object will be all the connected clients who join the "chat"
const connectedClients = {};

// TutorChat will handle all incoming messages to the server
const TutorChat = (call) => {

    // When a message is received the stream turns on
    call.on("data", (chatMessage) => {
    
        // First we check if the client is already in the chat (in connectedClients obj), if not we add them in
        if (!(chatMessage.senderName in connectedClients)) {
            const senderName = chatMessage.senderName;
            connectedClients[senderName] =
             {
                senderName,
                call,
            }
            // Call will be a reference to the call object for each individual user in the chat, which enables the bidirectional streaming
        }

        // Now we need to broadcast the message received to all connected Clients
        for (const client in connectedClients) {
    
            // Dont send the same message back to sender, but send to all other members 
            if (client !== chatMessage.senderName) {
            // Write to the call object of each client, this is sending a message
            connectedClients[client].call.write({
                senderName: chatMessage.senderName,
                message: chatMessage.message
            })
        }}

        // When the client ends the connection
        call.on('end', function() {
            // End the call
            call.end();
        });
    
         // If there is an error with the call
        call.on('error', function(e) {
        // Log the error
            console.log(e);
         });
    })
}



    // HomeTest service implementation. This will be server streaming, where the test questioned are administered in a stream every x minutes

    // First we will make an empty Qs array, which can be updated by teacher using the below function. 
    // let testQuestions = [];

    // const addNewQuestions = (questions) => {
    //     testQuestions = questions;
    // }

const HomeTest = (call) => {
    
    const questions = [
        { questionNumber: 1, questionContent: "Question 1" },
        { questionNumber: 2, questionContent: "Question 2" },
        // Add more questions as needed
    ];

    // Listen for the request to start the service
    call.on('data', (request) => {
        
        const studentName = request.studentName;
        if (!studentName) {
            // If the student's name is missing, send an error response
            call.emit('error', new Error('Student name is required'));
            return;
        }
    }
    )

    // Send each question to the client every 5 seconds. In reality it would be x minutes, but for simplicity using 5s. 
    const interval = setInterval(() => {
        // use .shift() to return and remove the first question, which will keep hapopening until array is empty.
        const question = questions.shift();
        if (question) {
            call.write(question);
        } else {
            clearInterval(interval);
            call.end();
        }
    }, 5000);
};

// Submit Test Service Implementation

let studentTestResults = [];

const SubmitTest = (call, callback) => {

    try {
    const testResult = call.request;
    if (testResult) 
    {
        studentResponsesArr.push(testResult);
        console.log(studentResponsesArr);
        callback( null, {
        message: "Test saved on server"
        });
        
    }
    else {
        callback(null, {
            message: "Not saved on server"
        })
    }
}
    catch(e){
        callback(null, {
        message: `An error occured: ${e.message}`
        })
}
}

// Start our gRPC server and add the services defined above
const server = new grpc.Server(); 

// Add the services for receiving requests 
server.addService(traffic_proto.Traffic.service, { TrafficInputs }); // unary
server.addService(smartBoard_proto.SmartBoard.service, { SnapshotsInput }); // client stream
server.addService(tutorChat_proto.TutorChat.service, { TutorChat }); // bidirectional stream 
server.addService(tutorChat_proto.HomeTest.service, { HomeTest }); // server stream
server.addService(tutorChat_proto.SubmitTest.service, { SubmitTest }); // unary

//Bind the server 
server.bindAsync("0.0.0.0:4040", grpc.ServerCredentials.createInsecure(), function(){
    console.log("Server running on port 4040")
    })


