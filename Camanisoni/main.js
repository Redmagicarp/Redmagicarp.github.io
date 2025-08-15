//=============//
//== CLASSES ==//
//=============//

class AI {
    constructor() {
        this.response_list = {

            2 : {
                starter_response: "Hello! What do you need help with?",
                math: {
                    [LearningStyles.Flashcard]: "Math Flashcards here!",
                    [LearningStyles.Video]: "Math Video here!",
                    [LearningStyles.Summary]: "Math Summary here!",
                    
                },

                "Help me focus":{
                    [LearningStyles.Flashcard]: "Activating focus mode",
                    [LearningStyles.Video]: "Activating focus mode",
                    [LearningStyles.Summary]: "Activating focus mode",
                },

                "I am done studying":{
                    [LearningStyles.Flashcard]: "Deactivating focus mode",
                    [LearningStyles.Video]: "Deactivating focus mode",
                    [LearningStyles.Summary]: "Deactivating focus mode",
                },

                "xS_3432qHaS3aSF44sxSAZ":{
                    [LearningStyles.Flashcard]: "You are already in focus mode",
                    [LearningStyles.Video]: "You are already in focus mode",
                    [LearningStyles.Summary]: "You are already in focus mode",
                }
            },
            3 : {
                starter_response: "Hello! How are you feeling?",
                Bad: "Oh no! What is making you feel this way?",
                Good: "Glad you feel that way!",
                "Help me focus" : "Activating focus mode",
            }
        };
        this.unrecognised_response = "Sorry, that is beyond my capabilities!";
    }

    respond(message, admin = false) {
        if (message == "starter_response" && !admin) {return "You sneaky sneaky man";}

        //Toggle focus mode before sending message//
        if (message == "Help me focus" && !FocusMode)
        {
            FocusMode = true;

            if (CurrentPage == 3) //In Chat mode
            {
                setTimeout(function(){
                    LoadPage(2)
                }, 700)
            }
        }
        else if (message == "Help me focus")
        {
            message = "xS_3432qHaS3aSF44sxSAZ";
        }
        else if (message == "I am done studying" && FocusMode)
        {
            FocusMode = false;
        }
        else if (message == "I am done studying")
        {
            message = "ER!R3RRR7ORRORO!@8RROR#@923OR0#R454ROR0"
        }
        
        switch (CurrentPage) {
            case 2:
                if (LearningStyle === LearningStyles.None && message !== "starter_response") {
                    console.log("ERROR: no learning preference selected.");
                    return "Sorry, there was an error!";
                }

                const subjectData = this.response_list[2];
                if (message in subjectData && message !== "starter_response") {
                    return subjectData[message][LearningStyle] || this.unrecognised_response;
                }
                else if (message === "starter_response")
                {
                    return subjectData[message];
                }
                return this.unrecognised_response;

            case 3:
                const emotionData = this.response_list[3];
                return emotionData[message] || this.unrecognised_response;

            default:
                return this.unrecognised_response;
        }
    }
}


//=====================//
//== JAVASCRIPT VARS ==//
//=====================//

//== HTML REFERENCES ==//
const Header = document.getElementsByTagName("header")[0];
const HeaderNav = document.querySelector("header nav");

const HomePageButtonDiv = document.getElementById("homepage_buttons");

const ChatContainers = document.getElementsByClassName("chat_container");

const Footer = document.getElementsByTagName("footer")[0];

const InputField = document.getElementById("user_textinput");
const SendButton = document.getElementById("send");

const body = document.getElementsByTagName("body")[0];


const AppSections = document.getElementsByClassName("mainsection");

const SettingsPage = document.getElementById("settings_page");
const SettingsButton = document.getElementById("study_settings");
const LearningPreferences = document.querySelector("#settings_page div");

const BreakNotificationContainer = document.getElementById("break_notification");

const NoteReviewerSection = document.getElementById("ai_note_reviewer");
const UserNote = document.getElementById("user_note");
const UploadNotes = document.getElementById("upload_notes");
const ViewStoredNotes = document.getElementById("view_notestore");
const ReviewResults = document.getElementById("review_results");
const SaveNoteButton = document.getElementById("save_note");
const ReviewButton = document.getElementById("review");

//== GLOBAL VARS ==//
let LearningStyles = {
    Flashcard : "Flashcard",
    Video : "Video",
    Summary : "Summary",

    None : "None",
}

let LearningStyle = LearningStyles.None;

let CurrentPage = 0;

let NavMenuEnabled = false;
let SettingsMenuState = true;

let FocusMode = false;


const ChatAI = new AI();

//================//
//== FUINCTIONS ==//
//================//

//= GENERAL FUNCTIONS =//
function LoadPage(pageID)
{
    if (pageID < 0 || pageID >= AppSections.length) 
    {
        console.log("ERROR: INDEX OUT OF RANGE!"); 
        return 0;
    }

    CurrentPage = parseInt(pageID);

    if (CurrentPage > 1)
    {
        DisplayFooter(true);

        if (ChatContainers[CurrentPage - 2].children.length == 0)
        {
            let AI_Response = ChatAI.respond("starter_response", true);
            let container = ChatContainers[CurrentPage - 2];

            CreateChatBubble(AI_Response, container, true);
        }
    }
    else
    {
        DisplayFooter(false);
    }

    for (let pageIndex = 0; pageIndex < AppSections.length; pageIndex++)
    {
        if (pageIndex === CurrentPage)
        {
            AppSections[pageIndex].style.display = "block";
        }
        else
        {
            AppSections[pageIndex].style.display = "none";
        }
    }
}

function ToggleMenu()
{
    if (NavMenuEnabled == false)
    {
        NavMenuEnabled = true;
        HeaderNav.style.display = "block";
    }
    else
    {
        NavMenuEnabled = false;
        HeaderNav.style.display = "none"
    }
}

function DisplayBreakNotification()
{
    if (!FocusMode)
    {
        const P_notification = document.createElement("p");

        P_notification.innerHTML = "Hey! You should take a break right now!";

        const newBreakNotification = document.createElement("div");

        newBreakNotification.appendChild(P_notification);

        newBreakNotification.id = "break_notification";

        body.appendChild(newBreakNotification);

        const MiddleDistance = Math.abs((window.innerWidth * 0.5) - (newBreakNotification.offsetWidth * 0.5))

        newBreakNotification.style.left = `${MiddleDistance}px`;

        setTimeout(function(){
            body.removeChild(newBreakNotification);
        }, 2000);
    }
}

function SetSettingsMenuState(state)
{
    if (state === false)
    {
        SettingsPage.style.display = "none";
        SettingsMenuState = false;
    }
    else
    {
        SettingsPage.style.display = "block";
        SettingsMenuState = true;
    }
}

function UpdatePreference(preference)
{
    //Update CSS//
    for (let i = 0; i < LearningPreferences.children.length; i++)
    {
        if (LearningPreferences.children[i].id === preference)
        {
            LearningPreferences.children[i].classList.add("selected");
        }
        else
        {
            LearningPreferences.children[i].classList.remove("selected");
        }
    }

    LearningStyle = preference;
}


function DisplayFooter(request)
{
    if (request == true)
    {
        Footer.style.display = "block";
    }
    else
    {
        Footer.style.display = "none";
    }
}

//= EventListenerFunctions =//
function HeaderOnClick(event)
{
    if (event.target.id === "menu_button")
    {
        ToggleMenu();
    }

    if (event.target.id.substring(0, 11) === "mainsection")
    {
        const PageIndex = event.target.id.substring(12);
        if (PageIndex == 0  || PageIndex == 3)
        {
            if (FocusMode) {return;}

            LoadPage(PageIndex);
        }
        else
        {
            LoadPage(PageIndex);
        }
    }
}

function OnSelectLearningPreference(event)
{
    if (event.target.id === undefined) { return 0; }

    if (event.target.id === "settings_page") { return 0; }

    UpdatePreference(event.target.id);
    SetSettingsMenuState(false);
}

function OnClickSettings()
{
    if (SettingsMenuState === false)
    {
        SetSettingsMenuState(true);
    }
    else
    {
        SetSettingsMenuState(false);
    }
}


function OnClickHomePageButton(event)
{
    if (event.target.id.substring(0, 15) === "mainsectionhome")
    {
        const pageIndex = event.target.id.substring(16);
        
        LoadPage(pageIndex);
    }
}


function NoteReviewSectionClickListner(event)
{
    event.preventDefault();

    if (event.target.closest("#upload_notes") !== null)
    {
        UploadNotes.style.display = "none";
        UserNote.style.display = "block";
    }

    else if (event.target.id == "review")
    {
        if (UserNote.style.display === "block")
        {
            event.target.style.display = "none";

            UserNote.src = "images/notes_revised.png";
            ViewStoredNotes.style.display = "none";
            

            ReviewResults.style.display = "block";
            SaveNoteButton.style.display = "block";
        }
    }

    else if (event.target.id == "save_note")
    {
        event.target.style.display = "none";

        //Reset everything below//
        UserNote.style.display = "none";
        UserNote.src = "images/notes.jpg";

        ReviewResults.style.display = "none";

        ReviewButton.style.display = "block";
        UploadNotes.style.display = "block";
        ViewStoredNotes.style.display = "block";


    }
}

function CreateChatBubble(message, chatContainer, IsAdmin = false)
{
    let msg = document.createElement("p");

    if (!IsAdmin)
    {
        msg.classList.add("user_message");
    }
    else
    {
        msg.classList.add("ai_response");
    }

    msg.innerText = message;
    chatContainer.appendChild(msg);

    let break_point = document.createElement("br");
    chatContainer.appendChild(break_point);
}

//= User Functions =//
function SendResponse() 
{
    const CurrentChatContainerIndex = CurrentPage - 2;

    if (CurrentChatContainerIndex < 0 && CurrentChatContainerIndex >= ChatContainers.length) { return 0; }

    let user_input = InputField.value.trim();

    let container = ChatContainers[CurrentPage - 2];

    let AI_response = ChatAI.respond(user_input);

    if (container === undefined) {return 0;}

    // Create user message element
    CreateChatBubble(user_input, container);
    CreateChatBubble(AI_response, container, true);

    container.scrollTop = container.scrollHeight;

    InputField.value = "";
}




function main()
{
    console.log("Page loaded! Running main code!")

    //- Load Home Page on start up -//
    LoadPage(0);

    //Link Header click event
    Header.addEventListener("click", function(event){
        event.preventDefault();

        HeaderOnClick(event);
    });

    //Link HomePage Buttons
    HomePageButtonDiv.addEventListener("click", function(event){
        event.preventDefault();

        OnClickHomePageButton(event);
    });

    //Link settings Button//
    SettingsButton.addEventListener("click", function(event){
        event.preventDefault();

        OnClickSettings();
    });

    //Links learning preferences buttons
    LearningPreferences.addEventListener("click", function(event){
        event.preventDefault();

        OnSelectLearningPreference(event);
    });

    //Link User Send Button//
    SendButton.addEventListener("click", function(event){
        event.preventDefault();
        SendResponse();
    });

    //Link NoteReviewerClickEvent//
    NoteReviewerSection.addEventListener("click", NoteReviewSectionClickListner);

    //Link Rest Timer to every 45s
    setInterval(DisplayBreakNotification, 27000)
}


main();
SendResponse();