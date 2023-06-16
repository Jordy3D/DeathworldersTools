// ==UserScript==
// @name         Deathworlders Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.21.4
// @description  Modifications to the Deathworlders web novel
// @author       Bane
// @match        https://deathworlders.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deathworlders.com
// @grant        none
// ==/UserScript==

// ==Changelog==
//
// 0.1      - Initial version
//              - Adds cover image to the top of the article
// 0.2      - Added code to support conversation styling
// 0.3      - Added extra CSS to the script rather than loading it separately
// 0.4      - Added a settings menu to enable/disable features
//              - Saves settings to localstorage
//              - Added a konami code to reset settings
// 0.5      - Added a fix for the conversation styling failing on certain instances
//          - Added a way for new settings to be added without overwriting old settings (hopefully)
//          - Added a setting for adding a cover image
//          - Organized settings into categories
//          - Fixed a bug where non-paragraph elements were being justified
// 0.6      - Added a setting for fancy chat log
//              - Setting for keeping the ++NAME++ flavour in the chat log
//              - Setting for rounded system messages
//          - Rewrote the settings code to be more efficient
//          - Added Light Mode support
// 0.7      - Added a check for new versions of the script
//          - Redesigned the settings menu
//          - Fixed some fancy chat log items not being detected
//          - Fixed some fancy chat log items being detected incorrectly
//          - Fixed an issue with justification justifying incorrect elements
// 0.8      - Older Chapters now have the same styling as newer chapters
//              - Fixed inconsistency with the chat log styling thanks to + being changed to ++ later
//              - Fixed inconsistency with chat log system messages thanks to the system message being changed to a different format later
//              - The old Date Point marker now breaks after the date, thanks Guvendruduvundraguvnegrugnuvenderelgureg-ugunduvug Guvnuragnaguvendrugun for making this necessary
//          - Fixed a bug with chat log styling not working due to my own stupidity
// 0.9      - Added a table of contents
//              - Added a setting to enable/disable the table of contents from spawning
//              - Colour-coded the table of contents based on the chapter's "Book"
//              - Style-coded the table of contents based on the type of chapter
//              - At time of writing, my table of contents file is incomplete, so it will be updated in the future
//          - Fixed a bug with the script running on the home page
//          - Fixed some fancy chat log items not being detected
// 0.10     - Updated the Table of Contents a bunch
//              - More chapters are listed, including off-site ones that are needed for context/characters/events/etc
//              - Added new styling to chapters
//              - Added red text/borders to warn of off-site links
// 0.11     - Added a tooltip warning of off-site links
//          - Added a link to the full reading list on Reddit
//          - Added a setting to highlight links in text
//          - Fixed incorrect default setting on Keep ++ setting
//          - Minor fixes related to this update
// 0.12     - Laid groundwork for displaying non-Deathworlders chapters on Deathworlders.com via URL hijacking
//              - This already works at https://deathworlders.com/books/#xiu1! (at time of writing, URL subject to change)
//          - Unique colours for Good Training The Champions and Salvage
//          - Shift to hosting Deathworlders data on a new repo
//          - Notes now supported on tooltips
//          - Bug fixes related to hijacking
//          - Fixed bug incorrecting detecting the chapter type when the word "part" is in the chapter title
//          - Fixed a bug where the tooltip wouldn't be at the right position when the page was scrolled
//          - Code cleanup and modification of backend data
// 0.13     - Minor in comparison, added new elements to better match the original site
//              - Added a button above the chapter (replacing the EPUB button with a link to the source)
//              - Added a Date and Time to Read element below the chapter title
// 0.14     - Made chapter replacement automatic based on the deathworlderstoc.json file
//              - This means that the script shouldn't need regular updates to keep up with the replacement chapters
//          - Made the page auto-refresh on URL change to allow for the hijacking to work more naturally
// 0.15     - Added Part support to the hijacked chapters
//          - Fixed a bug where loaded hijacked chapters would incorrectly display content in < and > (which is used for HTML tags, but they also use it for dialogue """style""")
// 0.16     - Replaced off-site links with hijacked links where available in the Table of Contents
//          - Fixed a bug failing to detect hijacked chapters as active
//          - Fixed a bug causing hijacked chapters to dupe based on the number of alt chapters after it
// 0.17     - Actually fixed the dupe bug by rewriting the hijacking code, should be a lot more stable now
// 0.18     - Added a link to the Deathworlders Tweaks GitHub repo
//          - Tweaked width value on sidebars
// 0.19     - Added tooltips to some of the settings
//          - Added a new alternative text style for easier reading (still broken at times)
//          - Removed the Fix Broken HRs setting, as it was the fault of the script (and so became default)
//          - Fixed an issue with tooltip positioning horizontally
// 0.20     - Removed the need for # in the URL for hijacking, making it appear more natural
//          - Made Source button open in a new tab
// 0.21     - Added a setting to replace instances of __ with a line break
//          - Added tooltips to the settings menu items, explaining what they do and if they require a refresh
//          - Added support for code blocks in the hijacked chapters
//          - Fixed an issue with justification not working when the cover is disabled
//          - Fixed an issue with justification applying to conversation elements
//          - Hid the alternate text style as it was being a pain
//          - Reworked the code massively to stop looking for things repeatedly
//
// ==/Changelog==

// ===== Variables =====

var conversationScan = 3;

var tocJSON = null;

// ===== End Variables =====

// ===== Settings =====

var defaultSettings = [];
defaultSettings.push({ name: 'replaceSectionEndHeaders', value: true, fancyText: 'Replace Section End Headers', tag: 'Fix', tooltip: 'Adds an underline below section end headers (some, anyway). \nUpdates live.' });
defaultSettings.push({ name: 'darkScrollbars', value: true, fancyText: 'Dark Scrollbar', tag: 'Style', tooltip: 'Makes the scrollbar dark. \nUpdates live.' });
defaultSettings.push({ name: 'fixCodeBlocks', value: true, fancyText: 'Fix Code Blocks', tag: 'Fix', tooltip: 'Stops code blocks from needing to be scrolled horizontally. \nUpdates live.' });
defaultSettings.push({ name: 'fixBlockquotes', value: true, fancyText: 'Fix Blockquotes', tag: 'Fix', tooltip: 'Makes blockquote quote marks appear correctly. \nUpdates live.' });
defaultSettings.push({ name: 'fancySMS', value: true, fancyText: 'Fancy SMS', tag: 'Style', tooltip: 'Makes certain conversations look like SMS messages. \nUpdates live, but messes with HTML.' });
defaultSettings.push({ name: 'fancySMSBubbles', value: true, fancyText: 'Fancy SMS Bubbles', tag: 'Style', tooltip: 'Adds little bubbles to the SMS messages.\nUpdates live.' });
defaultSettings.push({ name: 'justifyParagraphs', value: true, fancyText: 'Justify Paragraphs', tag: 'Style', tooltip: 'Justifies paragraphs.\nUpdates live.' });
defaultSettings.push({ name: 'addCover', value: true, fancyText: 'Add Cover', tag: 'Function', tooltip: 'Adds a cover to the top of the page, if one exists for the chapter.\nUpdates live.' });
defaultSettings.push({ name: 'fancyChatLog', value: true, fancyText: 'Fancy Chat Log', tag: 'Style', tooltip: 'Makes certain conversations look more like an IRC chat log.\nUpdates live, but messes with HTML.' });
defaultSettings.push({ name: 'fancyChatLogKeep++', value: false, fancyText: 'Fancy Chat Log Keep ++', tag: 'Style', tooltip: 'Replaces the ++ formatting for user names.\nUpdates live' });
defaultSettings.push({ name: 'fancyChatLogRoundedSystem', value: true, fancyText: 'Fancy Chat Log Rounded System', tag: 'Style', tooltip: 'Rounds the system messages.\nUpdates live.' });
defaultSettings.push({ name: 'tableOfContents', value: true, fancyText: 'Table of Contents', tag: 'Function', tooltip: 'Adds a table of contents to the page.\Requires a page refresh.' });
defaultSettings.push({ name: 'highlightLinks', value: true, fancyText: 'Highlight Links in Text', tag: 'Style', tooltip: 'Highlights links in the text.\nUpdates live.' });
// defaultSettings.push({ name: 'useAltLinks', value: true, fancyText: 'Use Alt Links (Hijack /books/)', tag: 'Function' });
// defaultSettings.push({ name: 'alternateTextMode', value: false, fancyText: 'Alternate Text Mode', tag: 'Style', tooltip: 'Attempts to make the text more readable for some people.' });
defaultSettings.push({ name: 'fixUnderscoreBreaks', value: true, fancyText: 'Fix Underscore Breaks', tag: 'Fix', tooltip: 'Replace __ with a proper section-breaking line.\nRequires a page refresh.' });
// defaultSettings.push({ name: 'testSetting', value: false, fancyText: 'Test Setting', tag: 'Test', tooltip: 'Test tooltip.' });

var settings = [];

// konami code
var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiCodePosition = 0;
document.addEventListener('keydown', function (e) {
    if (e.keyCode === konamiCode[konamiCodePosition++]) {
        if (konamiCodePosition === konamiCode.length) {
            konamiCodePosition = 0;
            // delete settings
            localStorage.removeItem('bane-deathworlders-settings');
            // reload page
            window.location.reload();
        }
    } else {
        konamiCodePosition = 0;
    }
});

// ===== End Settings =====

initialize();

setInterval(function () {
    // if the URL is just https://deathworlders.com, don't do anything
    if (window.location.href == 'https://deathworlders.com/') return;

    addCover();
}, 200);

function reloadOnURLChange() {
    var currentURL = window.location.href;
    setInterval(function () {
        if (currentURL != window.location.href) {
            currentURL = window.location.href;
            window.location.reload();
        }
    }, 1000);
}

function initialize() {
    // print Deathworlders Tweaks in large letters
    var textCSSMain = 'font-size: 30px; font-weight: bold; text-shadow: -3px 0px 0px rgba(255, 0, 0, 1),3px 0px 0px rgba(8, 0, 255, 1);';
    var textCSSSub = 'font-size: 15px; font-weight: bold;';
    console.log(`%cDeathworlders Tweaks%c${GM_info.script.version}\nby Bane`, textCSSMain, textCSSSub);

    checkNewVersion();
    checkNewSettings();

    spawnSettings();

    var url = 'https://raw.githubusercontent.com/Jordy3D/DeathworldersTools/main/deathworlderstoc.json';
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'json';
    request.send();

    // when the JSON is loaded, store the table of contents for use elsewhere then run functions that may need it
    request.onload = function () {
        tocJSON = request.response;

        // if the setting with the name tableOfContents is true, spawn the table of contents
        if (settings.find(x => x.name === 'tableOfContents').value)
            spawnTableofContents();

        addToolTipToWhereItNeedsToGo();

        reloadOnURLChange();

        hijackChapter();

        setConversationElement();
        setChatLogElement();

        everyParagraphShould();
    }
}

function checkNewVersion() {
    console.log('Checking for new version of Deathworlders Tweaks');

    // check the userscript file for the latest version
    var url = 'https://raw.githubusercontent.com/Jordy3D/DeathworldersTweaks/main/userscript/Deathworlders.user.js'
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = request.responseText;
            var version = response.match(/@version\s+([^\s]+)/)[1];
            version = version.replace(/\./g, '');
            version = parseInt(version);

            var curVersion = GM_info.script.version;
            curVersion = curVersion.replace(/\./g, '');
            curVersion = parseInt(curVersion);

            console.log(`Current version: ${curVersion} | Remote version: ${version}`);

            if (version > curVersion) {
                // add a new ::after element to the h1 element in .bane-settings, and make it look like the Minecraft splash text
                var settingsDiv = document.querySelector('.bane-settings');
                settingsDiv.classList.add('new');

                // add a link to the bottom of the settings menu to open https://jordy3d.github.io/files/userscripts
                var sourceLink = document.createElement('a');
                sourceLink.classList.add('not-button');
                sourceLink.href = 'https://jordy3d.github.io/userscripts';
                sourceLink.target = '_blank';
                sourceLink.innerHTML = 'Download the latest version here';
                settingsDiv.appendChild(sourceLink);

                // create a new style
                var style = document.createElement('style');
                style.id = 'bane-new-version-style';
                style.innerHTML = `
                    /* Update Animations */
                    .bane-settings.new
                  {
                        animation: ping 1s infinite;
                        opacity: 1;
                    }

                    @keyframes ping
                  {
                        0% { outline: 2px solid #d09242; }
                        50% { outline: 5px solid #d09242; }
                        100% { outline: 2px solid #d09242; }
                    }

                    .bane-settings.new h1 { position: relative; }
                    .bane-settings.new h1::after
                  {
                        content: "New version available!";
                        position: absolute;
                        display: block;

                        font-size: 10pt;
                        font-weight: bold;

                        right: -50px;
                        bottom: 0;

                        opacity: 0;
                        transition: opacity 200ms ease-in-out;

                        transform: rotate(-30deg);

                        animation: updateSplash 1s infinite;

                        text-shadow: 0 0 5px #222222, 0 0 5px #222222;
                    }
                    .bane-settings.new:hover h1::after { opacity: 1; }

                    body:not(.inverted) .bane-settings.new h1::after { text-shadow: 0 0 5px #FFFFFF, 0 0 5px #FFFFFF; }

                    @keyframes updateSplash {
                        0% { transform: scale(1) rotate(-25deg); }
                        50% { transform: scale(1) rotate(-15deg); }
                        100% { transform: scale(1) rotate(-25deg); }
                    }

                    /* Update Button */
                    .bane-settings:not(.new) .not-button { display: none; }

                    .not-button
                  {
                        text-align: center;
                        display: block;

                        padding: 1em;
                        margin-top: auto;
                        border: 3px solid #D09242;
                        border-radius: 5em;

                        transition: all 100ms ease-in-out;
                    }

                    .not-button:hover
                  {
                        background: #D09242;
                        color: #222222 !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    request.send();
}

// ===== SETTINGS FUNCTIONS =====
function spawnSettings() {
    var settingsDiv = document.createElement('div');
    settingsDiv.classList.add('bane-sidebar');
    settingsDiv.classList.add('bane-settings');
    document.body.appendChild(settingsDiv);

    let heading = document.createElement('h1');
    heading.innerText = 'Deathworlders Tweaks';
    // set href to https://github.com/Jordy3D/DeathworldersTweaks
    heading.innerHTML = `<a href="https://github.com/Jordy3D/DeathworldersTweaks" target="_blank">${heading.innerHTML}</a>`;
    heading.classList.add('bane-settings-title');
    settingsDiv.appendChild(heading);

    let subtitle = document.createElement('div');
    subtitle.classList.add('bane-settings-subtitle');
    settingsDiv.appendChild(subtitle);

    let version = document.createElement('h4');
    version.innerText = `v${GM_info.script.version}`;
    subtitle.appendChild(version);

    let author = document.createElement('h4');
    author.innerText = 'by Bane';
    subtitle.appendChild(author);

    addHR(settingsDiv);

    // get a list of all unique tags
    var tags = [];
    for (var setting in settings) {
        if (!tags.includes(settings[setting].tag))
            tags.push(settings[setting].tag);
    }

    // loop through settings and add them to the div
    for (var tag in tags) {
        var tagHeader = document.createElement('h3');
        tagHeader.classList.add('bane-setting-tag');
        tagHeader.innerHTML = tags[tag];
        settingsDiv.appendChild(tagHeader);

        var hr = document.createElement('hr');
        settingsDiv.appendChild(hr);

        for (var setting in settings) {
            if (settings[setting].tag != tags[tag])
                continue;

            var settingDiv = document.createElement('div');
            settingDiv.classList.add('bane-setting');
            settingDiv.innerHTML = `
                <label for="bane-setting-${setting}">${settings[setting].fancyText}</label>
                <input type="checkbox" id="bane-setting-${setting}" ${settings[setting].value ? 'checked' : ''}>
                <label for="bane-setting-${setting}">switch</label>
            `;

            if (settings[setting].tooltip)
                settingDiv.setAttribute('data-tooltip', settings[setting].tooltip);

            settingDiv.querySelector(`#bane-setting-${setting}`).addEventListener('change', updateSettings);

            settingsDiv.appendChild(settingDiv);
        }
    }
    document.body.appendChild(settingsDiv);

    // add style
    var style = document.createElement('style');
    style.id = 'bane-settings-style';
    style.innerHTML = `
        .bane-sidebar
        {
            background: #222222;

            height: 100vh;
            min-width: 370px;
            width: 19vw;

            position: fixed;
            top: 0;

            display: flex;
            flex-direction: column;

            padding: 1em;
            box-sizing: border-box;
        }

        .bane-sidebar hr { width: 100%; }

        .bane-settings
        {
            border-right: 4px solid #CECECE;

            left: 0;

            transform: translatex(calc(20px - 100%));
            opacity: 0.1;

            transition: all 100ms ease-in-out;
        }
        body:not(.inverted) .bane-sidebar { background: #ffffff !important; }

        .bane-settings-subtitle
        {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }

        .bane-settings h1 { text-align: center; }

        .bane-settings h1,
        .bane-settings h4,
        .bane-setting-tag
        {
            margin: 0;
        }

        .bane-settings hr { width: 100%; }

        .bane-settings:hover
        {
            opacity: 1;
            transform: translatex(0);
            transition: all 300ms ease-in-out;
        }

        .bane-setting
        {
            display: flex;
            gap: 5px;
            justify-content: flex-end;
            margin-bottom: 5px;
        }

        .bane-setting-tag
        {
            margin-top: 1em;
            text-align: center;
        }

        /* Modifed based on https://codepen.io/mburnette/pen/LxNxNg */
        input[type=checkbox]{
            height: 0;
            width: 0;
            visibility: hidden;
        }

        label:last-child {
            cursor: pointer;
            text-indent: -9999px;
            width: 40px;
            height: 20px;
            background: grey;
            display: block;
            border-radius: 100px;
            position: relative;
        }

        label:last-child:after {
            content: '';
            position: absolute;
            top: 3px;
            left: 5px;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 90px;
            transition: 0.3s;
        }

        input:checked + label:last-child { background: #D09242; }

        input:checked + label:last-child:after {
            left: calc(100% - 5px);
            transform: translateX(-100%);
        }

        label:last-child:active:after { width: 15px; }
    `;

    document.head.appendChild(style);

    loadCSS();
}

function updateSettings() {
    for (var setting in settings) {
        var checkbox = document.querySelector(`#bane-setting-${setting}`);
        settings[setting].value = checkbox.checked;
    }

    // save settings
    localStorage.setItem('bane-deathworlders-settings', JSON.stringify(settings));

    loadCSS();
}

function checkNewSettings() {
    settings = defaultSettings;

    // check if settings exist in localstorage
    if (localStorage.getItem('bane-deathworlders-settings') != null) {
        // load settings from localstorage
        var loadedSettings = JSON.parse(localStorage.getItem('bane-deathworlders-settings'));

        // loop through loaded settings and update the default settings
        for (var setting in loadedSettings) {
            for (var defaultSetting in defaultSettings) {
                if (defaultSettings[defaultSetting].name == loadedSettings[setting].name) {
                    defaultSettings[defaultSetting].value = loadedSettings[setting].value;
                }
            }
        }
    } else {
        // save default settings to localstorage
        localStorage.setItem('bane-deathworlders-settings', JSON.stringify(defaultSettings));
    }
}

// ===== FEATURES =====

function addCover() {

    if (settings.find(x => x.name == 'addCover').value == false) {
        // find .bane-cover and remove it if it exists
        var cover = document.querySelector('.bane-cover');
        if (cover)
            cover.remove();

        return;
    }
    else {
        var cover = document.querySelector('.bane-cover');
        if (cover) return;

        // look for .story-specific-images
        var storySpecificImages = document.querySelector('.story-specific-images');
        if (!storySpecificImages) return;

        // look for .download-epub-cover-img.wider and copy it, placing it after the article's h1
        var cover = document.querySelector('.download-epub-cover-img.wider');
        if (!cover) return;

        // get the article
        var article = document.querySelector('article');
        article.classList.add('bane-article');

        // clone the cover and insert it after the h1
        var coverCopy = cover.cloneNode(true);
        // add onerror="this.style.display='none'" to coverCopy
        coverCopy.setAttribute('onerror', "this.style.display='none'");

        var h1 = article.querySelector('h1');
        h1.parentNode.insertBefore(coverCopy, h1.nextSibling);

        // add a class to the cover so we can style it
        coverCopy.classList.add('bane-cover');
    }

    // add style
    if (document.querySelector('#bane-cover-style')) return;

    var style = document.createElement('style');
    style.id = 'bane-cover-style';
    style.innerHTML = `
        .bane-cover {
            height: auto;
            width: 500px;
            margin: 0 auto;
            box-shadow: none;
            border-radius: 0.5em;
        }
    `;
    document.head.appendChild(style);
}

function everyParagraphShould() {
    forEachParagraph(function (paragraph) {
        forceBreaks(paragraph);

        if (settings.find(x => x.name === 'fixUnderscoreBreaks').value)
            replaceUnderscoreBreaks(paragraph);

        // if (settings.find(x => x.name === 'alternateTextMode').value)
        //     halfbold(paragraph);
    });
    // this one is separate because it needs to be done after all the others
    forEachParagraph(function (paragraph) {
        // if the paragraph is empty, remove it
        if (paragraph.innerHTML.trim() == '')
            paragraph.remove();
    });
}

function setConversationElement() {
    // if no article is found, return
    var article = document.querySelector('main>article');
    if (!article) return;

    // find all .p tags that only contain em tags and/or br tags, and not their own text, and are not just <p></p>
    forEachParagraph(function (pTag) {
        var emTags = pTag.querySelectorAll('em');
        var brTags = pTag.querySelectorAll('br');

        // pTag.classList.add(`em-${emTags.length}`);
        // pTag.classList.add(`br-${brTags.length * 2}`)
        // pTag.classList.add(`p-${pTag.childNodes.length}`);

        if (emTags.length + (brTags.length * 2) == pTag.childNodes.length || (emTags.length == 0 && brTags.length > 0)) {
            // if pTag doesn't contain strong
            if (pTag.querySelectorAll('strong').length == 0)
                pTag.classList.add('consider');
        }

        // if pTag's html starts with <code>, add .coarse
        if (pTag.innerHTML.trim().startsWith('<code>'))
        {
            pTag.classList.add('consider');
            pTag.classList.add('coarse');
        }
    });

    forEachQuery('div[style="text-align: right"]', function (div) {
        div.classList.add('conversation');
        div.classList.add('right');

        // if div's html starts with <code>, add .coarse
        if (div.innerHTML.trim().startsWith('<code>'))
        {
            div.classList.add('coarse');
        }
    });

    // search through every child of the main>article and remove every .conversation that isn't within 3 of another .conversation
    // THIS MAY BE REVISEABLE TO BE MORE EFFICIENT
    var article = document.querySelector('main>article');
    var children = [];
    // set children to all immediate children of article
    for (var i = 0; i < article.childNodes.length; i++) {
        var child = article.childNodes[i];
        if (child.nodeType == 1)
            children.push(child);
    }

    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.classList && child.classList.contains('consider')) {
            var found = false;
            found = findClassWithinDistance(children, i, 3, 'conversation');

            // if the child has .coarse, consider it found
            if (child.classList.contains('coarse'))
                found = true;

            if (found) {
                child.classList.add('conversation');
                child.classList.add('left');
            }
        }
    }

    // go through every .conversation.right and merge it with the previous .conversation.right if it starts with a lowercase letter
    forEachQuery('.conversation.right', function (conversation) {
        // get the previous element
        var previous = conversation.previousElementSibling;

        // if this or the previous element has the coarse class, don't merge
        if (conversation.classList.contains('coarse') || (previous && previous.classList.contains('coarse'))) return;

        if (!previous) return;
        if (previous.nodeType != 1) return;
        if (previous.classList.contains('conversation') == false) return;

        var previousText = previous.innerText;
        var conversationText = conversation.innerText;

        if (conversationText[0] == conversationText[0].toLowerCase()) {
            // merge the two conversations
            previous.innerText = `${previousText} ${conversationText}`;
            conversation.remove();
        }
    });

    // find every <br> that is immediately after a .conversation and remove it
    forEachQuery('.conversation+br', function (br) {
        br.remove();
    });

    // find every <p></p> and remove it
    forEachQuery('p', function (p) {
        if (p.innerText == '')
            p.remove();
    });

    // remove all .consider
    forEachQuery('.consider', function (consider) {
        consider.classList.remove('consider');

        // 
    });

    // for all .coarse, remove the code element and just have the text in the paragraph
    forEachQuery('.coarse', function (coarse) {
        var code = coarse.querySelector('code');
        var text = code.innerText;
        coarse.innerHTML = text;
    });
}

function setChatLogElement() {
    // if no article is found, return
    var article = document.querySelector('main>article');
    if (!article) return;

    // find all the paragraphs and do things to them
    forEachParagraph(function (pTag) {
        createChatLogs(pTag);
        removePlusandColonFromChatLog(pTag);
        splitChatLogIntoSpan(pTag);
        addCLStoSystemMessage(pTag);
        addCLStoAllCapsStrong(pTag);
        addCLSifQualified(pTag);
    });
    forEachParagraph(function (pTag, pTags) {
        // this one has to be separate because it needs everything else to be done first
        removeLoneCLS(pTag, pTags);
    });

    function createChatLogs(p) {
        var strongTags = p.querySelectorAll('strong');
        if (strongTags.length == 0) return;

        // get the first child
        var firstChild = p.childNodes[0];
        if (p.innerText.toUpperCase().includes('END CHAPTER') || p.innerText.toUpperCase().includes('END OF PART')) return;

        // if the first child is a strong and the text starts with ++, add the class chat-log
        if (firstChild.tagName == 'STRONG'
            && (firstChild.innerText.startsWith('++') || firstChild.innerText.startsWith('+'))) {
            // if the text doesn't contain "END CHAPTER", add the class "chat-log
            p.classList.add('chat-log');
        }
    }

    function removePlusandColonFromChatLog(p) {
        if (!p.classList.contains('chat-log')) return;

        var firstChild = p.childNodes[0];

        var name = firstChild.innerText;
        name = name.replace('++', '');
        name = name.replace('+', '');
        name = name.replace('++:', '');
        name = name.replace('+:', '');

        firstChild.innerText = name;
        firstChild.classList.add('chat-log-name');
    }

    function splitChatLogIntoSpan(p) {
        if (!p.classList.contains('chat-log')) return;

        var span = document.createElement('span');
        span.classList.add('chat-log-text');

        while (p.childNodes.length > 1) {
            var child = p.childNodes[1];
            span.appendChild(child);
        }

        p.appendChild(span);
    }

    function addCLStoSystemMessage(p) {
        var strongTags = p.querySelectorAll('strong');
        if (strongTags.length == 0) return;

        // get the first child
        var firstChild = p.childNodes[0];
        // if the first child is a strong that starts with SYSTEM or ERROR, add the class chat-log-system
        if (firstChild.tagName == 'STRONG' && (firstChild.innerText.startsWith('SYSTEM') || firstChild.innerText.startsWith('ERROR')))
            p.classList.add('chat-log-system');

        for (var j = 0; j < strongTags.length; j++) {
            var strongTag = strongTags[j];
            if (strongTag.innerText.startsWith('SYSTEM') ||
                strongTag.innerText.startsWith('ERROR') ||
                strongTag.innerText.toUpperCase().startsWith('SYSTEM NOTIFICATION') ||
                strongTag.innerText.toUpperCase().startsWith('EMOTE CHANNEL')) {
                p.classList.add('chat-log-system');

                // replace SYSTEM:: with SYSTEM:
                strongTag.innerText = strongTag.innerText.replace('::', ':');

                // replace ERROR - with ERROR:
                strongTag.innerText = strongTag.innerText.replace(' - ', ': ');
            }
        }
    }

    function addCLStoAllCapsStrong(p) {
        if (p.classList.contains('chat-log')) return;

        var strongTags = p.querySelectorAll('strong');
        if (strongTags.length == 0) return;

        var textContent = p.innerText;
        var textContentNormalised = textContent.toUpperCase();

        // if text is only numbers, skip
        if (/^\d+$/.test(textContentNormalised)) return;

        if (textContentNormalised.includes('END CHAPTER')) {
            p.classList.add('chapter-end');
            return;
        }

        if (textContent == textContentNormalised)
            p.classList.add('chat-log-system');

        if (textContentNormalised.includes('SESSION #'))
            p.classList.add('chat-log-system');

        // if the text matches SESSION XXX where X is a number using regex, add the class chat-log-system
        var regex = /SESSION\s\d+/g;
        if (regex.test(textContentNormalised))
            p.classList.add('chat-log-system');
    }

    function addCLSifQualified(p) {
        var previous = p.previousElementSibling;
        if (previous && previous.classList.contains('chat-log-system')) {
            // if the first word ends with :, add the class chat-log-system
            var text = p.innerText;
            var firstWord = text.split(' ')[0];

            if (firstWord.endsWith(':'))
                p.classList.add('chat-log-system');
        }
    }

    function removeLoneCLS(p, arr) {
        if (!p.classList.contains('chat-log-system')) return;

        // turn arr into an array
        arr = Array.prototype.slice.call(arr);

        var found = false;
        // get the position of the p tag in the array
        let i = arr.indexOf(p);
        found = findClassWithinDistance(arr, i, conversationScan, ['chat-log', 'chat-log-system']);

        if (!found)
            p.classList.remove('chat-log-system');
    }
}

function forceBreaks(paragraph) {
    // if the p tag contains a br, skip
    if (paragraph.querySelector('br')) return;

    // if the p tag contains a strong tag that contains Date Point, add a br after the strong tag
    var strongTags = paragraph.querySelectorAll('strong');
    for (var j = 0; j < strongTags.length; j++) {
        var strongTag = strongTags[j];
        if (strongTag.innerText.includes('Date Point')) {
            var br = document.createElement('br');
            paragraph.insertBefore(br, strongTag.nextSibling);
        }
    }
}

function loadCSS() {
    // if the style element already exists, remove it
    var style = document.getElementById('BaneDW');
    if (style) style.remove();

    var style = document.createElement('style');
    style.id = 'BaneDW';

    style.innerHTML = `
        body
        {
            max-width: 100vw;
            overflow-x: hidden;
        }
        .bane-article {
            display: flex;
            flex-direction: column;
            align-content: center;
            width: 100%;
        }  
        article hr
        {
            width: 100%;
            padding-bottom: 3rem;
            border: none;
            border-bottom: 1px solid white;
        }

        hr { width: 100%; }

        /* this just makes the .conversation.right less shit when disabled */
        .conversation.right { margin-left: 45%; }

        body.inverted #container main article p code { color: black; }
    `;

    // for settings that are true, add the CSS using a switch statement
    for (i = 0; i < settings.length; i++) {
        var setting = settings[i];
        if (setting.value) {
            switch (setting.name) {
                case 'replaceSectionEndHeaders':
                    style.innerHTML += `
                        body.inverted article h2
                          {
                            color: #fff !important;
                            font-family: "Roboto Slab", serif !important;
                            font-size: 1.2rem;

                            border-bottom: 1px solid white;
                            padding-bottom: 3rem;
                            }
                    `;
                    break;
                case 'darkScrollbars':
                    style.innerHTML += `
                        ::-webkit-scrollbar { width: 10px; }
                        ::-webkit-scrollbar-track { background: #fff0; }
                        ::-webkit-scrollbar-thumb { background: #d09242; }
                        ::-webkit-scrollbar-thumb:hover { background: #dda45b; }
                        ::-webkit-scrollbar-corner { background: #0000; }
                    `;
                    break;
                case 'fixCodeBlocks':
                    style.innerHTML += `
                        pre
                        {
                            background: black !important;
                            border-radius: 10px;
                            overflow-x: hidden !important;

                            box-shadow: none !important;
                        }
                        pre code { white-space: pre-wrap; }
                    `;
                    break;
                case 'fixBlockquotes':
                    style.innerHTML += `
                        blockquote::before
                      {
                            content: "“";
                            font-family: auto;
                        }
                    `;
                    break;
                case 'fancySMS':
                    style.innerHTML += `
                        .conversation.right,
                        .conversation.left,

                        .conversation + p:not(:has(+p))
                        {
                            width: fit-content;
                            max-width: 50%;

                            font-family: system-ui;

                            border-radius: 15px;
                            padding: 10px;

                            margin: 10px 100px;

                            position: relative;
                        }

                        .conversation.left + p:has(+.conversation.right)
                        {
                            background: unset !important;
                            max-width: unset;
                            padding: unset;
                            color: unset;
                            margin: 1em 0;
                            font-family: unset;
                        }
                        .conversation.left + p:has(+.conversation.right)::before,
                        .conversation.left + p:has(+.conversation.right)::after
                        {
                            display: none;
                        }

                        .conversation.right br,
                        .conversation.left br,

                        .conversation + br
                        {
                            display: none;
                        }

                        .conversation.left { text-align: left; }

                        .conversation.right
                        {
                            background: #159eec !important;
                            margin-left: auto;

                            text-align: right;

                            border-radius: 15px 15px 5px 15px;
                        }
                        .conversation.right:has(+.conversation.right)
                        {
                            border-radius: 15px 15px 5px 15px;
                            margin-bottom: 0;
                        }
                        .conversation.right + .conversation.right
                        {
                            border-radius: 15px 5px 5px 15px;
                            margin-top: 5px;
                        }

                        .conversation.left, .conversation.left em,

                        .conversation + p:not(:has(+p))
                        {
                            background: #d0d0d0 !important;
                            color: black;
                            border-radius: 15px 15px 15px 5px;

                            font-style: normal !important;
                        }

                        body:not(.inverted) .conversation.right { color: white; }
                    `;
                    break;
                case 'fancySMSBubbles':
                    // if the user doesn't have fancySMS enabled, don't enable this
                    if (!settings.find(x => x.name == 'fancySMS').value) break;
                    style.innerHTML += `
                        .conversation.right:not(:has(+.conversation.right))::before,
                        .conversation.left::before,

                        .conversation + p:not(:has(+p))::before
                        {
                            content: "";
                            border-radius: 50%;
                            height: 32px;
                            width: auto;
                            aspect-ratio: 1/1;

                            position: absolute;

                            background: inherit;
                            bottom: 0;
                        }

                        .conversation.right:not(:has(+.conversation.right))::after,
                        .conversation.left::after,

                        .conversation + p:not(:has(+p))::after
                        {
                            content: "";
                            border-radius: 50%;
                            height: 15px;
                            width: auto;
                            aspect-ratio: 1/1;

                            border: 4px solid #222;

                            box-sizing: border-box;

                            position: absolute;

                            background: #22a057;
                            bottom: -4px;
                        }

                        body:not(.inverted) .conversation.right:not(:has(+.conversation.right))::after,
                        body:not(.inverted) .conversation.right + p::after
                        {
                            border-color: #FFFFFF;
                        }

                        .conversation.right::before { right: -40px; }
                        .conversation.left::before { left: -40px; }
                        .conversation + p:not(:has(+p))::before { left: -40px; }

                        .conversation.right::after { right: -44px; }
                        .conversation.left::after { left: -20px; }
                        .conversation + p:not(:has(+p))::after { left: -20px; }

                        .conversation.coarse
                        {
                            font-family: monospace;
                        }
                    `;
                    break;
                case 'justifyParagraphs':
                    style.innerHTML += `
                        article > p { text-align: justify; }
                    `;
                    break;
                case 'fancyChatLog':
                    style.innerHTML += `
                        .chat-log
                      {
                            display: flex;

                            margin: 0;
                            font-family: 'Ruda';
                        }
                        .chat-log-name
                      {
                            min-width: 150px;
                            text-align: right;
                            padding: 1em;
                        }
                        .chat-log-text
                      {
                            border-left: 1px solid #ddd;
                            padding: 1em;

                            justify-content: left;
                        }

                        .chat-log-system
                      {
                            text-align: center !important;
                            text-transform: uppercase;
                            border: 1px solid #ddd;

                            padding: 1em;
                            margin: 0;

                            font-family: monospace;
                            font-weight: 400;
                        }
                        .chat-log-system:has(+.chat-log-system) { border-bottom: none; }
                        .chat-log-system +.chat-log-system { border-top: none; }

                        .chat-log-system + hr { display: none; }

                        .chat-log,
                        .chat-log-text, .chat-log-text em
                      {
                            text-align: left !important;
                        }

                        .bane-article > .chapter-end { text-align: center; }
                    `;
                    break;
                case 'fancyChatLogKeep++':
                    style.innerHTML += `
                        .chat-log-name::before {content: "++"; }
                        .chat-log-name::after {content: "++:"; }
                    `;
                    break;
                case 'fancyChatLogRoundedSystem':
                    style.innerHTML += `
                        .chat-log-system { border-radius: 1em; }
                        .chat-log-system:has(+.chat-log-system) { border-radius: 1em 1em 0 0; }
                        .chat-log-system + .chat-log-system { border-radius: 0; }
                        .chat-log-system+.chat-log-system:not(:has(+.chat-log-system)) { border-radius: 0 0 1em 1em; }
                    `;
                    break;
                case 'tableOfContents':
                    style.innerHTML += `
                        .bane-toc
                        {
                            right: 0;
                            text-align: center;

                            padding-right: 0.5em;
                            padding-bottom: 0.5em;

                            opacity: 0.1;

                            border-left: 4px solid #CECECE;

                            transform: translatex(calc(-20px + 100%));
                            transition: all 100ms ease-in-out;
                        }

                        .bane-toc:hover
                        {
                            transform: translateX(0);
                            opacity: 1;
                        }

                        .bane-toc h1
                        {
                            text-align: center;
                            margin: 0;
                        }

                        .bane-toc-container
                        {
                            overflow: scroll;

                            display: flex;
                            flex-direction: column;
                        }

                        .bane-toc-chapter
                        {
                            position: relative;
                            margin: 0 3px;
                            padding: 0.25em;
                        }

                        .bane-toc .bane-toc-active,
                        .bane-toc .bane-toc-chapter:hover,

                        .bane-toc .bane-toc-readingorder
                        {
                            color: #d09242 !important;
                        }
                        .bane-toc .bane-toc-active { font-weight: bold; }

                        .bane-toc-deathworlders { border-left: 4px solid #d09242; }
                        .bane-toc-goodtraining { border-left: 4px solid #d04242; }
                        .bane-toc-champions { border-left: 4px solid #d0ad42; }
                        .bane-toc-babylon { border-left: 4px solid #f16ff1; }
                        .bane-toc-bolthole { border-left: 4px solid #4297d0; }
                        .bane-toc-xiuchang { border-left: 4px solid #42d053; }
                        .bane-toc-mia { border-left: 4px solid #9de16d; }
                        .bane-toc-salvage { border-left: 4px solid #fb41fb; }

                        .bane-toc-chapter.interlude { border-left-style: double; }
                        .bane-toc-chapter.part { border-left-style: dashed; }

                        .bane-toc-navlinks
                        {
                            display: flex;
                            justify-content: space-between;
                        }

                        /* .bane-toc-chapter:not(.bane-toc-deathworlders) { opacity: .3; } */

                        .bane-toc-chapter::before
                        {
                            content: "";
                            display: block;
                            position: absolute;
                            top: 50%;
                            left: 0;

                            transform: translate(calc(-50% - 2px), -50%);

                            border-left: 10px solid;
                            border-color: inherit;

                            height: 10px;
                            width: 10px;

                            border-radius: 20px;
                            box-sizing:border-box;

                            z-index: 1;

                            transition: height 200ms ease-in-out;
                        }

                        .bane-toc-chapter:hover::before { height: 30px; }
                        .bane-toc-chapter.bane-toc-active::before { height: 40px; }
                        .bane-toc-chapter.bane-toc-active:hover::before { height: 45px; }
                        .bane-toc-chapter.interlude::before { border-left-style: inherit; }

                        .bane-toc-chapter.offsite { border-right: 5px solid #d04242; }
                        .bane-toc-navlink-next.offsite, .bane-toc-navlink-prev.offsite { color: #d04242 !important; }

                        .bane-toc-chapter:first-child::after
                        {
                            content: "";
                            display: block;
                            position: absolute;
                            top: 0;
                            transform: translateX(-65%);

                            background: #222222;

                            height: 20px;
                            width: 20px;

                            z-index: 0;
                        }

                        .bane-toc-readingorder
                        {
                            width: fit-content;
                            margin: 0 auto;
                        }

                        body:not(.inverted) .bane-toc-chapter:first-child::after { background: #fff; }
                    `;
                    break;
                case 'highlightLinks':
                    style.innerHTML += `
                        .bane-article p a { color: #d09242 !important; }
                        .bane-article p a:hover { text-decoration: underline; }
                    `;
                    break;
                case 'alternateTextMode':
                    style.innerHTML += `
                        p
                        {
                            font-family: "Ruda", sans-serif;
                            line-height: 30px;
                            letter-spacing: 1px;
                            
                            font-weight: 100;
                            
                            color: #dedede;
                        }
                        
                        p hb
                        {
                            font-weight: 1000;
                            color: #fff;
                        }
                        
                        body:not(.inverted) p, body:not(.inverted) p hb { color: black; }
                    `;
                    break;
            }
        }
    }

    // add the CSS to the page
    document.head.appendChild(style);
}

function spawnTableofContents() {
    var chapterJSON = tocJSON;

    // add a sidebar on the right side of the page
    let sidebar = document.createElement('div');
    sidebar.id = 'bane-toc';
    sidebar.classList.add('bane-sidebar');
    sidebar.classList.add('bane-toc');
    document.body.appendChild(sidebar);

    let sidebarTitle = document.createElement('h1');
    sidebarTitle.classList.add('bane-toc-title');
    sidebarTitle.innerHTML = 'Table of Contents';
    sidebar.appendChild(sidebarTitle);

    // add a container for next/previous chapter links
    let navLinks = document.createElement('div');
    navLinks.classList.add('bane-toc-navlinks');
    sidebar.appendChild(navLinks);

    addHR(sidebar);

    // add a link to the previous chapter
    let prevLink = document.createElement('a');
    prevLink.classList.add('bane-toc-navlink-prev');
    prevLink.innerHTML = '&lt; Previous Chapter';
    navLinks.appendChild(prevLink);

    // add a link to the next chapter
    let nextLink = document.createElement('a');
    nextLink.classList.add('bane-toc-navlink-next');
    nextLink.innerHTML = 'Next Chapter &gt;';
    navLinks.appendChild(nextLink);

    // create a container for the table of contents
    let toc = document.createElement('div');
    toc.classList.add('bane-toc-container');
    sidebar.appendChild(toc);

    // load the table of contents from chapterJSON into the container and add links to the chapters
    for (let chapter of chapterJSON["chapters"]) {
        // create an a tag for the chapter
        let chapterLink = document.createElement('a');
        chapterLink.classList.add('bane-toc-chapter');

        let datatp = "";

        // add a class based on the book name to colour-code the chapters
        let chapterBook = chapter.book;
        includesAdd(chapterLink, chapterBook, 'deathworlders', 'bane-toc-deathworlders');
        includesAdd(chapterLink, chapterBook, 'good training', 'bane-toc-goodtraining');
        includesAdd(chapterLink, chapterBook, 'the champions', 'bane-toc-champions');
        includesAdd(chapterLink, chapterBook, 'babylon', 'bane-toc-babylon');
        includesAdd(chapterLink, chapterBook, 'bolthole', 'bane-toc-bolthole');
        includesAdd(chapterLink, chapterBook, 'xiù chang', 'bane-toc-xiuchang');
        includesAdd(chapterLink, chapterBook, 'mia', 'bane-toc-mia');
        includesAdd(chapterLink, chapterBook, 'salvage', 'bane-toc-salvage');

        // add a class based on the chapter type to style-code the chapters
        let chapterName = chapter.name;
        if (chapterName.toLowerCase().includes(' part ')) chapterLink.classList.add('part');
        if (chapterName.toLowerCase().includes('interlude')) chapterLink.classList.add('interlude');

        let chapterURL = chapter.url;
        chapterLink.href = chapterURL;

        // if the url is offsite, add a class to the chapter
        if (!chapterURL.includes('deathworlders.com')) {
            // check if the chapter has an alt url
            if (chapter.alt != null && chapter.alt != "") {
                chapterLink.href = chapter.alt;
                chapterLink.classList.add('hijack');

                datatp += `Alt URL: ${chapter.alt}\n`;
            }
            else {
                chapterLink.classList.add('offsite');
                var domain = chapterLink.hostname;
                domain = domain.replace('www.', '');

                datatp += `Offsite Link: (${domain})\n`
            }
        }

        let chapterNote = chapter.note;
        if (chapterNote != null && chapterNote != "") {
            // add a note to the chapter as data
            chapterLink.setAttribute('data-note', chapterNote);
            chapterLink.classList.add('bane-toc-note');

            datatp += `Note: ${chapterNote}\n`;
        }

        if (chapter.number == null || chapter.number == -1)
            chapterLink.innerText = `${chapter.book}\n${chapter.name}`;
        else
            chapterLink.innerText = `${chapter.book} ${chapter.number}\n${chapter.name}`;

        if (chapter.url == window.location.href || chapter.alt == window.location.href) {
            chapterLink.classList.add('bane-toc-active');

            // add a link to the previous chapter based on the current chapter's index
            let index = chapterJSON["chapters"].indexOf(chapter);
            if (index > 0) {
                let prevChapter = chapterJSON["chapters"][index - 1];
                prevLink.href = prevChapter.url;
                let target = isOffsite("deathworlders.com", prevChapter.url);
                if (target[0]) {
                    // if the previous chapter has an alt url, use that instead
                    if (prevChapter.alt != null && prevChapter.alt != "") {
                        prevLink.href = prevChapter.alt;
                        prevLink.classList.add('hijack');
                    }
                    else {
                        prevLink.classList.add('offsite');
                        prevLink.setAttribute('data-tooltip', `Offsite Link: (${target[1]})`);
                    }
                }
            }
            else {
                prevLink.innerHTML = '';
                prevLink.style.pointerEvents = 'none';
            }

            // add a link to the next chapter based on the current chapter's index
            if (index < chapterJSON["chapters"].length - 1) {
                var nextChapter = chapterJSON["chapters"][index + 1];
                nextLink.href = nextChapter.url;
                let target = isOffsite("deathworlders.com", nextChapter.url);
                if (target[0]) {
                    // if the next chapter has an alt url, use that instead
                    if (nextChapter.alt != null && nextChapter.alt != "") {
                        nextLink.href = nextChapter.alt;
                        nextLink.classList.add('hijack');
                    }
                    else {
                        nextLink.classList.add('offsite');
                        nextLink.setAttribute('data-tooltip', `Offsite Link: (${target[1]})`);
                    }
                }
            }
            else {
                nextLink.innerHTML = '';
                nextLink.style.pointerEvents = 'none';
            }
        }
        // if not a chapter page, hide the next/previous links
        if (window.location.href == 'https://deathworlders.com/' || window.location.href == 'https://deathworlders.com/books') {
            prevLink.innerHTML = '';
            prevLink.style.pointerEvents = 'none';
            nextLink.innerHTML = '';
            nextLink.style.pointerEvents = 'none';
        }

        // add tooltip text as data
        if (datatp != "")
            chapterLink.setAttribute('data-tooltip', datatp);

        // add the chapter to the table of contents
        toc.appendChild(chapterLink);
    }

    addHR(sidebar);

    // add a link to the full reading order
    let fullReadingOrder = document.createElement('a');
    fullReadingOrder.href = 'https://www.reddit.com/r/HFY/wiki/ref/universes/jenkinsverse/chronological_reading_order/';
    fullReadingOrder.innerText = 'Full Reading Order';
    fullReadingOrder.classList.add('bane-toc-readingorder');
    fullReadingOrder.classList.add('offsite');
    sidebar.appendChild(fullReadingOrder);

    // scroll to the active chapter, vertically centering it
    let activeChapter = document.querySelector('.bane-toc-active');
    if (activeChapter) {
        activeChapter.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center',
        });
    }
}

function addToolTipToWhereItNeedsToGo() {
    let tp = tooltip();

    // use document.querySelector body closest '.offsite' for hover detection
    document.body.addEventListener('mousemove', function (e) {
        // find any element with an attribute of data-tooltip
        var target = e.target.closest('[data-tooltip]');
        if (target) {
            tp.classList.add('active');

            // set tooltip text to contents of data-tooltip attribute
            var msg = target.getAttribute('data-tooltip');
            tp.updateTooltipMessage(msg);

            if (target.closest('.bane-toc'))
                tp.moveTooltipToElement(target, 'left');
            else if (target.closest('.bane-settings'))
                tp.moveTooltipToElement(target, 'right');
        }
        else {
            tp.classList.remove('active');
        }
    });
}

function hijackChapter() {
    var toc = tocJSON;

    var chapters = toc.chapters;
    var currentURL = window.location.href;

    for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].alt !== '' && currentURL == chapters[i].alt) {
            replace(currentURL);
            return;
        }
    }
}

function replace(sourceUrl) {
    console.log(`Replacing ${sourceUrl} with GitHub version`);

    var hash = sourceUrl.split('#')[1] || sourceUrl.split('/').slice(-2).join('/');

    var url = `https://raw.githubusercontent.com/Jordy3D/DeathworldersTweaks/main/stories/${hash}.json`;

    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.send();

    // when the request loads, run this function
    request.onload = function () {
        // set the json variable to the response
        json = request.response;

        var main = document.querySelector('main');
        var section = main.querySelector('section');
        if (section) section.remove();

        // if the json has a source, add it to the page as main > div.download-epub-btn.add-margin > span.epub-btn-text:TEXT=" SOURCE" > span.fas.fa-download.fa-lg::before:CONTENT="\f0c1"
        if (json.source) {
            var sourceLink = document.createElement('div');
            sourceLink.classList.add('download-epub-btn');
            sourceLink.classList.add('epub-btn');
            sourceLink.classList.add('add-margin');
            sourceLink.innerHTML = `<span class="fas fa-link fa-lg" style="font-size:revert"></span><span class="epub-btn-text"><a href="${json.source}" target="_blank"> SOURCE</a></span>`;
            main.appendChild(sourceLink);
        }

        // create a new article with the id #bane-replace
        var article = document.createElement('article');
        article.id = 'bane-replace';
        article.classList.add('bane-article');
        main.appendChild(article);

        // add the title to the page
        var title = document.createElement('h1');
        if (json.chapter == null || json.chapter == '' || json.chapter <= 0)
            title.innerText = `${json.book}\n${json.chapterTitle}`
        else
            title.innerText = `${json.book}\nChapter ${json.chapter}: ${json.chapterTitle}`;
        article.appendChild(title);

        // add aside > ul > li > time
        var aside = document.createElement('aside');
        var ul = document.createElement('ul');
        var li = document.createElement('li');

        if (json.date) {
            var time = document.createElement('time');
            // set the time's datetime attribute to the date
            var date = new Date(json.date);
            time.classList.add('post-date');
            time.setAttribute('datetime', `${date}T00:00:00`);
            // set the time's innerText to the date formatted as Mon X, YYYY
            time.innerText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        li.appendChild(time);
        ul.appendChild(li);
        aside.appendChild(ul);
        article.appendChild(aside);

        var wordCount = 0;

        // add each paragraph to the page
        for (var i = 0; i < json.content.length; i++) {
            var paragraph = json.content[i];

            if (paragraph.tag == 'hr') {
                addHR(article);
                continue;
            }

            if (paragraph.text == '' || paragraph.text == ' ') continue;

            // create an element based on the paragraph's tag
            var p = document.createElement(paragraph.tag);
            // if class is defined, add it to the element. If there's more than one class, split it by spaces, comma, or period
            if (paragraph.class) p.classList.add(...paragraph.class.split(/[\s,\.]+/));
            // add the text to the element, ensuring that HTML tags are parsed as HTML
            p.innerHTML = paragraph.text;

            // replace <> and </> text with tags
            p.innerHTML = swapGTLTwithTag(p.innerHTML, 'i');
            p.innerHTML = swapGTLTwithTag(p.innerHTML, 'b');

            // count words to calculate reading time
            wordCount += paragraph.text.split(' ').length;

            // if the p is a code block, wrap it in a pre
            if (paragraph.tag == 'code') {
                var pre = document.createElement('pre');
                pre.appendChild(p);
                article.appendChild(pre);
                continue;
            }

            article.appendChild(p);
        }

        // add reading time to the page
        var readingTime = document.createElement('li');
        readingTime.innerText = `${Math.ceil(wordCount / 200)} min read`;
        ul.appendChild(readingTime);
    };
}

function halfbold(paragraph) {
    var words = paragraph.innerHTML.split(' ');

    for (var j = 0; j < words.length; j++) {
        var word = words[j];

        if (word == '') continue;

        // if word starts with <X> using regex, keep the tag off to the side and add it back later
        var startTag = '';
        var endTag = '';

        var startMatch = word.match(/^<\w+>/);
        if (startMatch) {
            startTag = startMatch[0];
            word = word.substring(startTag.length);
        }
        var endMatch = word.match(/<\/\w+>$/);
        if (endMatch) {
            endTag = endMatch[0];
            word = word.substring(0, word.length - endTag.length);
        }

        console.log(`startTag: ${startTag}, endTag: ${endTag}, word: ${word}`);

        // check if the two tags are the same
        if (startTag != endTag.replace('/', '')) continue;

        // add <hb> tags to the front and middle of the word
        var middle = Math.ceil(word.length / 2);
        var firstHalf = word.substring(0, middle);
        var secondHalf = word.substring(middle);

        words[j] = `${startTag}<hb>${firstHalf}</hb>${secondHalf}${endTag}`;
    }

    paragraph.innerHTML = words.join(' ');
}

function replaceUnderscoreBreaks(paragraph) {
    // if the paragraph is only underscores, replace the entire paragraph with <hr>
    if (paragraph.innerHTML.match(/^_{2,}$/))
        paragraph.outerHTML = '<hr>';

    // if the paragraph matches —, replace it with <hr>
    else if (paragraph.innerHTML.match(/^—$/))
        paragraph.outerHTML = '<hr>';

    // if the paragraph ends with underscores, remove them and add <hr> after
    else if (paragraph.innerHTML.match(/_{2,}$/))
        paragraph.outerHTML = paragraph.outerHTML.replace('__', '<hr>');
}

// ===== HELPER FUNCTIONS =====

// create a function that gets all p elements then calls a callback function on each paragraph
function forEachParagraph(callback) {
    return forEachQuery('p', callback);
}

function forEachQuery(query, callback) {
    let elements = document.querySelectorAll(query);
    for (var i = 0; i < elements.length; i++)
        callback(elements[i], elements);
}

function findClassWithinDistance(array, currentIndex, distance, searchClass) {
    let classes = [searchClass].flat();

    for (var i = 0; i < classes.length; i++) {
        let className = classes[i];
        // console.log(`Looking for ${className} within ${distance} of ${currentIndex}`);

        for (var j = -distance; j < distance; j++) {
            let ref = currentIndex + j;

            if (ref < 0) continue; // skip if we're going to go out of bounds
            if (ref >= array.length) continue; // skip if we're going to go out of bounds
            if (j == 0) continue; // skip if we're looking at the element itself

            let sibling = array[ref]

            if (sibling && sibling.classList && sibling.classList.contains(className))
                return true;
        }
    }

    return false;
}

function swapGTLTwithTag(string, tag) {
    string = string.replace(`/&lt;${tag}&gt;/g`, `<${tag}>`);
    string = string.replace(`/&lt;\/${tag}&gt;/g`, `</${tag}>`);
    return string;
}

function isOffsite(home, url) {
    url = new URL(url);
    return [!url.hostname.includes(home), url.hostname.replace('www.', '')];
}

function includesAdd(element, term, search, addClass) {
    if (term.toLowerCase().includes(search))
        element.classList.add(addClass);
}

function addHR(parent) {
    var hr = document.createElement('hr');
    parent.appendChild(hr);
}

function tooltip() {
    var tp = document.querySelector('.bane-tooltip');
    if (!tp) {
        tp = document.createElement('div');
        tp.classList.add('bane-tooltip');
        document.body.appendChild(tp);

        // create style for tooltips
        var style = document.createElement('style');
        style.id = 'bane-tooltip-style';
        style.innerHTML = `
            .bane-tooltip
            {
                position: absolute;
                top: 0;
                left: 0;

                width: max-content;

                z-index: 9999;
                pointer-events: none;

                background: #D04242;
                color: #fff;

                padding: 0.5em;
                margin: 0.5em;

                border-radius: 5px;

                opacity: 0;
                transform: translate(0%, -70%);
            }
            .bane-tooltip.active { opacity: 1; }

            .bane-tooltip::before
            {
                content: "";
                position: absolute;
                top: 50%;
                left: 100%;
                transform: translate(-5px, -50%) rotate(45deg);

                width: 10px;
                height: 10px;

                background: inherit;
            }

            .bane-tooltip.top::before
            {
                top: 100%;
                left: 50%;
                transform: translate(0, -50%) rotate(45deg);
            }

            .bane-tooltip.bottom::before
            {
                top: 0%;
                left: 50%;
                transform: translate(0, -50%) rotate(45deg);
            }

            .bane-tooltip.left::before
            {
                top: 50%;
                left: 100%;
                transform: translate(-5px, -50%) rotate(45deg);
            }

            .bane-tooltip.right::before
            {
                top: 50%;
                left: 0%;
                transform: translate(-5px, -50%) rotate(45deg);
            }
            .bane-tooltip.bottom.left::before
            {
                top: 99%;
                left: 100%;
                transform: translate(-5px, -50%) rotate(130deg);
            
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            .bane-tooltip.top.left::before
            {
                top: 1%;
                left: 100%;
                transform: translate(-5px, -50%) rotate(50deg);
            
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }

            .bane-tooltip.bottom.right::before
            {
                top: 99%;
                left: 0%;
                transform: translate(-5px, -50%) rotate(-130deg);
            
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            .bane-tooltip.top.right::before
            {
                top: 1%;
                left: 0%;
                transform: translate(-5px, -50%) rotate(-50deg);
            
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
        `;
        document.head.appendChild(style);
    }

    function updateTooltipMessage(msg) {
        tp.innerText = msg;
    }

    function moveTooltip(e) {
        var x = e.clientX;
        var y = e.clientY;

        // offset y by the scroll position
        y += window.scrollY;

        tp.style.left = x + 'px';
        tp.style.top = y + 'px';
    }

    function moveTooltipToElement(element, side, distance = 20) {
        var rect = element.getBoundingClientRect();

        var sides = ['top', 'bottom', 'left', 'right'];
        // remove all sides
        sides.forEach(s => tp.classList.remove(s));

        tp.classList.add(side);

        var x = null;
        var y = null;

        switch (side) {
            case 'top':
                x = rect.left + (rect.width / 2);
                y = rect.top;
                break;
            case 'bottom':
                x = rect.left + (rect.width / 2);
                y = rect.top + rect.height;
                break;
            case 'left':
                x = rect.left - tp.offsetWidth - distance;
                y = rect.top + (rect.height / 2);
                break;
            case 'right':
                x = rect.left + rect.width + distance;
                y = rect.top + (rect.height / 2);
                break;
        }

        // offset y by the scroll position
        y += window.scrollY;

        tp.style.left = x + 'px';
        tp.style.top = y + 'px';
    }

    function colorTooltip(color) {
        tp.style.background = color;
    }

    // make the above functions public
    tp.updateTooltipMessage = updateTooltipMessage;
    tp.moveTooltip = moveTooltip;
    tp.moveTooltipToElement = moveTooltipToElement;

    return tp;
}
