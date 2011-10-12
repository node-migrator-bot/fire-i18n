var Expression = require('priest').Expression
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

function getDefaultLocaleText(_i18nGlobalDict, selfExpression, key, replacementTokens) {
	localeDict = _i18nGlobalDict[DEFAULT_LOCALE]
	if(localeDict){
		selfExpression.setResult(replaceTokens(localeDict[key], replacementTokens))
		return
	}
	selfExpression.setResult(DEFAULT_TRANSLATION)
	return
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

i18nExpression.prototype = new Expression();
i18nExpression.prototype.execute = function() {
	var runtime = this._blockContext._runtime
	var hintVal = this.getHintValue()
	var currentLocaleId = this.getVar('currentLocaleId')
	if(!currentLocaleId) {
		currentLocaleId = DEFAULT_LOCALE
	}
	var _i18nGlobalDict = runtime._i18nGlobalDict
	var self = this
	if(_i18nGlobalDict) {
		this.runInput({
			_resultCallback: function(replacementTokens) {
				var localeDict = _i18nGlobalDict[currentLocaleId]
				var exactKeyMatch = null
				if(localeDict && (exactKeyMatch = localeDict[hintVal])){
					// Exact match discovery
					self.setResult(replaceTokens(exactKeyMatch,replacementTokens))
					return
				} else {
					// Downgrade to lang only if possible
					var lang = getLang(currentLocaleId)
					if(lang == currentLocaleId) {
						// we were looking for lang already, look in default language then
						getDefaultLocaleText(_i18nGlobalDict, self, hintVal, replacementTokens)
						return
					} else {
						// look for lang only.
						localeDict = _i18nGlobalDict[lang]
						if(localeDict && (exactKeyMatch = localeDict[hintVal])){
							self.setResult(replacementTokens(localeDict[hintVal], replacementTokens))
							return
						}  else {
							// no key in lang either
							//let's look using default lang
							getDefaultLocaleText(_i18nGlobalDict, self, hintVal, replacementTokens)
							return
						}
					}
				}
			}
		})
	} else {
		self.setResult(DEFAULT_TRANSLATION)
		return
	}
}

module.exports.enableModule = function(thirdPartyModule) {
	var moduleDirName = path.dirname(thirdPartyModule.filename)
	var i18nModuleResourceDir = path.join(moduleDirName,'i18n')
	if(!thirdPartyModule.exports.i18n) {
		thirdPartyModule.exports.i18n = {}
	}
	thirdPartyModule.exports.i18n.directories = [i18nModuleResourceDir]
}

module.exports.priestModuleInit = function(runtime) {
	runtime.events.on('load', function(runtime) {
		runtime._i18nGlobalDict = {}
		
		// 1. Load Modules
		var loadedModules = runtime.getModules()
		loadedModules.names().forEach(function(moduleName) {
			var loadedModule = loadedModules[moduleName]
			if(loadedModule.i18n) {
				if(loadedModule.i18n.directories) {
					loadedModule.i18n.directories.forEach(function(moduleResDir) {
						loadI18nResourcesDirIfExists(runtime, moduleResDir) // Load module resources resources $MODULE_ROOT/i18n
					})
				}
			}
		})
		
		// 2. App resources should be loaded after the modules so the app can override the entries if it's necessary
		loadI18nResourcesDirIfExists(runtime, 'i18n') // Load root runtime resources $PROGRAM_ROOT/i18n
		
	})
}
module.exports.DEFAULT_LOCALE = DEFAULT_LOCALE
module.exports.priestExpressions = [ {
		"name": "i18n",
		"flags": "hint",
		"implementation": i18nExpression
	}	
]
