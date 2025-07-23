/*jshint esversion: 6 */ //=> Used to allow arrow syntax
//=== Variables ===//

//BREAKPOINT VALUES//
const MobileBreakpoint = 801;

//HTML element references//
const header_nav = document.getElementById("header_nav");
const header_nav_ul = header_nav.children[1];
const hero = document.getElementById("hero");
const navItems = header_nav.getElementsByTagName("li");

const progressbutton = document.getElementById("progressbutton");

const ApplicationArticles = document.getElementsByClassName("application_article");
const interpolation_articles = document.getElementsByClassName("articles");

//Javascript variables//
let ShowBurgerNav = false;

let UserProgress = 0; //Determines what page the user is on

function IntersectObserveCallBack(entries) {
    for (const entry of entries)
    {
        const entryTargetID_tofunfact = `${entry.target.id}_ff`;

        if (entry.isIntersecting)
        {
            for (const funfact of interpolation_funfacts)
            {
                //Found matching ID
                if (funfact.id === entryTargetID_tofunfact)
                {
                    funfact.style.opacity = 1;
                }
                else
                {
                    funfact.style.opacity = 0;
                }
            }
        }
        else
        {
            for (const funfact of interpolation_funfacts)
            {
                //Hide corresponding fun fact
                if (funfact.id === entryTargetID_tofunfact)
                {
                    funfact.style.opacity = 0;
                }
            }
        }
    }
};

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
    return a + (b - a) * t
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

        const articleStart = article.offsetTop + (article.offsetHeight * 0.25); //Lower start height by 25%
        const articleEnd = article.offsetTop + (article.offsetHeight * 0.4) //Raise End height by 60%
        
        let t = InverseLerp(articleStart, articleEnd, scrollTop);


        //DOM element references
        const articleImages_div = article.children[1].children[2];
        const articleTopImage = articleImages_div.children[1];
        const articleBottomImage = articleImages_div.children[0];
        const articleRightText = article.children[1].children[1];
        const articleLeftText = article.children[1].children[0];

        //Max Left value of article image div in interpolation type articles
        const articleImgLeftMax = articleRightText.offsetLeft - 5;

        
        if (t > 1)
        {
            t = 1;
        }
        else if (t < 0)
        {
            t = 0;
        }

        articleRightText.style.opacity = 1 - t;
        articleLeftText.style.opacity = t;

        articleImages_div.style.left = `${Lerp(0, articleImgLeftMax, t)}px`;
        articleTopImage.style.opacity = t;
        articleBottomImage.style.opacity = (1 - t);


    })
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
    console.log("Page Loaded! Running main code!");

    //Make the intro to interpolation section display only at the start
    displaySection("interpolation_intro");

    displaySection("applications_of_interpolation"); //TEMPORARY CODE

    //Hooking Nav to OnClick function
    headerNavOnClickLink(header_nav);

    //Hooking the progressButton onclick function
    progressbutton.addEventListener("click", OnClick_progressButton);

    //Hooking articles to a scroll event listener
    for (const articles of interpolation_articles)
    {
        for (const article of articles.children)
        {
            LinkOnScroll_TypesArticle(article);
        }
    }

    //Hooking each game section to a scroll event listener
    for (const applicationArticle of ApplicationArticles)
    {
        Link_ApplicationArticleScroll(applicationArticle)
    }

    //Make headerNav responsive by updating its state every 0.05 seconds
    setInterval(UpdateResponsiveNav, 50);
}

main();