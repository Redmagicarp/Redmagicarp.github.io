/*jshint esversion: 6 */

//==============//
//=== AUDIOS ===//
//==============//
const MikuDeathAudio = new Audio("audio/miku_death.mp3");
const MikuWeeAudio = new Audio("audio/miku_wee.mp3");
const ConfettiAudio = new Audio("audio/confetti.mp3");
const SimulationBGMAudio = new Audio("audio/simulation_bgm.mp3");

SimulationBGMAudio.loop = true;


//==================//
//==== CLASSES =====//
//==================//

//== Vector2 Class ==//
class Vector2
{
    constructor(x, y)
    {
        this.X = x;
        this.Y = y;
    }

    Normalize()
    {
        let newX = 0;
        let newY = 0;

        if (this.X !== 0)
        {
            newX = this.X / Math.abs(this.X);
        }
        if (this.Y !== 0)
        {
            newY = this.Y / Math.abs(this.Y);
        }

        return new Vector2(newX, newY);
    }

    SimplePerpendicular()
    {
        let newX = -this.Y;
        let newY = this.X;

        return new Vector2(newX, newY);
    }
}


//== Entity Class ==//
class EntityObject 
{
    constructor(startPosX, startPosY, minTraversible, maxTraversible, shape, teamColor)
    {
        this.PosX = startPosX;
        this.PosY = startPosY;
        this.TraversibleTiles = [minTraversible, maxTraversible];
        this.Shape = shape;
        this.TeamColor = teamColor;
        this.IsAlive = true;
    }

    Render(canvasCtx, cellWidth, cellHeight, canvasLineWidth)
    {
        if (this.IsAlive)
        {
            const LeftOffset = cellWidth * this.PosX + canvasLineWidth;
            const TopOffset = cellHeight * this.PosY + canvasLineWidth;

            canvasCtx.strokeStyle = this.TeamColor;
            canvasCtx.fillStyle = this.TeamColor;
            canvasCtx.lineWidth = canvasLineWidth;


            switch (this.Shape)
            {
                case "triangle":
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(LeftOffset, TopOffset + cellHeight);
                    canvasCtx.lineTo((cellWidth * 0.5) + LeftOffset, TopOffset);
                    canvasCtx.lineTo(cellWidth + LeftOffset, TopOffset + cellHeight);
                    canvasCtx.fill();
                    break;

                case "circle":
                    canvasCtx.beginPath();
                    canvasCtx.arc((cellWidth / 2) + LeftOffset, (cellHeight / 2) + TopOffset, (cellHeight / 2), 0, Math.PI * 2, true);
                    canvasCtx.fill();
                    break;

                default:
                    console.log("INVALID SHAPE!");
                    break;

            }

            canvasCtx.stroke();
        }
    }

     Move(TargetTeam)
    {
        if (this.IsAlive)
        {
            //First Find a closestTarget to attack
            const ClosestTarget = this.__GetClosestTarget(TargetTeam);

            if (ClosestTarget)
            {
                const TargetVector = new Vector2(ClosestTarget.PosX - this.PosX, ClosestTarget.PosY - this.PosY);
                const NormalizedTargetDirection = TargetVector.Normalize();

                let FinalMovement = new Vector2(0, 0);

                if (Math.abs(TargetVector.X) > Math.abs(TargetVector.Y)) //Checks which axis is longer
                {
                    //The logic for when X is the longer axis
                    if (this.__IsCellTraversible(this.PosX + NormalizedTargetDirection.X, this.PosY))
                    {
                        FinalMovement = new Vector2(NormalizedTargetDirection.X, 0); //Only make the preferredDirection the final movement if it can go in that direction
                    }

                    else if (this.__IsCellTraversible(this.PosX, this.PosY + NormalizedTargetDirection.Y))
                    {
                        FinalMovement = new Vector2(0, NormalizedTargetDirection.Y);
                    }

                    else if (this.__IsCellTraversible(this.PosX, this.PosY - NormalizedTargetDirection.Y))
                    {
                        FinalMovement = new Vector2(0, -NormalizedTargetDirection.Y);
                    }

                    else if (this.__IsCellTraversible(this.PosX - NormalizedTargetDirection.X, this.PosY))
                    {
                        FinalMovement = new Vector2(-NormalizedTargetDirection.X, 0);
                    }
                    
                }
                else
                {
                    //The logic for when Y is the longer axis
                    if (this.__IsCellTraversible(this.PosX, this.PosY + NormalizedTargetDirection.Y))
                    {
                        FinalMovement = new Vector2(0, NormalizedTargetDirection.Y);
                    }

                    else if (this.__IsCellTraversible(this.PosX + NormalizedTargetDirection.X, this.PosY))
                    {
                        FinalMovement = new Vector2(NormalizedTargetDirection.X, 0);
                    }

                    else if (this.__IsCellTraversible(this.PosX - NormalizedTargetDirection.X, this.PosY))
                    {
                        FinalMovement = new Vector2(-NormalizedTargetDirection.X, 0);
                    }

                    else if (this.__IsCellTraversible(this.PosX, this.PosY - NormalizedTargetDirection.Y))
                    {
                        FinalMovement = new Vector2(0, -NormalizedTargetDirection.Y);
                    }
                }
                
                //Do movement after logic is done
                if (this.__IsCellTraversible(this.PosX + FinalMovement.X, this.PosY + FinalMovement.Y)) //Ensures no out of bounds movement
                {
                    this.PosX += FinalMovement.X;
                    this.PosY += FinalMovement.Y;
                }

                //Do entity killing logic below//
                if (this.PosX == ClosestTarget.PosX && this.PosY == ClosestTarget.PosY)
                {
                    ClosestTarget.IsAlive = false;
                }
                
            }
        }
    }


    //Private
    __GetClosestTarget(targetTeam) //Returns a EntityObject
    {
        let SmallestDistance = Infinity;
        let TargetEntity;

        for (const entity of targetTeam)
        {
            if (entity.IsAlive)
            {
                const Distance = (entity.PosX - this.PosX) * (entity.PosX - this.PosX) + (entity.PosY - this.PosY) * (entity.PosY - this.PosY);
                if (Distance < SmallestDistance)
                {
                    TargetEntity = entity;
                    SmallestDistance = Distance;
                }
            }
        }

        return TargetEntity;
    }

    __IsCellTraversible(X, Y)
    {
        //Ensures the movement is not out of bounds
        if (X < 0)
        {   
            return false;
        }

        if (Y < 0)
        {
            return false;
        }

        if (X >= canvasDimensions[0])
        {
            return false;
        }

        if (Y >= canvasDimensions[1])
        {
            return false;
        }

        //Next, Ensure it is not a cell it just went from (If it is asked to go backwards in pathfinding)
        if (this.TemporaryUnavailableCell)
        {
            if (X == this.TemporaryUnavailableCell.X && Y == this.TemporaryUnavailableCell.Y)
            {
                return false;
            }
        }

        //Only then, calculate noise if the movement is not out of bounds and cell is not where it came from decided in pathfinder
        const NoiseAtTile = CellNoiseLevels[Y][X];
        let TileTraversibility = -2; //Default to Deepwater index (-2)

        //Below is the TileTraversibility overwrite to detect what tile it is
        if (NoiseAtTile > ShallowWaterThreshold)
        {
            TileTraversibility += 1;
        }
        if (NoiseAtTile > LandThreshold)
        {
            TileTraversibility += 1;
        }
        if (NoiseAtTile > MountainThreshold)
        {
            TileTraversibility += 1;
        }

        if (TileTraversibility >= this.TraversibleTiles[0] && TileTraversibility <= this.TraversibleTiles[1])
        {
            return true;
        }

        return false;
    }
}
//==================//



//====================//
//PERLIN NOISE SECTION//
//====================//
const GlobalFrequency = 0.0473;

let PermutatedTable;

function InitPerlinNoise() // Must be called first and can be called again to regenerate the world
{
    PermutatedTable = [];
    for (let i = 0; i < 256; i++) //Init Permutated table
    {
        PermutatedTable[i] = i;
    }

    //shuffle table => Permutation
    for (let i = 0; i < 256; i++) //Shuffle it x times
    {
        const FirstIndex = Math.floor(Math.random() * 255);
        const SecondIndex = Math.floor(Math.random() * 255);

        const TempValue = PermutatedTable[FirstIndex];
        PermutatedTable[FirstIndex] = PermutatedTable[SecondIndex];
        PermutatedTable[SecondIndex] = TempValue;
    }
}

const Sqrt2_Inverse = 1 / Math.sqrt(2); //Inversed to normalise => 1.41.. -> 0.707...
const VectorTable =
[
    [-1, 0], // Left
    [-Sqrt2_Inverse, Sqrt2_Inverse], //Top Left
    [0, 1], //Top
    [Sqrt2_Inverse, Sqrt2_Inverse], //Top Right
    [1, 0], //Right
    [Sqrt2_Inverse, -Sqrt2_Inverse], //Bottom Right
    [0, -1], //Bottom
    [-Sqrt2_Inverse, -Sqrt2_Inverse] //Bottom Left
];

function ApplyFadeFunction(value)
{
    return 6 * Math.pow(value, 5) - 15 * Math.pow(value, 4) + 10 * Math.pow(value, 3);
}

function PerlinNoise(x, y, frequency)
{
    const xFrequency = x * frequency;
    const yFrequency = y * frequency;

    const xf = Math.floor(xFrequency);
    const yf = Math.floor(yFrequency);

    const Points =
    [
        [xf, yf], //Bottom Left
        [xf + 1, yf], //Bottom Right
        [xf, yf + 1], //Top Left
        [xf + 1, yf + 1]  // Top Right
    ];

    let dotProducts = [];

    for (let i = 0; i < 4; i++)
    {
        //Gets the vector to the point given in parameters
        const TargetVector = [
            xFrequency - Points[i][0], //X axis
            yFrequency - Points[i][1] //Y axis
        ];

        //Maps a vector from the vector table to each corner point (P0, P1...)
        const Hash = PermutatedTable[(PermutatedTable[Points[i][0] % 255] + Points[i][1] ) % 255] % 7;
        const PointVector = VectorTable[Hash];
        dotProducts.push(PointVector[0] * TargetVector[0] + PointVector[1] * TargetVector[1]);
    }

    //Get the distance of the point from the bottom left of the cell (Do not directly use coordinate!)
    const u = xFrequency - xf;
    const v = yFrequency - yf;

    const FadedWeightX = ApplyFadeFunction(u);
    const FadedWeightY = ApplyFadeFunction(v);

    //Bilinear interpolation used below
    const LerpedBottomX = Lerp(dotProducts[0], dotProducts[1], FadedWeightX);
    const LerpedTopX = Lerp(dotProducts[2], dotProducts[3], FadedWeightX);

    const LerpedYNoise = Lerp(LerpedBottomX, LerpedTopX, FadedWeightY);
    return LerpedYNoise;
}

function GetTerrainNoise(row, column)
{
    const NoiseLevel1 = PerlinNoise(column, row, GlobalFrequency);
    const NoiseLevel2 = PerlinNoise(column, row , GlobalFrequency * 2);
    const NoiseLevel3 = PerlinNoise(column, row , GlobalFrequency * 4);

    return NoiseLevel1 + (NoiseLevel2 * 0.6) + (NoiseLevel3 * 1.7);
}
//--==END==--//
//-----------//



//=================//
//=== Variables ===//
//=================//

//BREAKPOINT VALUE//
const MobileBreakpoint = 801;

//HTML element references//

//Header//
const header_nav = document.getElementById("header_nav");
const header_nav_ul = header_nav.children[1];
const hero = document.getElementById("hero");
const navItems = header_nav.getElementsByTagName("li");

//Canvasas
const Canvasas = document.getElementsByTagName("canvas");
const HeroCanvas = Canvasas[0];
const PerlinGameCanvas = Canvasas[1];

//General//
const progressbutton = document.getElementById("progressbutton");

const ApplicationArticles = document.getElementsByClassName("application_article");
const interpolation_articles = document.querySelectorAll(".interpolationtype_section article");

const applicationSection = document.getElementById("applications_of_interpolation");
const GameControlsAll = document.getElementsByClassName("game_controls");

const GameContainers = document.getElementsByClassName("game_container");

const FullScreenButton = document.getElementById("mobile_fullscreen");

//Input Fields//
const AnimationInputs = document.getElementById("animation_inputs");

//Javascript variables//
let T_HeroAnim = 0;
let T_HeroProgress = 0;
let TimeStart;

let ShowBurgerNav = false;

let UserProgress = 0; //Determines what page the user is on

let IsFullScreenMobile = false;

//Array of mainSectionIDs => Should correspond to navItems
let mainSectionIDs = ["interpolation_intro", "basic_interpolation", "advanced_interpolation", "applications_of_interpolation"];


//=================//
//=== Functions ===//
//=================//

//Math functions//
function InverseLerp(a , b, value)
{
    return (value - a) / (b - a);
}

function Lerp(a, b, t)
{
    return a + (b - a) * t;
}

function Cubic_Interpolate(p0, p1, p2, p3, t)
{
    return (1 - t) * (1 - t) * (1 - t) * p0 + 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t * p3;
}

function Inverse_Cubic_Interpolate(p0, p1, p2, p3, value)
{
    //Just do a simple Binary search to get the t-val where y = value
    let T_min = 0.0;
    let T_max = 1.0;

    let T_estimate = 0;

    for (let i = 0; i < 15; i++)
    {
        T_estimate = (T_min + T_max) / 2;

        let T_estimatedValue = Cubic_Interpolate(p0, p1, p2, p3, T_estimate);

        if (Math.abs(T_estimatedValue - value) < 0.001)
        {
            return T_estimate;            
        }
        
        if (T_estimatedValue > value )
        {
            T_max = T_estimate;
        }
        
        if (T_estimatedValue < value)
        {
            T_min = T_estimate;
        }
    }

    //console.log("Could not binary search t value in defined iterations!");
    return T_estimate;
}


//*************************//
//**** GAME CODE BELOW ****//
//*************************//

//== GENERAL GAME VARS ==//
let GameActiveStates = [false, false, false];


//==========================//
//== ANIMATIONS GAME VARS ==//
//==========================//
//GameObject vars//
const HatsuneMiku = document.getElementById("hatsune_miku");
const KnifeCount = 5;
let KnifeVariantArray;

//Animation Vars
let AnimationTimer = 0;
let AnimPreviousTimestamp;
let CanAnimate = false;

//BezierPoints//
let BezierP0 = new Vector2();
let BezierP1 = new Vector2();


//============================//
//== PERLIN NOISE GAME VARS ==//
//============================//
const canvasDimensions = [96, 54]; //Must maintain an aspect ratio of 16 x 9

//== WORLD PROPERTIES ==//
//All values are to be in a descending order
const MountainThreshold = 0.847; // => TileTraversibility = 1
const LandThreshold = -0.0293; // => TileTraversibility = 0 
const ShallowWaterThreshold = -0.824; // => TileTraversibility = -1 
//Default: DeepwaterThreshold = -1; // => TileTraversibility = -2 

let PerlinGameIsActive = false;

let OrangeTeam = [];
let PurpleTeam = [];

let UpdateThread; //This is to update the enemies

//CellNoise Levels
let CellNoiseLevels = new Array(canvasDimensions[0]);

//Init 2nd Dimension of CellNoiseLevels
for (let i = 0; i < canvasDimensions[1]; i++)
{
    CellNoiseLevels[i] = new Array(canvasDimensions[1]);
}



//== GENERAL GAME FUNCTIONS ==//
function LinkInteractiveStartButtons()
{
    applicationSection.addEventListener("click", function(event){
        if (event.target.id.substring(0, 11) == "interactive")
        {
            const buttonIndex = parseInt(event.target.id.substring(12)); //Converts the button ID to a usable index for game handling

            const GameControls = GameControlsAll[buttonIndex];

            //GENERAL BEHAVIORS//
            if (GameActiveStates[buttonIndex] === false)
            {
                //Logic for when the game is GETTING SET TO ACTIVE
                GameActiveStates[buttonIndex] = true;
                
                event.target.innerHTML = "Stop Interactive";
                event.target.classList.add("start_interactive_active");

                GameControls.style.display = "flex";
            }
            else
            {
                //Logic for when the game is GETTING SET TO INACTIVE
                GameActiveStates[buttonIndex] = false;
                
                event.target.innerHTML = "Start Interactive";
                event.target.classList.remove("start_interactive_active");

                GameControls.style.display = "none";
            }

            
                    
            //Actions AFTER STATE CHANGE//

            if (buttonIndex === 0) // Animation Game Start Button //
            {
                if (GameActiveStates[buttonIndex] === true)
                {
                    HatsuneMiku.style.display = "block";
                    GenerateKnives();
                }
                else
                {
                    CanAnimate = false; //Stop any animations


                    HatsuneMiku.style.display = "none";

                    //Clear Knives on stopping interactive
                    KnifeVariantArray = [];

                    const Knives = document.getElementsByClassName("knife");
                    KnifeVariantArray = [];

                    const TotalKnives = Knives.length;

                    for (let i = 0; i < TotalKnives; i++)
                    {
                        GameContainers[0].removeChild(Knives[0]);
                    }
                    
                }
            }

            if (buttonIndex === 1) // Perlin Noise Game Start Button //
            {
                if (GameActiveStates[buttonIndex] === false)
                {
                    //Reset Game state when game is over after simulation started
                    if (PerlinGameIsActive)
                    {
                        PerlinGameIsActive = false;
                        
                        //Clears the created EnemyUpdateThread on simulation End
                        clearInterval(UpdateThread);
                        UpdateThread = undefined;

                        LoadNewWorld();
                        SimulationBGMAudio.pause();
                        SimulationBGMAudio.currentTime = 0; //Reset audio
                    }
                }
            }
        }
    });


    //================================================//
    //== EVENT HANDLING FOR THE GAME CONTROLS BELOW ==//
    //================================================//

    //== ANIMATION GAME CONTROLS ==//
    GameControlsAll[0].addEventListener("click", function(event){
        if (event.target == GameControlsAll[0].children[0]) //First Button of set
        {
            //console.log("Starting interpolation");
            if (!CanAnimate)
            {
                CanAnimate = true; //To be set to false if any sudden animation stops is needed!
                GetUserInputs(); //Get the user input for the cubic interpolation
                requestAnimationFrame(RenderInterpolation);
                MikuWeeAudio.play();
            }

        }
        
        else if (event.target == GameControlsAll[0].children[1])
        {
            //console.log("Randomize Knives");
            if (!CanAnimate)
            {
                GenerateKnives();
            }
        }
    }); 


    //== PERLIN NOISE GAME CONTROLS ==//
    GameControlsAll[1].addEventListener("click", function(event){
        if (event.target == GameControlsAll[1].children[0]) //First Button of set
        {
            //console.log("Spawning Troops!");
            if (!PerlinGameIsActive)
            {
                SpawnOrangeAllies();
            }

        }
        
        else if (event.target == GameControlsAll[1].children[1])
        {
            //console.log("Regenerating World");
            if (!PerlinGameIsActive)
            {
                LoadNewWorld();
            }
        }

        else if (event.target == GameControlsAll[1].children[2])
        {
            //console.log("Starting simulation!");
            if (!PerlinGameIsActive && OrangeTeam.length > 0)
            {
                PerlinGameIsActive = true;
                UpdateThread = UpdateEnemies();
                SimulationBGMAudio.play();
            }
        }

    });
}

//==========================//
//== ANIMATIONS GAME VARS ==//
//==========================//
function GenerateKnives()
{
    //Remove all spawned knives first!
    const Knives = document.getElementsByClassName("knife");
    KnifeVariantArray = [];

    const TotalKnives = Knives.length;

    for (let i = 0; i < TotalKnives; i++)
    {
        GameContainers[0].removeChild(Knives[0]);
    }

    for (let i = 0; i < KnifeCount; i++)
    {
        const newKnife = document.createElement("div");
        newKnife.classList.add("knife");

        //Generate Knife Variant//
        let KnifeVariant = Math.round(Math.random() * 3);

        newKnife.style.backgroundPositionX = `${-(0.05 * window.innerWidth * KnifeVariant)}px`;
        KnifeVariantArray.push(KnifeVariant);
        
        GameContainers[0].appendChild(newKnife);

        //Generate the knife position after it is appended => once in the relative container and it hopefully has an offsetWidth
        const KnifePosition = (GameContainers[0].offsetWidth - newKnife.offsetWidth) * Math.random();

        newKnife.style.left = `${KnifePosition}px`;
    }
}


function RenderInterpolation(timeStamp)
{
    if (AnimPreviousTimestamp === undefined) //Make previousTimeStamp = current; 
    {
        AnimPreviousTimestamp = timeStamp;
    }

    const timedelta = Math.abs(timeStamp - AnimPreviousTimestamp) * 0.001;

    AnimPreviousTimestamp = timeStamp;


    const Knives = document.getElementsByClassName("knife");

    if (AnimationTimer < 1)
    {
        AnimationTimer += timedelta;
    }
    else
    {
        AnimationTimer = 1;
        ConfettiAudio.play();
        CanAnimate = false;
    }

    //************************************************//
    //*** Animation done below AFTER timer updates ***//
    //************************************************//

    //Animate Knives//
    for (let knifeIndex = 0; knifeIndex < KnifeVariantArray.length; knifeIndex++)
    {
        const KnifeMaxBottom = GameContainers[0].offsetHeight; // - Knives[knifeIndex].offsetHeight - 25;

        let AnimationTimerModifed = AnimationTimer * (1 + (0.33 * KnifeVariantArray[knifeIndex]));

        AnimationTimerModifed = Math.min(AnimationTimerModifed, 1); //Ensures Timer never exceeds 1

        Knives[knifeIndex].style.top = `${Lerp(0, KnifeMaxBottom, AnimationTimerModifed)}px`;
    }

    //Animate Hatsune miku//
    const HatsuneMikuMaxRight = GameContainers[0].offsetWidth;

    //Use X-axis to get cubic Interpolated Time back as if it were linear -> Thats why inverse cubic to AnimationTimer
    const CubicTimerInversed = Inverse_Cubic_Interpolate(0, BezierP0.X, BezierP1.X, 1, AnimationTimer);

    //Using CubicInversedTime -> interpolate with y axis the progress
    const HatsuneMikuRightProgress = Cubic_Interpolate(0, BezierP0.Y, BezierP1.Y, 1, CubicTimerInversed);

    HatsuneMiku.style.left = `${HatsuneMikuMaxRight * HatsuneMikuRightProgress}px`;

    DetectHatsuneMikuHit(); //Check hitbox overlaps after each position Update;


    if (CanAnimate)
    {
        requestAnimationFrame(RenderInterpolation);
    }
    else
    {
        //console.log("Animation ended or abruptly stopped!")
        
        //Reset Timer Variables//
        AnimationTimer = 0;
        AnimPreviousTimestamp = undefined;

        ResetObjects(); //Ensures objects are also at the starting point
    }
}

function GetUserInputs()
{
    BezierP0.X = parseFloat(AnimationInputs.children[0].value);
    BezierP0.Y = parseFloat(AnimationInputs.children[1].value);

    //Below ensures there are no invalid indexes
    if (AnimationInputs.children[0].value === "" || BezierP0.X < 0 || BezierP0.X > 1)
    {
        BezierP0.X = 0.9;
    }

    if (AnimationInputs.children[1].value === "" || BezierP0.Y < 0 || BezierP0.Y > 1)
    {
        BezierP0.Y = 0.4;
    }

    BezierP1.X = parseFloat(AnimationInputs.children[2].value);
    BezierP1.Y = parseFloat(AnimationInputs.children[3].value);

    //Below ensures there are no invalid indexes
    if (AnimationInputs.children[2].value === "" || BezierP1.X < 0 || BezierP1.X > 1)
    {
        BezierP1.X = 0.2;
    }

    if (AnimationInputs.children[3].value === "" || BezierP1.Y < 0 || BezierP1.Y > 1)
    {
        BezierP1.Y = 0.6;
    }
}


function ResetObjects()
{
    CanAnimate = false;
    HatsuneMiku.style.left = "0px";
    
    const Knives = document.getElementsByClassName("knife");

    for (const knife of Knives)
    {
        knife.style.top = "0px";
    }
}


//Below will be the code that determines if hatsune Miku got hit by a knife or not -> To be called in render function
function DetectHatsuneMikuHit()
{
    const Knives = document.getElementsByClassName("knife");

    const MikuLeftBox = HatsuneMiku.offsetLeft;
    const MikuRightBox = MikuLeftBox + HatsuneMiku.offsetWidth;

    const MikuTopBox = HatsuneMiku.offsetTop;
    const MikuBottomBox = MikuTopBox + HatsuneMiku.offsetHeight;

    let Hit = false;

    for (const knife of Knives)
    {
        let x_intersection = false;
        let y_intersection = false;

        //Knife Hitboxes are modifed to be smaller to be more fair
        const knifeLeftBox = knife.offsetLeft * 1.15;
        const knifeRightBox = knife.offsetLeft + (knife.offsetWidth * 0.85);

        const knifeTopBox = knife.offsetTop * 1.15;
        const knifeBottomBox = knife.offsetTop + (knife.offsetHeight * 0.85);

        if (MikuRightBox > knifeLeftBox && MikuLeftBox < knifeRightBox)
        {
            x_intersection = true;
        }

        if (knifeBottomBox > MikuTopBox && knifeTopBox < MikuBottomBox)
        {
            y_intersection = true;
        }

        if (x_intersection && y_intersection)
        {
            Hit = true;
            break;
        }
    }

    if (Hit)
    {
        MikuDeathAudio.play();
        ResetObjects();
    }
}


//*********************************//
//** PERLIN NOISE GAME FUNCTIONS **//
//*********************************//

function SpawnPurpleEnemies() //They can spawn anywhere except on deep water tiles!
{
    const PurpleCount = 13;

    PurpleTeam = []; //Reset Enemies before spawning them

    for (let i = 0; i < PurpleCount; i++)
    {
        
        let xSpawnPos = 0;
        let ySpawnPos = 0;

        let InvalidSpawn = false;

        do {
            xSpawnPos = Math.floor(Math.random() * 20) + 75;
            ySpawnPos = Math.floor(Math.random() * 53);

            const PurpleEnemyCount = PurpleTeam.length;
            let ValidTile = false;

            if (CellNoiseLevels[ySpawnPos][xSpawnPos] > ShallowWaterThreshold) //If the tile is a shallow water or more
            {
                ValidTile = true;
            }

            for (let j = 0; j < PurpleEnemyCount; j++)
            {


                if ( (PurpleTeam[j].PosX == xSpawnPos && PurpleTeam[j].PosY == ySpawnPos) || !ValidTile)
                {
                    InvalidSpawn = true;
                    break;
                }
                
                //Wont run after it is set to true because of break!
                InvalidSpawn = false;
            }
            

        } while (InvalidSpawn);

        PurpleTeam.push(new EntityObject(xSpawnPos, ySpawnPos, -1, 1, "circle", "rgba(117, 34, 181, 1)"));
    }
}


function SpawnOrangeAllies() //They can spawn anywhere except on deep water tiles!
{
    const OrangeCount = 17;

    OrangeTeam = []; //Reset allies before spawning them

    for (let i = 0; i < OrangeCount; i++)
    {
        
        let xSpawnPos = 0;
        let ySpawnPos = 0;

        let InvalidSpawn = false;

        do {
            xSpawnPos = Math.floor(Math.random() * 20);
            ySpawnPos = Math.floor(Math.random() * 53);

            const OrangeEnemyCount = OrangeTeam.length;
            let ValidTile = false;

            if (CellNoiseLevels[ySpawnPos][xSpawnPos] < MountainThreshold) //If the tile is a shallow water or more
            {
                ValidTile = true;
            }

            for (let j = 0; j < OrangeEnemyCount; j++)
            {


                if ( (OrangeTeam[j].PosX == xSpawnPos && OrangeTeam[j].PosY == ySpawnPos) || !ValidTile)
                {
                    InvalidSpawn = true;
                    break;
                }
                
                //Wont run after it is set to true because of break!
                InvalidSpawn = false;
            }
            

        } while (InvalidSpawn);

        OrangeTeam.push(new EntityObject(xSpawnPos, ySpawnPos, -2, 0, "triangle", "rgba(238, 139, 90, 1)"));
    }
}


function LoadNewWorld() //Just cache the noise values
{
    OrangeTeam = []; //Clear Orange team on world reset!

    InitPerlinNoise(); //Must be called Everytime the World is loaded

    //Init CellNoiseLevels! => Cache the noise generated
    for (let row = 0; row < canvasDimensions[1]; row++)
    {
        for (let column = 0; column < canvasDimensions[0]; column++)
        {
            CellNoiseLevels[row][column] = GetTerrainNoise(row, column);
        }
    }

    SpawnPurpleEnemies();
}


function UpdateEnemies()
{
    //Update the Enemies below

    const EnemyThread = setInterval(function(){
        for (const entity of OrangeTeam)
        {
            entity.Move(PurpleTeam);
        }

        for (const entity of PurpleTeam)
        {
            entity.Move(OrangeTeam);
        }

    }, 250); //Makes them update every 0.25 seconds

    return EnemyThread;
}


function UpdateGameCanvas()
{
    //canvas.offsetwidth and .offsetheight must - 2x bordersizes
    const CellWidth = (PerlinGameCanvas.offsetWidth - PerlinGameCanvas.offsetWidth * 0.002) / canvasDimensions[0];
    const CellHeight = (PerlinGameCanvas.offsetHeight - PerlinGameCanvas.offsetWidth * 0.001) / canvasDimensions[1];

    const canvasCtx = PerlinGameCanvas.getContext("2d");
    canvasCtx.lineWidth = PerlinGameCanvas.offsetWidth * 0.001;

    for (let row = 0; row < canvasDimensions[1]; row++)
    {
        for (let column = 0; column < canvasDimensions[0]; column++)
        {            
            const NoiseLevel = CellNoiseLevels[row][column];

            let Color = "rgba(49, 130, 184, 1)"; //Deep water color!

            if (NoiseLevel > ShallowWaterThreshold) //If noise level is higher than shallow water threshold, overwrite with shallow water color
            {
                Color = "rgba(88, 162, 212, 1)";
            }

            if (NoiseLevel > LandThreshold) //If the level is higher than land threshold, overwrite with land
            {
                Color = "rgba(94, 214, 126, 1)";
            }

            if (NoiseLevel > MountainThreshold) //If level is higher than mountain threshold, overwrite with mountain color
            {
                Color = "rgba(48, 79, 57, 1)";
            }

            canvasCtx.fillStyle = Color;
            let CellXOffset = (CellWidth * column) + canvasCtx.lineWidth;
            let CellYOffset = (CellHeight * row) + canvasCtx.lineWidth;
            canvasCtx.fillRect(CellXOffset, CellYOffset, CellWidth, CellHeight);
        }
    }

    //Render Terrain
    canvasCtx.stroke();

    //Render Enemies
    for (let i = 0; i < OrangeTeam.length; i++)
    {
        OrangeTeam[i].Render(canvasCtx, CellWidth, CellHeight, 2);
    }

    for (let i = 0; i < PurpleTeam.length; i++)
    {
        PurpleTeam[i].Render(canvasCtx, CellWidth, CellHeight, 2);
    }
}

//*************************//
//**** GAME CODE ABOVE ****//
//*************************//


// FULLSCREEN FUNCTION //
function OnFullScreen()
{
    if (document.documentElement.requestFullscreen)
    {
        document.documentElement.requestFullscreen();
    }
}

function OnExitFullScreen()
{
    if (document.documentElement.requestFullscreen)
    {
        document.exitFullscreen();
    }
}


// CANVAS FUNCTIONS //
function UpdateCanvasas()
{
    //Scale all canvasas to their css width and height which also clears the canvasas for me yipee
    for (let i = 0; i < Canvasas.length; i++)
    {
        Canvasas[i].width = Canvasas[i].offsetWidth;
        Canvasas[i].height = Canvasas[i].offsetHeight;
    }

    DrawHero();


    //BELOW RENDERS THE GAME CANVAS FOR PERLIN NOISE//
    if (GameActiveStates[1] === true)
    {
        UpdateGameCanvas();
    }
}


function DrawHero()
{
    const ctx = HeroCanvas.getContext("2d");

    //CanvasContext vars//
    ctx.lineWidth = HeroCanvas.width * 0.02;

    //DRAW FIRST CURVE BELOW//
    ctx.strokeStyle = "rgba(52, 25, 68, 1)";

    const FirstCurveStart = new Vector2(0, 0 + HeroCanvas.height * 0.1);
    const FirstCurveP1 = new Vector2(0 + HeroCanvas.width * 0.3, 0 + HeroCanvas.height * 0.15);
    const FirstCurveP2 = new Vector2(0 + HeroCanvas.width * 0.67, 0 + HeroCanvas.height * 0.9);
    const FirstCurveEnd = new Vector2(HeroCanvas.width, HeroCanvas.height * 0.6);

    ctx.beginPath(); // Start first line
    ctx.moveTo(FirstCurveStart.X, FirstCurveStart.Y); //Start of first curve//

    for (let T = 0; T < T_HeroProgress * 1.1; T += 0.05) //T_Progress spills by 0.3 to 
    {
        //console.log(T);
        const InterpolatedX = Cubic_Interpolate(FirstCurveStart.X, FirstCurveP1.X, FirstCurveP2.X, FirstCurveEnd.X, T);
        const InterpolatedY = Cubic_Interpolate(FirstCurveStart.Y, FirstCurveP1.Y, FirstCurveP2.Y, FirstCurveEnd.Y, T);
        ctx.lineTo(InterpolatedX, InterpolatedY);
    }

    ctx.stroke();

    //DRAW SECOND CURVE BELOW//
    ctx.strokeStyle = "rgba(42, 25, 68, 1)";

    const SecondCurveStart = new Vector2(0, 0 + HeroCanvas.height * 0.7);
    const SecondCurveP1 = new Vector2(0 + HeroCanvas.width * 0.2, 0 + HeroCanvas.height * 0.6);
    const SecondCurveP2 = new Vector2(0 + HeroCanvas.width * 0.37, 0 + HeroCanvas.height * -0.1);
    const SecondCurveEnd = new Vector2(HeroCanvas.width, HeroCanvas.height * 0.25);

    ctx.beginPath(); // Start Next line
    ctx.moveTo(SecondCurveStart.X, SecondCurveStart.Y); //Start of Second curve and so on if more//

    for (let T = 0; T < T_HeroProgress * 1.1; T += 0.05) //T_Progress spills by 0.3 to 
    {
        const InterpolatedX = Cubic_Interpolate(SecondCurveStart.X, SecondCurveP1.X, SecondCurveP2.X, SecondCurveEnd.X, T);
        const InterpolatedY = Cubic_Interpolate(SecondCurveStart.Y, SecondCurveP1.Y, SecondCurveP2.Y, SecondCurveEnd.Y, T);
        ctx.lineTo(InterpolatedX, InterpolatedY);
    }
    
    ctx.stroke();

    //DRAW THIRD CURVE BELOW//
    ctx.strokeStyle = "rgba(67, 39, 73, 1)";

    const ThirdCurveStart = new Vector2(0, 0 + HeroCanvas.height * 0.88);
    const ThirdCurveP1 = new Vector2(0 + HeroCanvas.width * 0.1, 0 + HeroCanvas.height * 1.1);
    const ThirdCurveP2 = new Vector2(0 + HeroCanvas.width * 0.57, 0 + HeroCanvas.height * 0.34);
    const ThirdCurveEnd = new Vector2(HeroCanvas.width, HeroCanvas.height * 0.97);

    ctx.beginPath(); // Start Next line
    ctx.moveTo(ThirdCurveStart.X, ThirdCurveStart.Y);

    for (let T = 0; T < T_HeroProgress * 1.1; T += 0.05) //T_Progress spills by 0.3 to 
    {
        //console.log(T);
        const InterpolatedX = Cubic_Interpolate(ThirdCurveStart.X, ThirdCurveP1.X, ThirdCurveP2.X, ThirdCurveEnd.X, T);
        const InterpolatedY = Cubic_Interpolate(ThirdCurveStart.Y, ThirdCurveP1.Y, ThirdCurveP2.Y, ThirdCurveEnd.Y, T);
        ctx.lineTo(InterpolatedX, InterpolatedY);
    }
    
    ctx.stroke();
}


function AnimateHero(TimeStamp)
{    
    const AnimationDuration = 1;
    //Start Timer
    if (TimeStart === undefined)
    {
        TimeStart = TimeStamp;
    }

    const deltaTime = (TimeStamp - TimeStart) * 0.001;
    TimeStart = TimeStamp;

    if (T_HeroAnim < AnimationDuration)
    {
        T_HeroAnim += deltaTime;
        
        //Update the Progress of the duration from 0 -> max
        T_HeroProgress =  InverseLerp(0, AnimationDuration, T_HeroAnim);

        requestAnimationFrame(AnimateHero);
    }
}



//Navigation functions//
function OnClick_progressButton()
{
    
    UserProgress++; //Increment user progress

    displaySection(mainSectionIDs[UserProgress]);
    UpdateNextButton();

    scrollTo({
        //.offsetTop gets the offset of an element's offset from its top to the top of the document
        //.offsetHeight gets the total height of the element excluding margins
        top: hero.offsetTop + hero.offsetHeight, 
        left: 0,
        behavior: "instant" //Makes it look as if the user actually scrolled up there
    });

    
}

function UpdateNextButton()
{
    if (UserProgress < 3)
    {
        progressbutton.style.display = "block";

        progressbutton.innerHTML = "Move on to " + navItems[UserProgress + 1].innerHTML;
    }
    else
    {
        progressbutton.style.display = "none";
    }
    
}

function displaySection(sectionID)
{
    const loopLength = mainSectionIDs.length;
        for (let i = 0; i < loopLength; i++ )
        {
            const mainSectionId = mainSectionIDs[i];
            const mainSection = document.getElementById(mainSectionId);

            if (mainSectionId === sectionID)
            {
                mainSection.style.display = "block";
                UserProgress = i;
                UpdateNextButton();
            }
            else
            {
                mainSection.style.display = "none";
            }

            //Update the nav button to make it selected
            if (navItems[i].id.substring(4) === sectionID)
            {
                navItems[i].style.padding = "1rem 2rem";
                navItems[i].style.backgroundColor = "var(--secondaryButtonColor)";
                navItems[i].children[0].classList.add("shinyheader");
            }
            else
            {
                navItems[i].style.padding = "1rem";
                navItems[i].style.backgroundColor = "var(--secondaryColor2)";

                if (navItems[i].children[0].classList.contains("shinyheader"))
                {
                    navItems[i].children[0].classList.remove("shinyheader");
                }
            }
        }
}

function headerNavOnClickLink(header_nav)
{
    header_nav.addEventListener("click", function(event){
        if (event.target.id)
        {
            if (event.target.id === "header_nav")
            {
                return 0;
            }

            if (event.target.id === "hamburger_icon")
            {
                //Toggle headerNav
                ShowBurgerNav = !ShowBurgerNav;

                return 0;
            }

            if (event.target.id === "mobile_fullscreen")
            {
                if (!IsFullScreenMobile)
                {
                    IsFullScreenMobile = true;
                    FullScreenButton.innerHTML = "Exit FullScreen";
                    FullScreenButton.style.backgroundColor = "var(--highlightColor)";
                    FullScreenButton.style.color = "var(--secondaryColor)";
                    FullScreenButton.style.borderColor = "var(--textColor)";
                    OnFullScreen();
                }
                else{
                    IsFullScreenMobile = false;
                    FullScreenButton.innerHTML = "Enter FullScreen";
                    FullScreenButton.style.backgroundColor = "var(--secondaryColor2)";
                    FullScreenButton.style.color = "var(--textColor)";
                    FullScreenButton.style.borderColor = "var(--highlightColor)";
                    OnExitFullScreen();
                }

                return 0;
            }

            const SectionID = event.target.id.substring(4);

            displaySection(SectionID);
        }
    });
}


function UpdateResponsiveNav()
{
    if (window.innerWidth < MobileBreakpoint)
    {
        if (ShowBurgerNav)
        {
            header_nav_ul.style.display = "flex";
        }
        else
        {
            header_nav_ul.style.display = "none";
        }
    }
    else
    {
        // Always show header_nav on tablet or larger screen
        header_nav_ul.style.display = "flex";
    }
}


//-- Scroll Progress functions --//
function LinkOnScroll_TypesArticle(article)
{
    document.addEventListener("scroll", function()
    {
        const scrollTop = window.scrollY;

        //DOM element references
        const maincontent_container = article.children[0];
        const articleImages_div = maincontent_container.children[1].children[2];
        const articleTopImage = articleImages_div.children[1];
        const articleBottomImage = articleImages_div.children[0];
        const articleFirstText = maincontent_container.children[1].children[1];
        const articleSecondText = maincontent_container.children[1].children[0];

        const articleStart = article.offsetTop + (article.offsetHeight * 0.18);
        const articleEnd = article.offsetTop + (article.offsetHeight * 0.28);
        
        let t = InverseLerp(articleStart, articleEnd, scrollTop);
        
        if (t > 1)
        {
            t = 1;
        }
        else if (t < 0)
        {
            t = 0;
        }

        //Below is to ensure the correct pair of text and images are displayed//
        articleFirstText.style.opacity = 1 - t;
        articleBottomImage.style.opacity = (1 - t);


        articleSecondText.style.opacity = t;
        articleTopImage.style.opacity = t;

        if (window.innerWidth >= MobileBreakpoint)
        {
            //Max Left value of article image div in interpolation type articles => Ensure no overspill
            const articleImgLeftMax = maincontent_container.children[1].offsetWidth - 290;

            articleImages_div.style.left = `${Lerp(0, articleImgLeftMax, t)}px`;
            articleImages_div.style.top = 0; //Resets Top if it transitioned from mobile view
        }

        else //Mobile Responsive version//
        {
            //Max Bottom value of article image div in interpolation type articles => Ensure no overspill
            const articleImgBottomMax = maincontent_container.children[1].offsetHeight * 0.4;

            // Center the images using the calculation below => Calculates distance of middle of ImagesDiv to container middle //
            const MiddlesDifference = Math.abs((articleImages_div.offsetWidth / 2) - (maincontent_container.offsetWidth / 2));
            articleImages_div.style.left = `${MiddlesDifference}px`;

            //Below changes the interpolation movement from left to right to top to bottom//
            articleImages_div.style.top = `${Lerp(0, articleImgBottomMax, t)}px`;

        }
    });
}


function Link_ApplicationArticleScroll(applicationArticle)
{
    document.addEventListener("scroll", function(){
        const scrollTop = window.scrollY;
        const GameSection = applicationArticle.children[2];

        const GameSectionStart = (GameSection.offsetTop + applicationArticle.offsetTop) * 0.9;

        if (scrollTop > GameSectionStart)
        {
            GameSection.style.opacity = 1;
        }
        else
        {
            GameSection.style.opacity = 0;
        }
    });
}


//MAIN FUNCTION//
function main()
{
    //console.log("Page Loaded! Running main code!");

    //Make the intro to interpolation section display only at the start
    displaySection("interpolation_intro");

    //Hooking Nav to OnClick function
    headerNavOnClickLink(header_nav);

    //Hooking the progressButton onclick function
    progressbutton.addEventListener("click", OnClick_progressButton);

    //Hooking articles to a scroll event listener
    for (const article of interpolation_articles)
    {
        LinkOnScroll_TypesArticle(article);
    }

    //Hooking each game section to a scroll event listener
    for (let articleIndex = 0; articleIndex < (ApplicationArticles.length - 1); articleIndex++)
    {
        Link_ApplicationArticleScroll(ApplicationArticles[articleIndex]);
    }

    //Load the perlin noise game world first!//
    LoadNewWorld();

    //Make headerNav responsive by updating its state every 0.05 seconds -> Allows for the nav to collapse and uncollapse from hamburger menu
    setInterval(UpdateResponsiveNav, 50);

    //Constantly update the canvasas
    setInterval(UpdateCanvasas, 0.01666666666);

    //Start animation for Hero after a bit of delay:
    setTimeout(function(){
        requestAnimationFrame(AnimateHero);
    }, 500);

    //Link Game button Listeners
    LinkInteractiveStartButtons();
    
}

main();