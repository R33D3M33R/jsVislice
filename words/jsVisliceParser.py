#!/usr/bin/env python

from __future__ import division
from operator import itemgetter
import math
import json

__author__ = "Andrej Mernik"
__copyright__ = "Copyright 2015 Andrej Mernik"
__license__ = "GPLv3"

'''
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
'''


class jsVisliceParser():
    def __init__(self, input, lang):
        self.input = input
        self.lang = lang
        self.word_list = []
        self.output = self.lang + '.json'
        self.min_words_for_difficulty = 10 # how many words should be in a level group
        self.preferred_word_length = {'min': 4, 'max': 15} # how long should the words be to be accepted
        self.letter_frequency = {'en': {'a': 8.167, 'b': 1.492, 'c': 2.782, 'd': 4.253, 'e': 12.702, 'f': 2.228, 'g': 2.015, 'h': 6.094, 'i': 6.966, 'j': 0.153, 'k': 0.772, 'l': 4.025, 'm': 2.406, 'n': 6.749, 'o': 7.507, 'p': 1.929, 'q': 0.095, 'r': 5.987, 's': 6.327, 't': 9.056, 'u': 2.758, 'v': 0.978, 'w': 2.360, 'x': 0.150, 'y': 1.974, 'z': 0.074}}

    def save_output(self):
        '''
        Save the word list in a JSON format
        '''
        self.parse_input()
        with open(self.output, 'w') as output:
            output.write('[')
            for level in self.prepare_word_list():
                json.dump(level, output)
                if level['lvl'] < self.num_levels:
                    output.write(', ')
            output.write(']')

    def parse_input(self):
        '''
        Parse the input file line by line and append to word list
        '''
        with open(self.input, 'r') as input:
            for line in input.readlines():
                word = line.strip()
                word_length = len(word)
                if word_length >= self.preferred_word_length['min'] and word_length <= self.preferred_word_length['max']:
                    difficulty = self.calculate_difficulty(word)
                    if difficulty > 0:
                        self.word_list.append({'word': word, 'difficulty': difficulty})

    def calculate_difficulty(self, word):
        '''
        :param word: word to analyze
        :return: numeric value of how difficult is the word to guess. Is equal to 0 if the word is revealed with two or less letters
        '''
        different_letters = ''.join(set(word))
        num_different_letters = len(different_letters)
        if num_different_letters < 3:
            return 0
        else:
            difficulty = num_different_letters
            for letter in different_letters:
                if letter in self.letter_frequency[self.lang]:
                    difficulty += 100.0/self.letter_frequency[self.lang][letter]
                else:
                    # letter not in frequency list? that can't be good
                    return 0
            return math.ceil(difficulty)

    def prepare_word_list(self):
        '''
        :return: yields a level/list pair object
        '''
        word_list_length = len(self.word_list)
        if word_list_length == 0:
            raise ValueError('The word list is empty')
        else:
            self.word_list = sorted(self.word_list, key=itemgetter('difficulty'))
            self.num_levels = int(math.ceil(word_list_length/self.min_words_for_difficulty))
            for i in range(self.num_levels):
                j = i*self.min_words_for_difficulty
                yield {'lvl': i+1, 'words': [word['word'] for word in self.word_list[j:j+self.min_words_for_difficulty]]}

if __name__ == "__main__":
    parser = jsVisliceParser('en.txt', 'en')
    parser.save_output()
