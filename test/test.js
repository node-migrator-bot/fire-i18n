var vows = require('vows')
var assert = require('assert')
var path = require('path')
var exec = require('child_process').exec
var PriestRuntime = require('priest').Runtime
var i18nExpression = require('../index.js').i18nExpression
var i18nModuleInit = require('../index.js').priestModuleInit

function executePriest(testName, callback) {
	exec(path.resolve(path.join(__dirname,"../node_modules/.bin/priest")) + " " + path.join(__dirname, testName,testName + ".priest.json"), callback)
}

vows.describe('i18n - Load program i18n directory').addBatch({
	"When I execute a program that does not has any i18n directory and the program returns the default translation": {
		topic: function() {
			executePriest("testProgramWithNoi18n", this.callback)
		},
		"the result should be the translated message for the default locale": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify(""))
		}
	},
	"When I execute a program that has i18n dictionaries and the program returns the default translatio": {
		topic: function() {
			executePriest("testProgramDir", this.callback)
		},
		"the result should be the translated message for the default locale": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("Everything is ok!"))
		}
	}
}).export(module);

vows.describe('i18n').addBatch({
	"When I execute a program that use explicit language only locale id": {
		topic: function() {
			executePriest("explicitLanguageOnly", this.callback)
		},
		"the result should be the translated message for the set locale id": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("Hola"))
		}
	},
	"When I execute a program that use explicit language-region locale id": {
		topic: function() {
			executePriest("explicitLangRegion", this.callback)
		},
		"the result should be the translated message for the set locale id": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("Hola Tio"))
		}
	},
	"When I execute a program that use explicit language-region locale Id that has no translation": {
		topic: function() {
			executePriest("missingLangRegion", this.callback)
		},
		"the result should be the translated message in english, the default language": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("Hello There"))
		}
	}
	,
	"When I execute a program that use explicit language only locale Id that has no translation": {
		topic: function() {
			executePriest("missingLangOnly", this.callback)
		},
		"the result should be the translated message in english, the default language": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("Hello There"))
		}
	}
}).export(module);

vows.describe('i18n - Module Resources').addBatch({
	"When I execute a program that uses i18n resources from a module using default locale id": {
		topic: function() {
			executePriest("testFromModule", this.callback)
		},
		"the result should be the translated message provided by the module": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("Error Message from Sample Module"))
		}
	}
}).export(module);

vows.describe('i18n - Replacements').addBatch({
	"When I execute a program that uses i18n messages with replacements": {
		topic: function() {
			executePriest("testReplacements", this.callback)
		},
		"the result should the translated message with the replaced tokens": function(err, stdout, stderr) {
			if(stderr) console.log(stderr)
			assert.isEmpty(stderr)
			assert.isEmpty(stderr, "The priest command should not write any error")
			assert.equal(stdout, JSON.stringify("The channel 'News' was not found"))
		}
	}
}).export(module);

