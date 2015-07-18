/*
 @author: Andrej Mernik
 @version: 0.1


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
    lives: 6, // initial lives at level 0
    levelupAt: 5, // level up at each
    levelScore: 50, // initial score for a successful level
    calculateLives: function() {
        return (this.level > 0) ? Math.floor(this.level / this.levelupAt) + this.lives - visliceWords.guesses.wrong.length : this.lives;
    },
    newLevel: function() {
        this.level++;
        visliceWords.selectWord();
        visliceView.initKeys();
        visliceView.updateView();
    },
    isGameOver: function() {
        return this.calculateLives() < 1;
    }
};

var visliceScores = {
    playerName: 'Anonymous', // default player name
    scoresKey: 'visliceScores', // key used to store scores in localstorage
    numScores: 10, // how many scores to keep in localstorage
    loadHighScores: function() {
        if (this.checkStorage()) {
            var highScores = localStorage.getItem(this.scoresKey);
            return (highScores === null) ? null : JSON.parse(highScores);
        }
        return null;
    },
    saveHighScores: function() {
        if (this.checkStorage()) {
            var currentRecord = {playerName: this.playerName, date: Date.now(), score: this.calculateScore(), level: visliceLevels.level};
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
        return (visliceWords.numWrongGuesses > 0) ? Math.floor((visliceLevels.level - 1) * visliceLevels.levelScore / visliceWords.numWrongGuesses) : Math.floor((visliceLevels.level - 1) * visliceLevels.levelScore);
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
        visliceView.toggleKey(key);
        visliceWords.doGuess(key.html().toLowerCase());
        visliceWords.prepareWord();
        visliceView.updateView();
        if (visliceWords.checkGuess()) {
            visliceLevels.newLevel();
        } else if (visliceLevels.isGameOver()) {
            visliceScores.saveHighScores();
            alert('Game over!');
        }
    },
    toggleHighScores: function(element) {
        visliceView.displayHighScores(element);
    },
    init: function() {
        // setup player
        var playerName = $('#playerName').val();
        if (playerName.length !== 0) visliceScores.playerName = playerName;
        visliceLevels.newLevel();
        visliceView.toggleElement('#welcome');
        visliceView.toggleElement('#game');
    }
};

var visliceView = {
    toggleElement: function(e) {
        var element = $(e);
        (element.is(':visible')) ? element.hide() : element.show();
    },
    initKeys: function() {
        var self = this;
        $('#letters').find('.disabled').each(function() {self.toggleKey($(this))});
        if (visliceWords.guesses.correct.length > 0) {
            for (var i=0; i < visliceWords.guesses.correct.length; i++) {
                this.toggleKey($('#key' + visliceWords.guesses.correct[i].toUpperCase()));
            }
        }
        if (visliceWords.guesses.wrong.length > 0) {
            for (var i=0; i < visliceWords.guesses.wrong.length; i++) {
                this.toggleKey($('#key' + visliceWords.guesses.wrong[i].toUpperCase()));
            }
        }
    },
    toggleKey: function(key) {
        (key.hasClass('disabled')) ? key.removeClass('disabled') : key.addClass('disabled');
    },
    displayWord: function() {
        var wordContainer = $('#word');
        (visliceView.currentWord !== null) ? wordContainer.html(visliceWords.currentWord) : wordContainer.html('<div class="alert alert-danger">Couldn\'t select a random word.</div>');
    },
    displayWrongGuesses: function() {
        $('#wrongGuesses').html('<strike>' + visliceWords.guesses.wrong.join(', ') + '</strike>')
    },
    displayLives: function() {
        var livesContainer = $('#lives');
        var numLives = visliceLevels.calculateLives();
        livesContainer.html('');
        for (var i=0; i < numLives; i++) {
            livesContainer.append('<div>X</div>')
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
        this.displayScore();
        this.displayLevel();
    },
    displayHighScores: function(element) {
        var highScores = visliceScores.loadHighScores();
        var beforeElement = element.find('h2');
        if (!visliceScores.checkStorage()) {
            $(('<p>The HTML5 LocalStorage could not be intialized. High scores are not available.</p>').insertAfter(beforeElement));
        } else if (highScores === null) {
            $('<p>No items yet! Keep playing for highscores.</p>').insertAfter(beforeElement);
        } else {
            $('<ol></ol>').insertAfter(beforeElement);
            var list  = element.find('ol');
            for (var i=0; i < highScores.length; i++) {
                list.append('<li>' + highScores[i].playerName + ' scored ' + highScores[i].score + ' and got to the level ' + highScores[i].level + '</li>');
            }
        }
    }
};

$(document).ready(function() {
    $('#welcome').find('button').on('click', function() {
            visliceController.init();
        }
    );
    $('#letters').find('button').on('click', function() {
            visliceController.click($(this));
        }
    );
    visliceController.toggleHighScores($('#highscores'));
});