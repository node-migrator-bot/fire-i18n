var vows = require('vows')
var assert = require('assert')
var path = require('path')
var exec = require('child_process').exec
var i18nExpression = require('../index.js').i18nExpression
var i18nModuleInit = require('../index.js').firejsModuleInit

function executeFireJs(testName, callback) {
	exec(path.resolve(path.join(__dirname,"../node_modules/.bin/firejs")) + " " + path.join(__dirname, testName,testName + ".fjson"), callback)
}

vows.describe('i18n - Load program i18n directory').addBatch({
	"When I execute a program that does not has any i18n directory and the program returns the default translation": {
		topic: function() {
			executeFireJs("testProgramWithNoi18n", this.callback)
		},
		"the result should be the translated message for the default locale": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify(""))
		}
	},
	"When I execute a program that has i18n dictionaries and the program returns the default translatio": {
		topic: function() {
			executeFireJs("testProgramDir", this.callback)
		},
		"the result should be the translated message for the default locale": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify("Everything is ok!"))
		}
	}
}).export(module);

vows.describe('i18n').addBatch({
	"When I execute a program that use explicit language only locale id": {
		topic: function() {
			executeFireJs("explicitLanguageOnly", this.callback)
		},
		"the result should be the translated message for the set locale id": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify("Hola"))
		}
	},
	"When I execute a program that use explicit language-region locale id": {
		topic: function() {
			executeFireJs("explicitLangRegion", this.callback)
		},
		"the result should be the translated message for the set locale id": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify("Hola Tio"))
		}
	},
	"When I execute a program that use explicit language-region locale Id that has no translation": {
		topic: function() {
			executeFireJs("missingLangRegion", this.callback)
		},
		"the result should be the translated message in english, the default language": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify("Hello There"))
		}
	}
	,
	"When I execute a program that use explicit language only locale Id that has no translation": {
		topic: function() {
			executeFireJs("missingLangOnly", this.callback)
		},
		"the result should be the translated message in english, the default language": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify("Hello There"))
		}
	}
}).export(module);

vows.describe('i18n - Module Resources').addBatch({
	"When I execute a program that uses i18n resources from a module using default locale id": {
		topic: function() {
			executeFireJs("testFromModule", this.callback)
		},
		"the result should be the translated message provided by the module": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify({
				"moduleMessage": "Error Message from Sample Module",
				"expressionMessage": "Error Message from Sample Expression number 422"
			}))
		}
	}
}).export(module);

vows.describe('i18n - Replacements').addBatch({
	"When I execute a program that uses i18n messages with replacements": {
		topic: function() {
			executeFireJs("testReplacements", this.callback)
		},
		"the result should the translated message with the replaced tokens": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The firejs command should not write any error")
			assert.equal(stdout, JSON.stringify("The channel 'News' was not found"))
		}
	}
}).export(module);

