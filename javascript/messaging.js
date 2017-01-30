(function(window, document, undefined) {
	'use strict';

	//console fallback for IE
	if (!window.console) { window.console = function(){}; if (typeof XDomainRequest !== "undefined") { window.console.prototype.log = function(err){ throw new SyntaxError(err); }; window.console.prototype.warn = function(err){ throw new SyntaxError(err); }; window.console.prototype.error = function(err){ throw new SyntaxError(err); }; } }

	//Custom iterator
	try{"function"!=typeof mapObject&&(window.mapObject=function(e,t){if(null!==e){var n=0;for(var r in e)e.hasOwnProperty(r)&&(t(e[r],r,n),n++);return!0}return console.log("returned object is null",typeof e),!1})}catch(err){console.log(err)}

	//[EventSource] Polyfill fix: https://github.com/remy/polyfills/blob/master/EventSource.js
	(function (global) { if ("EventSource" in global) return; var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g; var EventSource = function (url) { var eventsource = this, interval = 500, /* polling interval  */ lastEventId = null, cache = ''; if (!url || typeof url != 'string') { throw new SyntaxError('Not enough arguments'); } this.URL = url; this.readyState = this.CONNECTING; this._pollTimer = null; this._xhr = null; function pollAgain(interval) { eventsource._pollTimer = setTimeout(function () { poll.call(eventsource); }, interval); } function poll() { try { /* force hiding of the error message... insane?*/ if (eventsource.readyState == eventsource.CLOSED) return; /* NOTE: IE7 and upwards support*/ var xhr = new XMLHttpRequest(); xhr.open('GET', eventsource.URL, true); xhr.setRequestHeader('Accept', 'text/event-stream'); xhr.setRequestHeader('Cache-Control', 'no-cache'); /* we must make use of this on the server side if we're working with Android - because they don't trigger readychange until the server connection is closed*/ xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); if (lastEventId != null) xhr.setRequestHeader('Last-Event-ID', lastEventId); cache = ''; xhr.timeout = 50000; xhr.onreadystatechange = function () { if (this.readyState == 3 || (this.readyState == 4 && this.status == 200)) { /* on success*/ if (eventsource.readyState == eventsource.CONNECTING) { eventsource.readyState = eventsource.OPEN; eventsource.dispatchEvent('open', { type: 'open' }); } var responseText = ''; try { responseText = this.responseText || ''; } catch (e) {} /* process this.responseText*/ var parts = responseText.substr(cache.length).split("\n"), eventType = 'message', data = [], i = 0, line = ''; cache = responseText; /* TODO handle 'event' (for buffer name), retry*/ for (; i < parts.length; i++) { line = parts[i].replace(reTrim, ''); if (line.indexOf('event') == 0) { eventType = line.replace(/event:?\s*/, ''); } else if (line.indexOf('retry') == 0) { var retry = parseInt(line.replace(/retry:?\s*/, '')); if (!isNaN(retry)) { interval = retry; } } else if (line.indexOf('data') == 0) { data.push(line.replace(/data:?\s*/, '')); } else if (line.indexOf('id:') == 0) { lastEventId = line.replace(/id:?\s*/, ''); } else if (line.indexOf('id') == 0) { /* this resets the id*/ lastEventId = null; } else if (line == '') { if (data.length) { var event = new MessageEvent(data.join('\n'), eventsource.url, lastEventId); eventsource.dispatchEvent(eventType, event); data = []; eventType = 'message'; } } } if (this.readyState == 4) pollAgain(interval); /* don't need to poll again, because we're long-loading*/ } else if (eventsource.readyState !== eventsource.CLOSED) { if (this.readyState == 4) { /* and some other status dispatch error*/ eventsource.readyState = eventsource.CONNECTING; eventsource.dispatchEvent('error', { type: 'error' }); pollAgain(interval); } else if (this.readyState == 0) { /* likely aborted*/ pollAgain(interval); } else { } } }; xhr.send(); setTimeout(function () { if (true || xhr.readyState == 3) xhr.abort(); }, xhr.timeout); eventsource._xhr = xhr; } catch (e) { /* in an attempt to silence the errors*/ eventsource.dispatchEvent('error', { type: 'error', data: e.message }); /* ???*/ } }; poll(); /* init now*/ }; EventSource.prototype = { close: function () { /* closes the connection - disabling the polling*/ this.readyState = this.CLOSED; clearInterval(this._pollTimer); this._xhr.abort(); }, CONNECTING: 0, OPEN: 1, CLOSED: 2, dispatchEvent: function (type, event) { var handlers = this['_' + type + 'Handlers']; if (handlers) { for (var i = 0; i < handlers.length; i++) { handlers[i].call(this, event); } } if (this['on' + type]) { this['on' + type].call(this, event); } }, addEventListener: function (type, handler) { if (!this['_' + type + 'Handlers']) { this['_' + type + 'Handlers'] = []; } this['_' + type + 'Handlers'].push(handler); }, removeEventListener: function (type, handler) { var handlers = this['_' + type + 'Handlers']; if (!handlers) { return; } for (var i = handlers.length - 1; i >= 0; --i) { if (handlers[i] === handler) { handlers.splice(i, 1); break; } } }, onerror: null, onmessage: null, onopen: null, readyState: 0, URL: ''}; var MessageEvent = function (data, origin, lastEventId) { this.data = data; this.origin = origin; this.lastEventId = lastEventId || ''; }; MessageEvent.prototype = { data: null, type: 'message', lastEventId: '', origin: ''}; if ('module' in global) module.exports = EventSource; global.EventSource = EventSource; })(window);

	/**
	 * Returns true if it is a DOM element
	 *
	 * @return {Boolean}
	 * @param o
	 */
	var isElement = function(o){
		return (
			typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
			o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	};

	/**
	 * returns the size of an Object or array
	 *
	 * @return {Number}
	 * @param obj
	 */
	var sizeof = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}

		if(size === 0 && isElement(obj)){
			size = 1;
		}

		return size;
	};

	/**
	 * Ajax method
	 *
	 * @class Ajax
	 * @constructor
	 */
	var Ajax = function() {
		this.xhr = new XMLHttpRequest();
	};

	/**
	 * CORS support for Ajax calls
	 *
	 * @return {Object}
	 * @param method
	 * @param url
	 */
	Ajax.prototype.createCORSRequest = function(method, url) {
		var obj = this;

		if ("withCredentials" in obj.xhr) {
			// Most browsers.
			obj.xhr.open(method, url, true);
		} else if (typeof XDomainRequest != "undefined") {
			// IE8 & IE9
			obj.xhr = new XDomainRequest();

			url = (url.indexOf("https") > -1 && location.protocol !== 'https:') ? url.replace('https', 'http') : url;

			obj.xhr.open(method, url);
		} else {
			// CORS not supported.
			obj.xhr = null;
		}
		return obj.xhr;
	};

	/**
	 * Aborts active instance
	 *
	 * @return {Object}
	 */
	Ajax.prototype.abort = function() {
		if( this.xhr && this.xhr.readyState != undefined && this.xhr.readyState != 4 ){
			this.xhr.abort();
		}

		return this;
	};

	/**
	 * Retrieves data from a URL without page refresh
	 *
	 * @method getData
	 *  - object contains: HTTP method "type: POST, GET", url: to send the request to, data: {object}
	 * @return {String} in success object
	 * @param data
	 */
	Ajax.prototype.getData = function ( data ) {
		var obj = this;

		try{
			data.type           = (data.type !== undefined && typeof data.type === 'string' && data.type.length > 0) ? data.type : 'POST';
			data.data           = (data.data !== undefined && typeof data.data === 'object') ? data.data : {};
			data.url            = (data.url !== undefined && typeof data.url === 'string' && data.url.length > 0) ? data.url : '';
			data.success        = (data.success !== undefined) ? data.success : (function(){});
			data.error          = (data.error !== undefined) ? data.error : (function(){});
			data.headers        = (data.headers !== undefined) ? data.headers : {};
			data.extraCallback  = (data.extraCallback !== undefined) ? data.extraCallback : (function(){});

			// cross browser CORS support
			obj.xhr = this.createCORSRequest(data.type, data.url);

			obj.xhr.onload = function() {
				data.extraCallback(data, obj.xhr);
				data.success(obj.xhr.responseText, data, obj.xhr);
			};

			obj.xhr.onerror = function () {
				data.error(obj.xhr.status);
			};

			if (typeof XDomainRequest === "undefined") {
				if( sizeof(data.headers) > 0 ){
					var item;
					for( item in data.headers ){
						obj.xhr.setRequestHeader(item, data.headers[item]);
					}
				}else if ( (data.type === 'POST' || data.type === 'PUT') && sizeof(data.headers) === 0 ) {
					obj.xhr.setRequestHeader("Content-Type", "application/json");
				} else {
					obj.xhr.setRequestHeader("Content-Type", "text/plain");
				}
			}

			obj.xhr.send( JSON.stringify(data.data) );

			return obj.xhr;
		}catch(err){console.log(err);}
	};

	var Messaging = function( options ){

		this.settings = {
			ajax: {
				url: null,
				errorCallback: function(){}
			},
			sseUrl: null,
			messageQueue: [],
			debug: false,
			callback: function(data){}
		};

		if( typeof options !== "undefined" ){
			for(var opt in options){
				if (options.hasOwnProperty(opt)) {
					this.settings[opt] = options[opt];
				}
			}
		}

		this.intervalInstance = null;


		this.lookupData = function(){
			var _this = this;


			if(_this.settings.messageQueue.length > 0) {
				var data = _this.settings.messageQueue[0];

				var index = _this.settings.messageQueue.indexOf(data);
				if (index > -1) {
					_this.settings.messageQueue.splice(index, 1);
				}

				if(_this.settings.ajax.url !== null) {
					_this.getData(data);
				}else{
					_this.settings.callback(data);
				}
			}
		};

		this.setInterval = function(){
			var _this = this;
			_this.intervalInstance = setInterval(function(){

				_this.lookupData();

			}, 1000);
		};

		this.serverSideEventListeners = function(source){
			var _this = this;

			source.addEventListener('open', function(e) {
				if(_this.settings.debug) console.log("[Msg] connection opened", e);
			}, false);

			source.addEventListener('message', function(e) {
				if(_this.settings.debug){
					console.log("[Msg] message check");
					console.log(e.data);
				}
				var data = e.data,
					json = JSON.parse(data);

				_this.settings.messageQueue.push( json );

			}, false);

			source.addEventListener('error', function(e) {
				if(_this.settings.debug) console.log("[Msg] error check");
				if (e.readyState == EventSource.CLOSED) {
					if(_this.settings.debug) console.warn("[Msg] connection closed", e);
				}
			}, false);
		};

		this.getData = function(){
			var _this = this,
				ajax = new Ajax();

			var dataObj = {
				url: _this.settings.ajax.url,
				type: "GET",
				success: function (response, dataObject, xhr) {
					var json = {};
					try{json = JSON.parse(response)}catch(e){
						if(_this.settings.debug) console.log(e);
					}
					if ( xhr.status === 200 ) {
						_this.settings.callback(json);
					}else{
						_this.settings.ajax.errorCallback(json);
					}
				}
			};

			if(typeof _this.settings.ajax.apiKey !== "undefined"){
				dataObj.headers = _this.settings.ajax.apiKey;
			}

			ajax.abort().getData(dataObj);
		};

		this.init = function() {
			var _this = this;

			try{
				var source = new EventSource(_this.settings.sseUrl, {withCredentials: true});

				if(_this.settings.debug) console.log("[Msg] SSE started", _this.settings.sseUrl);

				window.onbeforeunload = function() {
					if(_this.settings.debug) console.log("[Msg] source close check");
					source.close();
				};

				_this.serverSideEventListeners(source);
				_this.setInterval();

			}catch( e ){
				if(_this.settings.debug) console.log("EventSource failed");
			}



		};

		this.init();
	};

	if(typeof window.sseMessaging === "undefined") {
		window.sseMessaging = Messaging;
	}else{
		console.warn("window.sseMessaging is already defined");
	}

})(window, document);