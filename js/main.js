'use strict'
let words = [];
const audioYes  = new Audio('./audio/yes.mp3');
const audioBeep = new Audio('./audio/bonus.mp3');
const answer = rightAnswer();
let card;
let cardNumer = 0;

/* wait load DOM of page */

document.addEventListener("DOMContentLoaded", function(e) {
    readIniFile(window.location.href + "/settings.ini"); // inside this function start init();
});


function init() {
    /* get Element on Page */
    const wordsBlock = document.getElementById("words");
    const positive = document.getElementById("positive");
    const negative = document.getElementById("negative");
    /* in html attribure data-sign = "plus" */
    positive.dataset.sign = 'plus';
    negative.dataset.sign = 'minus';
    positive.addEventListener("click", checkWord);
    negative.addEventListener("click", checkWord);
    positive.addEventListener("touch", checkWord);
    negative.addEventListener("touch", checkWord);
    /* create drag & drop system */
    card = document.createElement("div");
    card.classList.add("card");

    cardNumer = 0;
    addDragDrop(positive);
    addDragDrop(negative);

    card.setAttribute("id", "id1");
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", dragstart_handler);
    wordsBlock.appendChild(card);
    /* add first word on Card */
    card.innerText = words[cardNumer].word;
    card.dataset.sign = words[cardNumer].sign;
}

/* Generator first 3 sound one, then another sound */
function* rightAnswer() {
    for (let i = 0; i < 3; i++) {
        audioYes.currentTime = 0;
        audioYes.play();
        nextWord();
        yield i;    
    }
    while (true) {
        audioBeep.currentTime = 0;
        audioBeep.play();
        nextWord(); 
        yield 0;
    }
}

/* open next card */
function nextWord() {
    cardNumer++;
    if (cardNumer >= words.length) {
        card.remove();
        alert("Победа");
        return;
    }
    card.innerText = words[cardNumer].word;
    card.dataset.sign = words[cardNumer].sign;
}


/* service drag & drop functions */
function addDragDrop (element) {
    element.addEventListener("drop", event => {drop_handler(event)})
    element.addEventListener("dragover", event => {dragover_handler(event)})
}


function dragstart_handler(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.dropEffect = "copy";
}


function dragover_handler(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
}


function drop_handler(e) {
    e.preventDefault();
    checkWord(e);      
}


function checkWord(event) {
    const container = event.target;
    const card = document.getElementById("id1");

    if (card.parentElement === container.parentElement) {
        return false;
    }
    if (card.dataset.sign === container.dataset.sign ) {
        answer.next();
    }  
}

function readIniFile(file)
{
    let result = [];
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                let text = parseINIString(rawFile.responseText);
                if (!text.Words) return null;

                for (let word in text.Words) {
                    result.push({"word":word,"sign":text.Words[word]});
                }
                words = result;
                init();

            }else {
                console.error("can't load or read ini file ");
            }
        }
    }
    rawFile.send();
}

function parseINIString(data){
    var regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach(function(line){
        if(regex.comment.test(line)){
            return;
        }else if(regex.param.test(line)){
            var match = line.match(regex.param);
            if(section){
                value[section][match[1]] = match[2];
            }else{
                value[match[1]] = match[2];
            }
        }else if(regex.section.test(line)){
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
        }else if(line.length == 0 && section){
            section = null;
        };
    });
    return value;
}