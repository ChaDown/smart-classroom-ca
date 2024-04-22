// In the JS file, we will make calls to the servers API from the admin to view / edit/ post certain things 
// A lot of the fetches will be similar, so i will follow the same style

const HOST = "http://localhost:3030";

// All of the fetched Data will be displayed in one information panel to the teacher. With every API Call this will be updated.
const apiResponseSection = document.getElementById("apiResults");
apiResponseSection.innerText = "No data received yet";

// TraficLights Service 
async function fetchTrafficLights() {
    try {
        const response = await fetch(`${HOST}/traffic-lights`);
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        // Update UI to show results
        if (data.length == 0) {
            apiResponseSection.innerText = "No responses yet"
        }
        else {

        let studentResponses = "Traffic Light Responses <br>" 
        data.forEach((res) => {
            // Get colour of traffic light to apply conditional class
            let trafficLightColour;
            if (res.understandingLevel === 1) trafficLightColour = "green";
            if (res.understandingLevel === 2) trafficLightColour = "yellow";
            if (res.understandingLevel === 3) trafficLightColour = "red";

            studentResponses += `${res.studentName}:   ` + `<span class="circle ${trafficLightColour}"></span><br>`;

        })
        apiResponseSection.innerHTML = studentResponses;
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function clearTrafficLights() {
    try {
        const response = await fetch(`${HOST}/traffic-lights`, {
            method: "DELETE"
        });
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        // Update UI to show results
        apiResponseSection.innerText = data;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

//  SmartBoard Service 
async function fetchSnapshots() {
    try {
        const response = await fetch(`${HOST}/snapshots`);
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
         // Update UI to show results
         if (data.length == 0) {
            apiResponseSection.innerText = "No snapshots yet"
        }
        else {
        
        let snapshots = "Snapshots:\n"
        data.forEach((res) => {
            snapshots += `${res.dateTime}: ${res.snapshot}\n`

        })
        apiResponseSection.innerText = snapshots;
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function clearSnapshots() {
    try {
        const response = await fetch(`${HOST}/snapshots`, {
            method: "DELETE"
        });
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        // Update UI to show results
        apiResponseSection.innerText = data;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// TutorChat Service 
async function fetchChat() {
    try {
        const response = await fetch(`${HOST}/tutor-chat-messages`);
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
         // Update UI to show results
         if (data.length == 0) {
            apiResponseSection.innerText = "No chat messages yet"
        }
        else {
        let chatMessages = "Chat Messages:\n"
        data.forEach((res) => {
            chatMessages += `${res.senderName}: ${res.message}\n`

        })
        apiResponseSection.innerText = chatMessages;
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function clearChat() {
    try {
        const response = await fetch(`${HOST}/tutor-chat-messages`, {
            method: "DELETE"
        });
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        // Update UI to show results
        apiResponseSection.innerText = data;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Teacher can add a question to the test, and when all questions ready, make the test live. 

async function addQuestions(questionsArr) {
    try {
        const response = await fetch(`${HOST}/home-test/questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(questionsArr)
        });
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        // Update UI to show results
        apiResponseSection.innerText = data;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

let questionsArr = [];

function addToQuestionsArr(questionNumber, questionContent) {
    questionsArr.push({questionNumber, questionContent});
    //Show the new questions in info panel, make UI look nice and readible not just an object
    let initialText = "Test Content:\n"
    questionsArr.forEach((question) => {
        initialText += `Question ${question.questionNumber}: ${question.questionContent}\n`;    })
    apiResponseSection.innerText = initialText;
    //apiResponseSection.innerText = JSON.stringify(questionsArr);
}

// Get student test results 
async function fetchResults() {
    try {
        const response = await fetch(`${HOST}/student-results`);
        
        // Check is response is okay (200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
         // Update UI to show results
         // Make more readible to the teacher
 
         let resultsMsg = "";

         if (data.length > 0) {

         data.forEach((testResult) => {
            resultsMsg += `${testResult.studentName}:\n`;
            // then do another loop through each answer
            if (testResult.answers) {
            testResult.answers.forEach((answer) => {
                resultsMsg += `${answer.questionNumber}: ${answer.questionContent}\n`
            })};
         })

         apiResponseSection.innerText = resultsMsg;
        }

        else apiResponseSection.innerText = "No results yet";

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function deleteTest() {
    try {
        const response = await fetch(`${HOST}/delete-test`, {
            method: "DELETE",
        });
        // Check is response is okay (200)
        if (!response.ok) {
            console.log(response)
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
         // Update UI to show results
        apiResponseSection.innerText = JSON.stringify(data);
        // Empty the current front end questions arr
        questionsArr = [];

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Get all the buttons and add the click events for the above functions 
document.getElementById("showTrafficLightsBtn").addEventListener("click", fetchTrafficLights);
document.getElementById("clearTrafficLightsBtn").addEventListener("click", clearTrafficLights);

document.getElementById("showSnapshotsBtn").addEventListener("click", fetchSnapshots);
document.getElementById("clearSnapshotsBtn").addEventListener("click", clearSnapshots);

document.getElementById("showChatBtn").addEventListener("click", fetchChat);
document.getElementById("clearChatBtn").addEventListener("click", clearChat);

// Add add to test and submit test handlers, need to do this each time as values will change with user input
document.getElementById("addToTestBtn").addEventListener("click", () => {
    const questionContentValue = document.getElementById("questionContent").value;
    const questionNumberValue = document.getElementById("questionNumber").value;
    addToQuestionsArr(questionNumberValue, questionContentValue);
});

document.getElementById("makeTestAvailableBtn").addEventListener("click", () => {
    addQuestions(questionsArr);
});

document.getElementById('testResultsBtn').addEventListener("click", fetchResults);
document.getElementById('deleteTestBtn').addEventListener("click", deleteTest);
