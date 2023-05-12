// ==UserScript==
// @name         Save Reddit Post to Text
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Saves reddit posts into a clean Text format for easy reading and saving to file.
// @author       You
// @match        https://www.reddit.com/r/*/comments/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// ==/UserScript==

// run addButtonToPosts every 5 seconds in case the page is lazy loading posts
setInterval(addButtonToPosts, 5000);

function find(selector) {
    return document.querySelector(selector);
}

function findAll(selector) {
    return document.querySelectorAll(selector);
}

function addButtonToPosts() {
    // console.log('Adding button to posts...');

    let posts = findAll(".RichTextJSON-root");
    for (let post of posts) {
        if (post.parentNode.querySelector(".json-button")) continue;

        let button = document.createElement("button");
        button.classList.add("json-button");
        button.innerText = "Save Post to File";
        button.onclick = function() {
            savePostToFile(post);
        };
        // add button as a sibling to the post, right above the post
        post.parentNode.insertBefore(button, post);
    }

    addStyle();
}

function savePostToFile(post) {
    // convert post to a string
    post = post.innerHTML;

    // use the pattern / class="([^"]*)"[^>]*>/g to remove all classes from the post
    var regex = / class="([^"]*)"[^>]*>/g;
    var output = post.replace(regex, ">");    
    // use regex matching /p> and replace with /p>\n
    regex = /\/p>/g;
    output = output.replace(regex, '/p>\n')
    // use regex matching <p and replace with \n<p
    regex = /<p/g;
    output = output.replace(regex, '\n<p')
    // use regex matching <p>&nbsp;</p> and replace with nothing
    regex = /<p>&nbsp;<\/p>/g;
    output = output.replace(regex, '')

    var blob = new Blob([output], {type: "text/plain;charset=utf-8"});
    save(blob, "post.txt");
}

function save(blob, filename) {
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    link.remove();
}

function addStyle()
{
    if (find("#bane-save-button")) return;

    var style = document.createElement('style');
    style.id = "bane-save-button";
    style.type = 'text/css';
    style.innerHTML = `
        .json-button {
            border: 1px solid #C8CBCD;
            color: #C8CBCD;
            padding: 1em;
            margin: 0 auto;
            margin-bottom: 1em;
            display: block;
            border-radius: 2em;

            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }
        .json-button:hover {
            background-color: #C8CBCD;
            color: #000;
        }
    `
    document.getElementsByTagName('head')[0].appendChild(style);
}