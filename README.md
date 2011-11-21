#fire-i18n
[![Build Status](https://secure.travis-ci.org/firejs/fire-i18n.png)](http://travis-ci.org/firejs/fire-i18n)

Internationalization module for [fire.js](https://github.com/firejs/firejs)
***

## Installing

### using NPM

    npm install fire-i18n

### using Github(unstable)
In the root of your project run:

    git clone git://github.com/firejs/fire-i18n.git node_modules/fire-i18n

## Working with i18n

The language is set by a variable called "currentLocaleId". If not set, the default locale is "en".

## @i18n

Returns the string for the current locale. The hint is the key in the global dictionary you want to retrieve. If the key can not be found, it will return a empty string. The input of the expression will be used as replacement of the tokens as the translation is retrieved.

### Example with key

Assuming that you have a dictionary like this:

    {
		"en": {
			"InvalidUser": "Invalid user"
		},
		"es": {
			"InvalidUser": "Usuario invalido"
		}
	}

When you use `@i18n` with the key `InvalidUser`:
    
	{
		"@i18n(InvalidUser)":null
	}

It will return "Invalid user" for `en-us` and "Usuario invalido" for `en-es`.

### Example with replacement tokens

Dictionaries can contain replacement tokens in the translations.

Example, given the following dictionary:

    "en": {
		"ChannelNotAvailable": "Channel '{name}' is not available"
	}

When you use `i18n` with an input:

	{
		"@i18n(ChannelNotAvailable)": {
			name: "News"
		}
	}

It will return "Channel 'News' is not available"

## Implementing i18n resources for a fire.js application

i18n module will try to load all the .i18n.json files from the i18n in the root of the application.

Example:

If you have a program in the following path `./MyApp.fjson` i18n will try load all the `i18n.<lang>.json` files from `./i18n/`.

## Implementing i18n resources in a custom module

Implementing i18n resources in a module works the same way than applications, except for a simple call you have to make in your main script:

    require('fire-i18n').enableModule(module)

**Note:** You must pass `module` and not `exports` or `module.exports`.

When you call `enableModule` i18n will load all the resources for your module using the following rules:

* A module defined as `./MyModule.js` will load resources from `./i18n/`
* A module defined as `./node_modules/MyModule.js` will load resources from `./node_modules/i18n/`
* A module defined as `./node_modules/MyModule/index.js` will load resources from `./node_modules/MyModule/i18n/`

### Custom Expressions

Custom expressions written in Javascript can also take advantage of i18n by calling `enableExpression`, example:

Example:

    var i18n = require('fire-i18n')
	var fire = require('fire')
    function SampleExpression1() {
	
	}
	SampleExpression1.prototype = new fire.Expression()
	i18n.enableExpression(SampleExpression1)

	SampleExpression1.prototype.execute = function() {
		this.setResult(this.getI18nText('sampleModule1.ErrorMsgExpression',{number:422}))
	}

You just need to pass the expression class and you should be able to use  `getI18nText` using a key and replacements object.

For a full example check [test at test/testFromModule](https://github.com/firejs/fire-i18n/tree/master/test/testFromModule).

## Considerations

fire-i18n uses the standard key discovery strategy:

* If the locale id specifies the region(e.g "en-us"), it will look for the language and region. If the key can not be found, it will look for the key using the language only(e.g "en").
* If the locale id only specifies the language(e.g "en"), it will look for the language key only.
* If the key can not be found using lang-region or lang only strategies, a discovery will be perfomed in the default language(en).
* If the key can not be found in the default language, an empty string is returned.

When you set the locale id using the variable `currentLocaleId` remember that the values must use lowercase dash notation, meaning that if you want to provide the locale for English in Region United States then you should use "en-us" and not "en-US", "en\_us" or "en\_US".


## Cloning the Repository

    git clone git://github.com/firejs/fire-i18n.git

### Tests

    make run-tests

### Collaborating

* Johan (author). Email: *johan@firebase.co*, Skype: *thepumpkin1979*

## MIT License

Copyright (c) 2011 Firebase.co - http://www.firebase.co

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.