// Import the libraries we need to use
const readline = require('readline');
const readlineSync = require('readline-sync')
const grpc = require('@grpc/grpc-js')
const protLoader = require('@grpc/proto-loader')

const PROTO_PATH_TUTORCHAT = __dirname + '/protos/tutorChat.proto';
const packageDefinitionTutorChat = protLoader.loadSync(PROTO_PATH_TUTORCHAT);
const tutorChat_proto = grpc.loadPackageDefinition(packageDefinitionTutorChat).tutorChatPackage;

// TutorChat Service

let service = 0;
while (service !== 1 && service !== 2) {
service = parseInt(readlineSync.question("Enter 1 for TutorChat or 2 for HomeTest\n"));
}

// If 1, run tutorChat, if 2 run HomeTest

if (service == 1) {

const client = new tutorChat_proto.TutorChat("0.0.0.0:4040", grpc.credentials.createInsecure());
// When service is initialised, student will enter their name 
const senderName = readlineSync.question("Please enter your name\n");
// Next need to start the call connection, by calling the tutorchat rpc service 
const call = client.TutorChat();

// Now we need to listen for messages using call.on
call.on("data", (response) => {
    // Print it to the console to read
    console.log(`${response.senderName} : ${response.message}`)
})

// Handle when the stream ends 
call.on("end", () => {
    console.log("The chat has ended")
})

// Handle any errors 
call.on("error", (e) => {
    console.log(`Error occured: ${e.message}`)
})

// Write an intro message to the chat when you launch it 
call.write({
    message: senderName + " has joined the chat",
    senderName,
})

// Here we set up an interface to listen for a stream of command line inputs and outputs using readlines Interface object. 
//It's easier and allows us to send multiple messages from CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// "line" will send input on the CLI when enter is clicked, and triggers the callback 
rl.on("line", (message) => {
    // check for "quit", which will trigger end of the call. 
    if (message.toLowerCase() === 'quit') {
        call.write({
            message: senderName + " has left the chat",
            senderName,
        });
        call.end();
        rl.close();
    } else {
        // If they didn't quit, then the message entered on that line will be sent to server. 
        call.write({
            message: message,
            senderName,
        });
    }
});

}

// HomeTest Service 

if (service == 2) {

// Create a gRPC client
const clientHomeTest = new tutorChat_proto.HomeTest("0.0.0.0:4040", grpc.credentials.createInsecure());
const clientSubmitTest = new tutorChat_proto.SubmitTest("0.0.0.0:4040", grpc.credentials.createInsecure());

let answers = [];

// Get the student's name from the user
const studentName = readlineSync.question("Write your name, and press enter to start the test. Only enter one answer for each question: ");

// Send the TestRequest message to the server to start the test
const request = { studentName };
const callTest = clientHomeTest.HomeTest(request);

// Everytime a question ("data") is received, log it to console. 
callTest.on("data", (question) => {
   // console.log(`Question ${question.questionNumber}: ${question.questionContent}`);
    const answer = readlineSync.question((`Question ${question.questionNumber}: ${question.questionContent}\n`));
    // Add to answers array to be sent in seperate submit unary call 
    answers.push({
        questionNumber: question.questionNumber,
        questionContent: answer
    })
});

// Handle the end of the stream
callTest.on("end", () => {
    console.log("Test completed")
    console.log("Your answers: \n" + JSON.stringify(answers));
    // Submit the answers using a seperate unary rpc call 
   
    // Make a request object to match the TrafficRequest in protos
    const request = {
        studentName,
        answers,
    };

    clientSubmitTest.SubmitTest(request, (error, response) => {
        if (error) {
            console.error('Error sending traffic inputs:', error);
        } else {
            console.log('Test submitted successfully:', response);
        }
    });

});


// Handle any errors
callTest.on("error", (error) => {
    console.error("Error:", error);
});

}