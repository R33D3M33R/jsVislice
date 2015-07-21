/*
 @author: Andrej Mernik
 @version: 0.6


 @licstart  The following is the entire license notice for the
 JavaScript code in this file.

 Copyright (C) 2015  Andrej Mernik

 The JavaScript code in this page is free software: you can
 redistribute it and/or modify it under the terms of the GNU
 General Public License (GNU GPL) as published by the Free Software
 Foundation, either version 3 of the License, or (at your option)
 any later version.  The code is distributed WITHOUT ANY WARRANTY;
 without even the implied warranty of MERCHANTABILITY or FITNESS
 FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

 As additional permission under GNU GPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.


 @licend  The above is the entire license notice
 for the JavaScript code in this file.

 */

var visliceLevels = {
    level: 0, // starting level
    selectedDifficulty: 'normal', // default difficulty
    difficultyDefaults: {easy: {lives: 6, levelupAt: 2, levelScore: 25}, normal: {lives: 6, levelupAt: 5, levelScore: 50}, hard: {lives: 6, levelupAt: 10, levelScore: 100}},
    maxLives: 20,
    calculateLives: function() {
        var numLives = Math.floor((this.level - 1) / this.difficultyData().levelupAt) + this.difficultyData().lives;
        if (this.level > 1 && numLives < this.maxLives) {
            return {total: numLives, lost: visliceWords.guesses.wrong.length};
        } else if (this.level > 1 && numLives >= this.maxLives) {
            return {total: this.maxLives, lost: visliceWords.guesses.wrong.length};
        } else {
            return {total: this.difficultyData().lives, lost: visliceWords.guesses.wrong.length};
        }
    },
    newLevel: function() {
        this.level++;
        visliceWords.selectWord();
        visliceView.updateView();
    },
    isGameOver: function() {
        var livesCalc = this.calculateLives();
        return (livesCalc.total - livesCalc.lost) < 1;
    },
    difficultyData: function() {
        return this.difficultyDefaults[this.selectedDifficulty];
    }
};

var visliceScores = {
    scoresKey: 'visliceScores', // key used to store scores in localstorage
    playerKey: 'vislicePlayer', // key used to store last player name
    numScores: 10, // how many scores to keep in localstorage
    loadPlayerName: function() {
        if (this.checkStorage()) {
            var lastPlayer = localStorage.getItem(this.playerKey);
            return (lastPlayer === null) ? 'Anonymous' : JSON.parse(lastPlayer);
        }
        return 'Anonymous';
    },
    savePlayerName: function(name) {
        if (this.checkStorage()) {
            localStorage.setItem(this.playerKey, JSON.stringify(name));
            return 'Player name saved!';
        }
        return 'Error saving the player!';
    },
    loadHighScores: function() {
        if (this.checkStorage()) {
            var highScores = localStorage.getItem(this.scoresKey);
            return (highScores === null) ? null : JSON.parse(highScores);
        }
        return null;
    },
    saveHighScores: function() {
        if (this.checkStorage()) {
            var currentRecord = {playerName: this.loadPlayerName(), date: Date.now(), score: this.calculateScore(), level: visliceLevels.level};
            localStorage.setItem(this.scoresKey, JSON.stringify(this.sortHighScores(this.loadHighScores(), currentRecord)));
            return 'Score saved!';
        }
        return 'Error saving the score!';
    },
    sortHighScores: function(highScores, currentRecord) {
        if (highScores !== null) {
            highScores.push(currentRecord);
            highScores.sort(this.compareHighScores);
            return highScores.slice(0, this.numScores);
        }
        return [currentRecord];
    },
    compareHighScores: function(itemA, itemB) {
        return (itemB.score - itemA.score);
    },
    calculateScore: function() {
        return (visliceWords.numWrongGuesses > 0) ? Math.floor((visliceLevels.level - 1) * visliceLevels.difficultyData().levelScore / visliceWords.numWrongGuesses) : Math.floor((visliceLevels.level - 1) * visliceLevels.difficultyData().levelScore);
    },
    clearStorage: function() {
        if (this.checkStorage() && localStorage.length > 0) localStorage.clear();
    },
    checkStorage: function () {
        return (localStorage !== undefined);
    }
};

var visliceWords = {
    wordlist: ['alligator', 'ant', 'bear', 'bee', 'bird', 'camel', 'cat', 'cheetah', 'chicken', 'chimpanzee', 'cow', 'crocodile', 'deer', 'dog', 'dolphin', 'duck', 'eagle', 'elephant', 'fish', 'fly', 'fox', 'frog', 'giraffe', 'goat', 'goldfish', 'hamster', 'hippopotamus', 'horse', 'kangaroo', 'kitten', 'lion', 'lobster', 'monkey', 'octopus', 'owl', 'panda', 'pig', 'puppy', 'rabbit', 'rat', 'scorpion', 'seal', 'shark', 'sheep', 'snail', 'snake', 'spider', 'squirrel', 'tiger', 'turtle', 'wolf', 'zebra'],
    numWrongGuesses: 0, // number of wrong guesses
    guesses: {correct: [], wrong: []},
    currentWordID: null,
    currentWord: null,
    selectWord: function() {
        var wordlistLength = this.wordlist.length;
        if (wordlistLength > 0) {
            this.currentWordID = Math.floor(Math.random() * wordlistLength);
            this.guesses = {correct: [], wrong: []};
            this.prepareWord();
        }
    },
    prepareWord: function() {
        var word = this.wordlist[this.currentWordID];
        var wordLen = word.length;
        this.currentWord = '';
        if (this.guesses.correct.length === 0) {
            this.doGuess(word.charAt(0));
            this.doGuess(word.charAt(wordLen - 1));
        }
        for (var i=0; i < wordLen; i++) {
            if (this.guesses.correct.indexOf(word.charAt(i)) === -1) {
                this.currentWord += ' _ ';
            } else {
                this.currentWord += word.charAt(i);
            }
        }
    },
    doGuess: function(guess) {
        if (this.wordlist[this.currentWordID].indexOf(guess) === -1) {
            this.numWrongGuesses++;
            this.guesses.wrong.push(guess);
        } else {
            this.guesses.correct.push(guess);
        }
    },
    checkGuess: function() {
        var word = this.wordlist[this.currentWordID];
        var wordLen = word.length;
        for (var i=0; i < wordLen; i++) {
            if (this.guesses.correct.indexOf(word.charAt(i)) === -1) {
                return false;
            }
        }
        return true;
    }

};

var visliceController = {
    click: function(key) {
        if (visliceWords.guesses.correct.indexOf(key) === -1 && visliceWords.guesses.wrong.indexOf(key) === -1) {
            visliceView.toggleKey(key);
            visliceWords.doGuess(key);
            visliceWords.prepareWord();
            visliceView.updateView();
            if (visliceWords.checkGuess()) {
                visliceLevels.newLevel();
            } else if (visliceLevels.isGameOver()) {
                this.gameOver();
            }
        }
    },
    keyPress: function(e) {
        var key = e.keyCode;
        if (key >= 65 && key <= 90 && window.location.hash === '#game') {
            this.click(String.fromCharCode(key).toLowerCase());
        }
    },
    init: function() {
        // setup player
        var playerName = $('#playerName').val();
        if (playerName.length !== 0) visliceScores.savePlayerName(playerName);
        var selectedDifficulty = $('#difficulty').find('input:radio[name=difficulty]:checked').val();
        if (selectedDifficulty.length !== 0) visliceLevels.selectedDifficulty = selectedDifficulty;
        visliceLevels.newLevel();
    },
    registerButtonBar: function(buttonBar) {
        var self = this;
        buttonBar.find('button[name=new]').on('click', function() {
                window.location.hash = '#welcome';
                visliceView.displayButtons();
            }
        );
        buttonBar.find('button[name=play]').on('click', function() {
                window.location.hash = 'game';
                visliceView.displayButtons();
                self.init();
            }
        );
        buttonBar.find('button[name=continue]').on('click', function() {
                window.location.hash = 'game';
                visliceView.displayButtons();
            }
        );
        buttonBar.find('button[name=highscores]').on('click', function() {
                window.location.hash = 'highscores';
                visliceView.displayButtons();
                visliceView.displayHighScores();
            }
        );
        buttonBar.find('button[name=clear]').on('click', function() {
                window.location.hash = 'highscores';
                visliceView.displayButtons();
                visliceScores.clearStorage();
                visliceView.displayHighScores();
            }
        );
        buttonBar.find('button[name=instructions]').on('click', function() {
                window.location.hash = 'instructions';
                visliceView.displayButtons();
            }
        );
    },
    registerKeys: function(letters) {
        var self = this;
        $(document).on('keydown', function(e) {
            self.keyPress(e);
        });
        letters.find('button').on('click', function() {
                self.click($(this).html().toLowerCase());
            }
        );
    },
    gameOver: function() {
        visliceScores.saveHighScores();
        // reset parameters
        visliceLevels.level = 0;
        visliceLevels.selectedDifficulty = 'normal';
        visliceWords.numWrongGuesses = 0;
        visliceWords.currentWordID = null;
        // display highscores
        window.location.hash = 'highscores';
        visliceView.displayHighScores();
    }
};

var visliceView = {
    mergeLivesAt: 5, // merge small lives into big
    displayKeys: function() {
        var i;
        var self = this;
        $('#letters').find('.disabled').each(function() {self.toggleKey($(this).html())});
        if (visliceWords.guesses.correct.length > 0) {
            for (i=0; i < visliceWords.guesses.correct.length; i++) {
                this.toggleKey(visliceWords.guesses.correct[i]);
            }
        }
        if (visliceWords.guesses.wrong.length > 0) {
            for (i=0; i < visliceWords.guesses.wrong.length; i++) {
                this.toggleKey(visliceWords.guesses.wrong[i]);
            }
        }
    },
    toggleKey: function(key) {
        var keyID = $('#key' + key.toUpperCase());
        (keyID.hasClass('disabled')) ? keyID.removeClass('disabled') : keyID.addClass('disabled');
    },
    displayWord: function() {
        var wordContainer = $('#word');
        (visliceView.currentWord !== null) ? wordContainer.html(visliceWords.currentWord) : wordContainer.html('<div class="alert alert-danger">Couldn\'t select a random word.</div>');
    },
    displayWrongGuesses: function() {
        $('#wrongGuesses').html((visliceWords.guesses.wrong.length > 0) ? '<span>' + visliceWords.guesses.wrong.join('</span>, <span>') + '</span>' : '&nbsp;');
    },
    displayLives: function() {
        var i;
        var livesContainer = $('#lives');
        livesContainer.html('');
        var livesCalc = visliceLevels.calculateLives();
        var livesLostSmall = Math.floor(livesCalc.lost % this.mergeLivesAt);
        var livesTotalSmall = Math.floor((livesCalc.total - livesCalc.lost) % this.mergeLivesAt);
        var livesLostBig = Math.floor(livesCalc.lost / this.mergeLivesAt);
        var livesTotalBig = Math.floor((livesCalc.total - livesCalc.lost) / this.mergeLivesAt);
        for (i=0; i < livesLostSmall; i++) {
            livesContainer.append('<div class="glyphicon glyphicon-heart-empty"></div>')
        }
        for (i=0; i < livesTotalSmall; i++) {
            livesContainer.append('<div class="glyphicon glyphicon-heart"></div>')
        }
        for (i=0; i < livesLostBig; i++) {
            livesContainer.append('<div class="glyphicon glyphicon-heart-empty big-heart"></div>')
        }
        for (i=0; i < livesTotalBig; i++) {
            livesContainer.append('<div class="glyphicon glyphicon-heart big-heart"></div>')
        }
    },
    displayScore: function() {
        $('#score').html(visliceScores.calculateScore());
    },
    displayLevel: function() {
        $('#level').html(visliceLevels.level);
    },
    updateView: function() {
        this.displayWord();
        this.displayWrongGuesses();
        this.displayLives();
        this.displayKeys();
        this.displayScore();
        this.displayLevel();
    },
    displayButtons: function() {
        var availButtons = ['new', 'play', 'continue', 'highscores', 'clear', 'instructions'];
        var currentPanel = window.location.hash.substr(1);
        var buttonBar = $('#buttons');
        var buttonsShown = {
            welcome: [availButtons[1], availButtons[3], availButtons[5]],
            instructions: [availButtons[0], availButtons[3]],
            highscores: [availButtons[0], availButtons[4], availButtons[5]],
            game: [availButtons[0], availButtons[3], availButtons[5]]
         };
        if (visliceWords.currentWordID !== null) {
            buttonsShown.welcome.push(availButtons[2]);
            buttonsShown.instructions.push(availButtons[2]);
            buttonsShown.highscores.push(availButtons[2]);
        }
        $.each(availButtons, function(index, value) {
            (buttonsShown[currentPanel].indexOf(value) === -1) ? buttonBar.find('button[name=' + value + ']').hide() : buttonBar.find('button[name=' + value + ']').show();
        });
    },
    displayHighScores: function() {
        var highScores = visliceScores.loadHighScores();
        var element = $('#highscores').find('div > div');
        if (!visliceScores.checkStorage()) {
            element.html('The HTML5 LocalStorage could not be intialized. High scores are not available.');
        } else if (highScores === null) {
            element.html('No items yet! Keep playing for highscores.');
        } else {
            element.html('<ol></ol>');
            var list  = element.find('ol');
            for (var i=0; i < highScores.length; i++) {
                date = new Date(highScores[i].date);
                list.append('<li>' + highScores[i].playerName + ' scored ' + highScores[i].score + ' (level ' + highScores[i].level + ') on ' + date.toLocaleDateString() + '</li>');
            }
        }
    },
    displayPlayerName: function() {
        var playerName = visliceScores.loadPlayerName();
        $('#playerName').val((playerName === 'Anonymous') ? '' : playerName);
    },
    loadWebFont: function(href) {
        if (document.createStyleSheet) {
            document.createStyleSheet(href);
        } else {
            $("head").append($('<link rel="stylesheet" href="' + href + '" type="text/css" />'));
        }
    }
};

$(document).ready(function() {
    window.location.hash = 'welcome';
    visliceView.loadWebFont('http://fonts.googleapis.com/css?family=Shadows+Into+Light+Two&subset=latin,latin-ext');
    visliceView.displayButtons();
    visliceView.displayPlayerName();
    visliceController.registerButtonBar($('#buttons'));
    visliceController.registerKeys($('#letters'));
});