// Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var fire = require('fire')
var Expression = fire.Expression
var fs = require('fs')
var path = require('path')

var DEFAULT_LOCALE = "en"
var DEFAULT_TRANSLATION = ''

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getFilesWithExtension(absoluteDirPath, extension) {
	var fileNames = fs.readdirSync(absoluteDirPath)
	var list = []
	fileNames.forEach(function(fileName) {
		if(endsWith(fileName,extension))
		{
			list.push(fileName)
		}
	})
	return list
}

function getLang(localeId) {
	var dashIndex = localeId.indexOf('-')
	return dashIndex != -1 ? localeId.substring(0,dashIndex) : localeId
}

function getDefaultLocaleText(_i18nGlobalDict, key, replacementTokens) {
	localeDict = _i18nGlobalDict[DEFAULT_LOCALE]
	if(localeDict){
		return replaceTokens(localeDict[key], replacementTokens)
	}
	return DEFAULT_TRANSLATION
}


function loadI18nResourcesDirIfExists(runtime, dirName) {
	if(path.existsSync(dirName)) {
		loadI18nResourcesDir(runtime, dirName)
	}
}

function mergeResource(runtime, resource) {
	Object.keys(resource).forEach(function(localeId) {
		var localeEntry = runtime._i18nGlobalDict[localeId]
		if(!localeEntry) {
			localeEntry = runtime._i18nGlobalDict[localeId] = {}
		}
		var resLocaleEntry = resource[localeId]
		if(resLocaleEntry) {
			Object.keys(resLocaleEntry).forEach(function(textKey) {
				localeEntry[textKey] = resLocaleEntry[textKey]
			})
		}
	})
}

function loadI18nResourcesDir(runtime, dirName) {
	var fileNames = getFilesWithExtension(dirName,".i18n.json")
	fileNames.forEach(function(fileName) {
		var resourceFileName = path.join(dirName, fileName)
		var resourceContent = fs.readFileSync(resourceFileName, 'utf8')
		var resource = JSON.parse(resourceContent)
		delete resourceContent
		mergeResource(runtime, resource)
	})
}

function replaceTokens(message, tokens) {
	if(tokens) {
		Object.keys(tokens).forEach(function(token) {
			message = message.replace('{' + token + '}', tokens[token])
		})
	}
	return message
}

function i18nExpression() {
	
}

function getText(runtime, currentLocaleId, key, replacementTokens) {
	var _i18nGlobalDict = runtime._i18nGlobalDict
	if(!currentLocaleId) {
		currentLocaleId = DEFAULT_LOCALE
	}
	if(_i18nGlobalDict) {
		var localeDict = _i18nGlobalDict[currentLocaleId]
		var exactKeyMatch = null
		if(localeDict && (exactKeyMatch = localeDict[key])){
			// Exact match discovery
			return replaceTokens(exactKeyMatch,replacementTokens)
		} else {
			// Downgrade to lang only if possible
			var lang = getLang(currentLocaleId)
			if(lang == currentLocaleId) {
				// we were looking for lang already, look in default language then
				return getDefaultLocaleText(_i18nGlobalDict, key, replacementTokens)

			} else {
				// look for lang only.
				localeDict = _i18nGlobalDict[lang]
				if(localeDict && (exactKeyMatch = localeDict[key])){
					return replacementTokens(localeDict[key], replacementTokens)

				}  else {
					// no key in lang either
					//let's look using default lang
					return getDefaultLocaleText(_i18nGlobalDict, key, replacementTokens)
				}
			}
		}
	} else {
		return DEFAULT_TRANSLATION
	}
}

function enableExpression(expressionClass) {
	expressionClass.prototype.getI18nText = function(key, replacementTokens) {
		var currentLocaleId = this.getVar('currentLocaleId')
		return getText(this.runtime, currentLocaleId, key, replacementTokens)
	}
}

i18nExpression.prototype = new Expression();
enableExpression(i18nExpression)

i18nExpression.prototype.execute = function() {
	var runtime = this.runtime
	var hintVal = this.getHintValue()
	
	var self = this

	this.runInput(function(replacementTokens) {
			self.end(self.getI18nText(hintVal, replacementTokens))
		}) // Input
}

module.exports.enableModule = function(thirdPartyModule) {
	var moduleDirName = path.dirname(thirdPartyModule.filename)
	var i18nModuleResourceDir = path.join(moduleDirName,'i18n')
	if(!thirdPartyModule.exports.i18n) {
		thirdPartyModule.exports.i18n = {}
	}
	thirdPartyModule.exports.i18n.directories = [i18nModuleResourceDir]
}

module.exports.DEFAULT_LOCALE = DEFAULT_LOCALE
module.exports.enableExpression = enableExpression

var fireModule = fire.igniteModule(module, require)
fireModule.initializer = function(runtime, next) {
	
	runtime._i18nGlobalDict = {}

	// 1. Load Modules
	var loadedModules = runtime.getModules()
	loadedModules.forEach(function(loadedModule) {
		if(loadedModule.i18n) {
			if(loadedModule.i18n.directories) {
				loadedModule.i18n.directories.forEach(function(moduleResDir) {
					loadI18nResourcesDirIfExists(runtime, moduleResDir) // Load module resources resources $MODULE_ROOT/i18n
				})
			}
		}
	})

	// 2. App resources should be loaded after the modules so the app can override the entries if it's necessary
	loadI18nResourcesDirIfExists(runtime, runtime.pathFromBaseDir('i18n')) // Load root runtime resources $PROGRAM_ROOT/i18n

	next()
}
fireModule.exportExpression({
				"name": "i18n",
				"flags": ["hint"],
				"implementation": i18nExpression
			})
