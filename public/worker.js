/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var canvg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var xmldom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var comlink__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);




const obj = {
  offscreenCanvas: null,
  ctx: null,
  getCanvas(offscreenCanvas) {
    if (!this.offscreenCanvas) this.offscreenCanvas = offscreenCanvas;
    if (!this.ctx) this.ctx = this.offscreenCanvas.getContext("2d");
  },
  async renderSvg(svg) {
    console.log(this.offscreenCanvas);
    this.offscreenCanvas.height = 550;
    this.offscreenCanvas.width = 650;
    const v = await canvg__WEBPACK_IMPORTED_MODULE_1__.Canvg.fromString(this.ctx, svg, canvg__WEBPACK_IMPORTED_MODULE_1__.presets.offscreen(xmldom__WEBPACK_IMPORTED_MODULE_0__));
    await v.render();
    v.start();
  },
};

comlink__WEBPACK_IMPORTED_MODULE_2__.expose(obj);


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

function DOMParser(options){
	this.options = options ||{locator:{}};
}

DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
  	var entityMap = isHTML?htmlEntity.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}

	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(isHTML){
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source && typeof source === 'string'){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler
 *
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;

		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},

	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},

	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		throw new ParseError(error, this.locator);
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
var htmlEntity = __webpack_require__(2);
var sax = __webpack_require__(3);
var XMLReader = sax.XMLReader;
var ParseError = sax.ParseError;
var DOMImplementation = exports.DOMImplementation = __webpack_require__(4).DOMImplementation;
exports.XMLSerializer = __webpack_require__(4).XMLSerializer ;
exports.DOMParser = DOMParser;
exports.__DOMHandler = DOMHandler;
//}


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {

exports.entityMap = {
       lt: '<',
       gt: '>',
       amp: '&',
       quot: '"',
       apos: "'",
       Agrave: "À",
       Aacute: "Á",
       Acirc: "Â",
       Atilde: "Ã",
       Auml: "Ä",
       Aring: "Å",
       AElig: "Æ",
       Ccedil: "Ç",
       Egrave: "È",
       Eacute: "É",
       Ecirc: "Ê",
       Euml: "Ë",
       Igrave: "Ì",
       Iacute: "Í",
       Icirc: "Î",
       Iuml: "Ï",
       ETH: "Ð",
       Ntilde: "Ñ",
       Ograve: "Ò",
       Oacute: "Ó",
       Ocirc: "Ô",
       Otilde: "Õ",
       Ouml: "Ö",
       Oslash: "Ø",
       Ugrave: "Ù",
       Uacute: "Ú",
       Ucirc: "Û",
       Uuml: "Ü",
       Yacute: "Ý",
       THORN: "Þ",
       szlig: "ß",
       agrave: "à",
       aacute: "á",
       acirc: "â",
       atilde: "ã",
       auml: "ä",
       aring: "å",
       aelig: "æ",
       ccedil: "ç",
       egrave: "è",
       eacute: "é",
       ecirc: "ê",
       euml: "ë",
       igrave: "ì",
       iacute: "í",
       icirc: "î",
       iuml: "ï",
       eth: "ð",
       ntilde: "ñ",
       ograve: "ò",
       oacute: "ó",
       ocirc: "ô",
       otilde: "õ",
       ouml: "ö",
       oslash: "ø",
       ugrave: "ù",
       uacute: "ú",
       ucirc: "û",
       uuml: "ü",
       yacute: "ý",
       thorn: "þ",
       yuml: "ÿ",
       nbsp: "\u00a0",
       iexcl: "¡",
       cent: "¢",
       pound: "£",
       curren: "¤",
       yen: "¥",
       brvbar: "¦",
       sect: "§",
       uml: "¨",
       copy: "©",
       ordf: "ª",
       laquo: "«",
       not: "¬",
       shy: "­­",
       reg: "®",
       macr: "¯",
       deg: "°",
       plusmn: "±",
       sup2: "²",
       sup3: "³",
       acute: "´",
       micro: "µ",
       para: "¶",
       middot: "·",
       cedil: "¸",
       sup1: "¹",
       ordm: "º",
       raquo: "»",
       frac14: "¼",
       frac12: "½",
       frac34: "¾",
       iquest: "¿",
       times: "×",
       divide: "÷",
       forall: "∀",
       part: "∂",
       exist: "∃",
       empty: "∅",
       nabla: "∇",
       isin: "∈",
       notin: "∉",
       ni: "∋",
       prod: "∏",
       sum: "∑",
       minus: "−",
       lowast: "∗",
       radic: "√",
       prop: "∝",
       infin: "∞",
       ang: "∠",
       and: "∧",
       or: "∨",
       cap: "∩",
       cup: "∪",
       'int': "∫",
       there4: "∴",
       sim: "∼",
       cong: "≅",
       asymp: "≈",
       ne: "≠",
       equiv: "≡",
       le: "≤",
       ge: "≥",
       sub: "⊂",
       sup: "⊃",
       nsub: "⊄",
       sube: "⊆",
       supe: "⊇",
       oplus: "⊕",
       otimes: "⊗",
       perp: "⊥",
       sdot: "⋅",
       Alpha: "Α",
       Beta: "Β",
       Gamma: "Γ",
       Delta: "Δ",
       Epsilon: "Ε",
       Zeta: "Ζ",
       Eta: "Η",
       Theta: "Θ",
       Iota: "Ι",
       Kappa: "Κ",
       Lambda: "Λ",
       Mu: "Μ",
       Nu: "Ν",
       Xi: "Ξ",
       Omicron: "Ο",
       Pi: "Π",
       Rho: "Ρ",
       Sigma: "Σ",
       Tau: "Τ",
       Upsilon: "Υ",
       Phi: "Φ",
       Chi: "Χ",
       Psi: "Ψ",
       Omega: "Ω",
       alpha: "α",
       beta: "β",
       gamma: "γ",
       delta: "δ",
       epsilon: "ε",
       zeta: "ζ",
       eta: "η",
       theta: "θ",
       iota: "ι",
       kappa: "κ",
       lambda: "λ",
       mu: "μ",
       nu: "ν",
       xi: "ξ",
       omicron: "ο",
       pi: "π",
       rho: "ρ",
       sigmaf: "ς",
       sigma: "σ",
       tau: "τ",
       upsilon: "υ",
       phi: "φ",
       chi: "χ",
       psi: "ψ",
       omega: "ω",
       thetasym: "ϑ",
       upsih: "ϒ",
       piv: "ϖ",
       OElig: "Œ",
       oelig: "œ",
       Scaron: "Š",
       scaron: "š",
       Yuml: "Ÿ",
       fnof: "ƒ",
       circ: "ˆ",
       tilde: "˜",
       ensp: " ",
       emsp: " ",
       thinsp: " ",
       zwnj: "‌",
       zwj: "‍",
       lrm: "‎",
       rlm: "‏",
       ndash: "–",
       mdash: "—",
       lsquo: "‘",
       rsquo: "’",
       sbquo: "‚",
       ldquo: "“",
       rdquo: "”",
       bdquo: "„",
       dagger: "†",
       Dagger: "‡",
       bull: "•",
       hellip: "…",
       permil: "‰",
       prime: "′",
       Prime: "″",
       lsaquo: "‹",
       rsaquo: "›",
       oline: "‾",
       euro: "€",
       trade: "™",
       larr: "←",
       uarr: "↑",
       rarr: "→",
       darr: "↓",
       harr: "↔",
       crarr: "↵",
       lceil: "⌈",
       rceil: "⌉",
       lfloor: "⌊",
       rfloor: "⌋",
       loz: "◊",
       spades: "♠",
       clubs: "♣",
       hearts: "♥",
       diams: "♦"
};


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {

//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

/**
 * Creates an error that will not be caught by XMLReader aka the SAX parser.
 *
 * @param {string} message
 * @param {any?} locator Optional, can provide details about the location in the source
 * @constructor
 */
function ParseError(message, locator) {
	this.message = message
	this.locator = locator
	if(Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
}
ParseError.prototype = new Error();
ParseError.prototype.name = ParseError.name

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName ); // No known test case
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			if (e instanceof ParseError) {
				throw e;
			}
			errorHandler.error('element parse error: '+e)
			end = -1;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){

	/**
	 * @param {string} qname
	 * @param {string} value
	 * @param {number} startIndex
	 */
	function addAttribute(qname, value, startIndex) {
		if (qname in el.attributeNames) errorHandler.fatalError('Attribute ' + qname + ' redefined')
		el.addValue(qname, value, startIndex)
	}
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName'); // No known test case
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					addAttribute(attrName, value, start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				addAttribute(attrName, value, start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="'); // No known test case
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')") // No known test case
			}
			break;
		case ''://end document
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!');
					addAttribute(attrName, value.replace(/&#?\w+;/g,entityReplacer), start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					addAttribute(value, value, start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					addAttribute(attrName, value, start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					addAttribute(attrName, attrName, start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = false;
			var sysid = false;
			if(len>3){
				if(/^public$/i.test(matchs[2][0])){
					pubid = matchs[3][0];
					sysid = len>4 && matchs[4][0];
				}else if(/^system$/i.test(matchs[2][0])){
					sysid = matchs[3][0];
				}
			}
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name, pubid, sysid);
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

function ElementAttributes(){
	this.attributeNames = {}
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	addValue:function(qName, value, offset) {
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this.attributeNames[qName] = this.length;
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}



function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;
exports.ParseError = ParseError;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);

/**
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 */
function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	getElementsByClassName: function(className) {
		var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
		return new LiveNodeList(this, function(base) {
			var ls = [];
			_visitNode(base.documentElement, function(node) {
				if(node !== base && node.nodeType == ELEMENT_NODE) {
					if(pattern.test(node.getAttribute('class'))) {
						ls.push(node);
					}
				}
			});
			return ls;
		});
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9 && this.documentElement || this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			if (uri) {
				// Avoid empty namespace value like xmlns:ds=""
				// Empty namespace URL will we produce an invalid XML document
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		/**
		 * Well-formedness constraint: No < in Attribute Values
		 * The replacement text of any entity referred to directly or indirectly in an attribute value must not contain a <.
		 * @see https://www.w3.org/TR/xml/#CleanAttrVals
		 * @see https://www.w3.org/TR/xml/#NT-AttValue
		 */
		return buf.push(' ', node.name, '="', node.value.replace(/[<&"]/g,_xmlEncoder), '"');
	case TEXT_NODE:
		/**
		 * The ampersand character (&) and the left angle bracket (<) must not appear in their literal form,
		 * except when used as markup delimiters, or within a comment, a processing instruction, or a CDATA section.
		 * If they are needed elsewhere, they must be escaped using either numeric character references or the strings
		 * `&amp;` and `&lt;` respectively.
		 * The right angle bracket (>) may be represented using the string " &gt; ", and must, for compatibility,
		 * be escaped using either `&gt;` or a character reference when it appears in the string `]]>` in content,
		 * when that string is not marking the end of a CDATA section.
		 *
		 * In the content of elements, character data is any string of characters
		 * which does not contain the start-delimiter of any markup
		 * and does not include the CDATA-section-close delimiter, `]]>`.
		 *
		 * @see https://www.w3.org/TR/xml/#NT-CharData
		 */
		return buf.push(node.data
			.replace(/[<&]/g,_xmlEncoder)
			.replace(/]]>/g, ']]&gt;')
		);
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC ', pubid);
			if (sysid && sysid!='.') {
				buf.push(' ', sysid);
			}
			buf.push('>');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM ', sysid, '>');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.Node = Node;
	exports.DOMException = DOMException;
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}


/***/ }),
/* 5 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AElement": () => (/* binding */ AElement),
/* harmony export */   "AnimateColorElement": () => (/* binding */ AnimateColorElement),
/* harmony export */   "AnimateElement": () => (/* binding */ AnimateElement),
/* harmony export */   "AnimateTransformElement": () => (/* binding */ AnimateTransformElement),
/* harmony export */   "BoundingBox": () => (/* binding */ BoundingBox),
/* harmony export */   "CB1": () => (/* binding */ CB1),
/* harmony export */   "CB2": () => (/* binding */ CB2),
/* harmony export */   "CB3": () => (/* binding */ CB3),
/* harmony export */   "CB4": () => (/* binding */ CB4),
/* harmony export */   "Canvg": () => (/* binding */ Canvg),
/* harmony export */   "CircleElement": () => (/* binding */ CircleElement),
/* harmony export */   "ClipPathElement": () => (/* binding */ ClipPathElement),
/* harmony export */   "DefsElement": () => (/* binding */ DefsElement),
/* harmony export */   "DescElement": () => (/* binding */ DescElement),
/* harmony export */   "Document": () => (/* binding */ Document),
/* harmony export */   "Element": () => (/* binding */ Element),
/* harmony export */   "EllipseElement": () => (/* binding */ EllipseElement),
/* harmony export */   "FeColorMatrixElement": () => (/* binding */ FeColorMatrixElement),
/* harmony export */   "FeCompositeElement": () => (/* binding */ FeCompositeElement),
/* harmony export */   "FeDropShadowElement": () => (/* binding */ FeDropShadowElement),
/* harmony export */   "FeGaussianBlurElement": () => (/* binding */ FeGaussianBlurElement),
/* harmony export */   "FeMorphologyElement": () => (/* binding */ FeMorphologyElement),
/* harmony export */   "FilterElement": () => (/* binding */ FilterElement),
/* harmony export */   "Font": () => (/* binding */ Font),
/* harmony export */   "FontElement": () => (/* binding */ FontElement),
/* harmony export */   "FontFaceElement": () => (/* binding */ FontFaceElement),
/* harmony export */   "GElement": () => (/* binding */ GElement),
/* harmony export */   "GlyphElement": () => (/* binding */ GlyphElement),
/* harmony export */   "GradientElement": () => (/* binding */ GradientElement),
/* harmony export */   "ImageElement": () => (/* binding */ ImageElement),
/* harmony export */   "LineElement": () => (/* binding */ LineElement),
/* harmony export */   "LinearGradientElement": () => (/* binding */ LinearGradientElement),
/* harmony export */   "MarkerElement": () => (/* binding */ MarkerElement),
/* harmony export */   "MaskElement": () => (/* binding */ MaskElement),
/* harmony export */   "Matrix": () => (/* binding */ Matrix),
/* harmony export */   "MissingGlyphElement": () => (/* binding */ MissingGlyphElement),
/* harmony export */   "Mouse": () => (/* binding */ Mouse),
/* harmony export */   "PSEUDO_ZERO": () => (/* binding */ PSEUDO_ZERO),
/* harmony export */   "Parser": () => (/* binding */ Parser),
/* harmony export */   "PathElement": () => (/* binding */ PathElement),
/* harmony export */   "PathParser": () => (/* binding */ PathParser),
/* harmony export */   "PatternElement": () => (/* binding */ PatternElement),
/* harmony export */   "Point": () => (/* binding */ Point),
/* harmony export */   "PolygonElement": () => (/* binding */ PolygonElement),
/* harmony export */   "PolylineElement": () => (/* binding */ PolylineElement),
/* harmony export */   "Property": () => (/* binding */ Property),
/* harmony export */   "QB1": () => (/* binding */ QB1),
/* harmony export */   "QB2": () => (/* binding */ QB2),
/* harmony export */   "QB3": () => (/* binding */ QB3),
/* harmony export */   "RadialGradientElement": () => (/* binding */ RadialGradientElement),
/* harmony export */   "RectElement": () => (/* binding */ RectElement),
/* harmony export */   "RenderedElement": () => (/* binding */ RenderedElement),
/* harmony export */   "Rotate": () => (/* binding */ Rotate),
/* harmony export */   "SVGElement": () => (/* binding */ SVGElement),
/* harmony export */   "SVGFontLoader": () => (/* binding */ SVGFontLoader),
/* harmony export */   "Scale": () => (/* binding */ Scale),
/* harmony export */   "Screen": () => (/* binding */ Screen),
/* harmony export */   "Skew": () => (/* binding */ Skew),
/* harmony export */   "SkewX": () => (/* binding */ SkewX),
/* harmony export */   "SkewY": () => (/* binding */ SkewY),
/* harmony export */   "StopElement": () => (/* binding */ StopElement),
/* harmony export */   "StyleElement": () => (/* binding */ StyleElement),
/* harmony export */   "SymbolElement": () => (/* binding */ SymbolElement),
/* harmony export */   "TRefElement": () => (/* binding */ TRefElement),
/* harmony export */   "TSpanElement": () => (/* binding */ TSpanElement),
/* harmony export */   "TextElement": () => (/* binding */ TextElement),
/* harmony export */   "TextPathElement": () => (/* binding */ TextPathElement),
/* harmony export */   "TitleElement": () => (/* binding */ TitleElement),
/* harmony export */   "Transform": () => (/* binding */ Transform),
/* harmony export */   "Translate": () => (/* binding */ Translate),
/* harmony export */   "UnknownElement": () => (/* binding */ UnknownElement),
/* harmony export */   "UseElement": () => (/* binding */ UseElement),
/* harmony export */   "ViewPort": () => (/* binding */ ViewPort),
/* harmony export */   "compressSpaces": () => (/* binding */ compressSpaces),
/* harmony export */   "elements": () => (/* binding */ elements),
/* harmony export */   "getSelectorSpecificity": () => (/* binding */ getSelectorSpecificity),
/* harmony export */   "normalizeAttributeName": () => (/* binding */ normalizeAttributeName),
/* harmony export */   "normalizeColor": () => (/* binding */ normalizeColor),
/* harmony export */   "parseExternalUrl": () => (/* binding */ parseExternalUrl),
/* harmony export */   "presets": () => (/* binding */ index),
/* harmony export */   "toMatrixValue": () => (/* binding */ toMatrixValue),
/* harmony export */   "toNumbers": () => (/* binding */ toNumbers),
/* harmony export */   "trimLeft": () => (/* binding */ trimLeft),
/* harmony export */   "trimRight": () => (/* binding */ trimRight),
/* harmony export */   "vectorMagnitude": () => (/* binding */ vectorMagnitude),
/* harmony export */   "vectorsAngle": () => (/* binding */ vectorsAngle),
/* harmony export */   "vectorsRatio": () => (/* binding */ vectorsRatio)
/* harmony export */ });
/* harmony import */ var raf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var rgbcolor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var svg_pathdata__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var stackblur_canvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);





/**
 * Options preset for `OffscreenCanvas`.
 * @param config - Preset requirements.
 * @param config.DOMParser - XML/HTML parser from string into DOM Document.
 * @returns Preset object.
 */ function offscreen() {
    let { DOMParser: DOMParserFallback  } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const preset = {
        window: null,
        ignoreAnimation: true,
        ignoreMouse: true,
        DOMParser: DOMParserFallback,
        createCanvas (width, height) {
            return new OffscreenCanvas(width, height);
        },
        async createImage (url) {
            const response = await fetch(url);
            const blob = await response.blob();
            const img = await createImageBitmap(blob);
            return img;
        }
    };
    if (typeof globalThis.DOMParser !== 'undefined' || typeof DOMParserFallback === 'undefined') {
        Reflect.deleteProperty(preset, 'DOMParser');
    }
    return preset;
}

/**
 * Options preset for `node-canvas`.
 * @param config - Preset requirements.
 * @param config.DOMParser - XML/HTML parser from string into DOM Document.
 * @param config.canvas - `node-canvas` exports.
 * @param config.fetch - WHATWG-compatible `fetch` function.
 * @returns Preset object.
 */ function node(param) {
    let { DOMParser , canvas , fetch  } = param;
    return {
        window: null,
        ignoreAnimation: true,
        ignoreMouse: true,
        DOMParser,
        fetch,
        createCanvas: canvas.createCanvas,
        createImage: canvas.loadImage
    };
}

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  offscreen: offscreen,
  node: node
});

/**
 * HTML-safe compress white-spaces.
 * @param str - String to compress.
 * @returns String.
 */ function compressSpaces(str) {
    return str.replace(/(?!\u3000)\s+/gm, ' ');
}
/**
 * HTML-safe left trim.
 * @param str - String to trim.
 * @returns String.
 */ function trimLeft(str) {
    return str.replace(/^[\n \t]+/, '');
}
/**
 * HTML-safe right trim.
 * @param str - String to trim.
 * @returns String.
 */ function trimRight(str) {
    return str.replace(/[\n \t]+$/, '');
}
/**
 * String to numbers array.
 * @param str - Numbers string.
 * @returns Numbers array.
 */ function toNumbers(str) {
    const matches = str.match(/-?(\d+(?:\.\d*(?:[eE][+-]?\d+)?)?|\.\d+)(?=\D|$)/gm);
    return matches ? matches.map(parseFloat) : [];
}
/**
 * String to matrix value.
 * @param str - Numbers string.
 * @returns Matrix value.
 */ function toMatrixValue(str) {
    const numbers = toNumbers(str);
    const matrix = [
        numbers[0] || 0,
        numbers[1] || 0,
        numbers[2] || 0,
        numbers[3] || 0,
        numbers[4] || 0,
        numbers[5] || 0
    ];
    return matrix;
}
// Microsoft Edge fix
const allUppercase = /^[A-Z-]+$/;
/**
 * Normalize attribute name.
 * @param name - Attribute name.
 * @returns Normalized attribute name.
 */ function normalizeAttributeName(name) {
    if (allUppercase.test(name)) {
        return name.toLowerCase();
    }
    return name;
}
/**
 * Parse external URL.
 * @param url - CSS url string.
 * @returns Parsed URL.
 */ function parseExternalUrl(url) {
    //                      single quotes [2]
    //                      v         double quotes [3]
    //                      v         v         no quotes [4]
    //                      v         v         v
    const urlMatch = /url\(('([^']+)'|"([^"]+)"|([^'")]+))\)/.exec(url);
    if (!urlMatch) {
        return '';
    }
    return urlMatch[2] || urlMatch[3] || urlMatch[4] || '';
}
/**
 * Transform floats to integers in rgb colors.
 * @param color - Color to normalize.
 * @returns Normalized color.
 */ function normalizeColor(color) {
    if (!color.startsWith('rgb')) {
        return color;
    }
    let rgbParts = 3;
    const normalizedColor = color.replace(/\d+(\.\d+)?/g, (num, isFloat)=>(rgbParts--) && isFloat ? String(Math.round(parseFloat(num))) : num
    );
    return normalizedColor;
}

// slightly modified version of https://github.com/keeganstreet/specificity/blob/master/specificity.js
const attributeRegex = /(\[[^\]]+\])/g;
const idRegex = /(#[^\s+>~.[:]+)/g;
const classRegex = /(\.[^\s+>~.[:]+)/g;
const pseudoElementRegex = /(::[^\s+>~.[:]+|:first-line|:first-letter|:before|:after)/gi;
const pseudoClassWithBracketsRegex = /(:[\w-]+\([^)]*\))/gi;
const pseudoClassRegex = /(:[^\s+>~.[:]+)/g;
const elementRegex = /([^\s+>~.[:]+)/g;
function findSelectorMatch(selector, regex) {
    const matches = regex.exec(selector);
    if (!matches) {
        return [
            selector,
            0
        ];
    }
    return [
        selector.replace(regex, ' '),
        matches.length
    ];
}
/**
 * Measure selector specificity.
 * @param selector - Selector to measure.
 * @returns Specificity.
 */ function getSelectorSpecificity(selector) {
    const specificity = [
        0,
        0,
        0
    ];
    let currentSelector = selector.replace(/:not\(([^)]*)\)/g, '     $1 ').replace(/{[\s\S]*/gm, ' ');
    let delta = 0;
    [currentSelector, delta] = findSelectorMatch(currentSelector, attributeRegex);
    specificity[1] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, idRegex);
    specificity[0] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, classRegex);
    specificity[1] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, pseudoElementRegex);
    specificity[2] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, pseudoClassWithBracketsRegex);
    specificity[1] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, pseudoClassRegex);
    specificity[1] += delta;
    currentSelector = currentSelector.replace(/[*\s+>~]/g, ' ').replace(/[#.]/g, ' ');
    [currentSelector, delta] = findSelectorMatch(currentSelector, elementRegex) // lgtm [js/useless-assignment-to-local]
    ;
    specificity[2] += delta;
    return specificity.join('');
}

const PSEUDO_ZERO = 0.00000001;
/**
 * Vector magnitude.
 * @param v
 * @returns Number result.
 */ function vectorMagnitude(v) {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}
/**
 * Ratio between two vectors.
 * @param u
 * @param v
 * @returns Number result.
 */ function vectorsRatio(u, v) {
    return (u[0] * v[0] + u[1] * v[1]) / (vectorMagnitude(u) * vectorMagnitude(v));
}
/**
 * Angle between two vectors.
 * @param u
 * @param v
 * @returns Number result.
 */ function vectorsAngle(u, v) {
    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vectorsRatio(u, v));
}
function CB1(t) {
    return t * t * t;
}
function CB2(t) {
    return 3 * t * t * (1 - t);
}
function CB3(t) {
    return 3 * t * (1 - t) * (1 - t);
}
function CB4(t) {
    return (1 - t) * (1 - t) * (1 - t);
}
function QB1(t) {
    return t * t;
}
function QB2(t) {
    return 2 * t * (1 - t);
}
function QB3(t) {
    return (1 - t) * (1 - t);
}

class Property {
    static empty(document) {
        return new Property(document, 'EMPTY', '');
    }
    split() {
        let separator = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ' ';
        const { document , name  } = this;
        return compressSpaces(this.getString()).trim().split(separator).map((value)=>new Property(document, name, value)
        );
    }
    hasValue(zeroIsValue) {
        const value = this.value;
        return value !== null && value !== '' && (zeroIsValue || value !== 0) && typeof value !== 'undefined';
    }
    isString(regexp) {
        const { value  } = this;
        const result = typeof value === 'string';
        if (!result || !regexp) {
            return result;
        }
        return regexp.test(value);
    }
    isUrlDefinition() {
        return this.isString(/^url\(/);
    }
    isPixels() {
        if (!this.hasValue()) {
            return false;
        }
        const asString = this.getString();
        switch(true){
            case asString.endsWith('px'):
            case /^[0-9]+$/.test(asString):
                return true;
            default:
                return false;
        }
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    getValue(def) {
        if (typeof def === 'undefined' || this.hasValue()) {
            return this.value;
        }
        return def;
    }
    getNumber(def) {
        if (!this.hasValue()) {
            if (typeof def === 'undefined') {
                return 0;
            }
            // @ts-expect-error Parse unknown value.
            return parseFloat(def);
        }
        const { value  } = this;
        // @ts-expect-error Parse unknown value.
        let n = parseFloat(value);
        if (this.isString(/%$/)) {
            n /= 100;
        }
        return n;
    }
    getString(def) {
        if (typeof def === 'undefined' || this.hasValue()) {
            return typeof this.value === 'undefined' ? '' : String(this.value);
        }
        return String(def);
    }
    getColor(def) {
        let color = this.getString(def);
        if (this.isNormalizedColor) {
            return color;
        }
        this.isNormalizedColor = true;
        color = normalizeColor(color);
        this.value = color;
        return color;
    }
    getDpi() {
        return 96 // TODO: compute?
        ;
    }
    getRem() {
        return this.document.rootEmSize;
    }
    getEm() {
        return this.document.emSize;
    }
    getUnits() {
        return this.getString().replace(/[0-9.-]/g, '');
    }
    getPixels(axisOrIsFontSize) {
        let processPercent = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        if (!this.hasValue()) {
            return 0;
        }
        const [axis, isFontSize] = typeof axisOrIsFontSize === 'boolean' ? [
            undefined,
            axisOrIsFontSize
        ] : [
            axisOrIsFontSize
        ];
        const { viewPort  } = this.document.screen;
        switch(true){
            case this.isString(/vmin$/):
                return this.getNumber() / 100 * Math.min(viewPort.computeSize('x'), viewPort.computeSize('y'));
            case this.isString(/vmax$/):
                return this.getNumber() / 100 * Math.max(viewPort.computeSize('x'), viewPort.computeSize('y'));
            case this.isString(/vw$/):
                return this.getNumber() / 100 * viewPort.computeSize('x');
            case this.isString(/vh$/):
                return this.getNumber() / 100 * viewPort.computeSize('y');
            case this.isString(/rem$/):
                return this.getNumber() * this.getRem();
            case this.isString(/em$/):
                return this.getNumber() * this.getEm();
            case this.isString(/ex$/):
                return this.getNumber() * this.getEm() / 2;
            case this.isString(/px$/):
                return this.getNumber();
            case this.isString(/pt$/):
                return this.getNumber() * this.getDpi() * (1 / 72);
            case this.isString(/pc$/):
                return this.getNumber() * 15;
            case this.isString(/cm$/):
                return this.getNumber() * this.getDpi() / 2.54;
            case this.isString(/mm$/):
                return this.getNumber() * this.getDpi() / 25.4;
            case this.isString(/in$/):
                return this.getNumber() * this.getDpi();
            case this.isString(/%$/) && isFontSize:
                return this.getNumber() * this.getEm();
            case this.isString(/%$/):
                return this.getNumber() * viewPort.computeSize(axis);
            default:
                {
                    const n = this.getNumber();
                    if (processPercent && n < 1) {
                        return n * viewPort.computeSize(axis);
                    }
                    return n;
                }
        }
    }
    getMilliseconds() {
        if (!this.hasValue()) {
            return 0;
        }
        if (this.isString(/ms$/)) {
            return this.getNumber();
        }
        return this.getNumber() * 1000;
    }
    getRadians() {
        if (!this.hasValue()) {
            return 0;
        }
        switch(true){
            case this.isString(/deg$/):
                return this.getNumber() * (Math.PI / 180);
            case this.isString(/grad$/):
                return this.getNumber() * (Math.PI / 200);
            case this.isString(/rad$/):
                return this.getNumber();
            default:
                return this.getNumber() * (Math.PI / 180);
        }
    }
    getDefinition() {
        const asString = this.getString();
        const match = /#([^)'"]+)/.exec(asString);
        const name = (match === null || match === void 0 ? void 0 : match[1]) || asString;
        return this.document.definitions[name];
    }
    getFillStyleDefinition(element, opacity) {
        let def = this.getDefinition();
        if (!def) {
            return null;
        }
        // gradient
        if (typeof def.createGradient === 'function' && 'getBoundingBox' in element) {
            return def.createGradient(this.document.ctx, element, opacity);
        }
        // pattern
        if (typeof def.createPattern === 'function') {
            if (def.getHrefAttribute().hasValue()) {
                const patternTransform = def.getAttribute('patternTransform');
                def = def.getHrefAttribute().getDefinition();
                if (def && patternTransform.hasValue()) {
                    def.getAttribute('patternTransform', true).setValue(patternTransform.value);
                }
            }
            if (def) {
                return def.createPattern(this.document.ctx, element, opacity);
            }
        }
        return null;
    }
    getTextBaseline() {
        if (!this.hasValue()) {
            return null;
        }
        const key = this.getString();
        return Property.textBaselineMapping[key] || null;
    }
    addOpacity(opacity) {
        let value = this.getColor();
        const len = value.length;
        let commas = 0;
        // Simulate old RGBColor version, which can't parse rgba.
        for(let i = 0; i < len; i++){
            if (value[i] === ',') {
                commas++;
            }
            if (commas === 3) {
                break;
            }
        }
        if (opacity.hasValue() && this.isString() && commas !== 3) {
            const color = new rgbcolor__WEBPACK_IMPORTED_MODULE_1__(value);
            if (color.ok) {
                color.alpha = opacity.getNumber();
                value = color.toRGBA();
            }
        }
        return new Property(this.document, this.name, value);
    }
    constructor(document, name, value){
        this.document = document;
        this.name = name;
        this.value = value;
        this.isNormalizedColor = false;
    }
}
Property.textBaselineMapping = {
    'baseline': 'alphabetic',
    'before-edge': 'top',
    'text-before-edge': 'top',
    'middle': 'middle',
    'central': 'middle',
    'after-edge': 'bottom',
    'text-after-edge': 'bottom',
    'ideographic': 'ideographic',
    'alphabetic': 'alphabetic',
    'hanging': 'hanging',
    'mathematical': 'alphabetic'
};

class ViewPort {
    clear() {
        this.viewPorts = [];
    }
    setCurrent(width, height) {
        this.viewPorts.push({
            width,
            height
        });
    }
    removeCurrent() {
        this.viewPorts.pop();
    }
    getRoot() {
        const [root] = this.viewPorts;
        if (!root) {
            return getDefault();
        }
        return root;
    }
    getCurrent() {
        const { viewPorts  } = this;
        const current = viewPorts[viewPorts.length - 1];
        if (!current) {
            return getDefault();
        }
        return current;
    }
    get width() {
        return this.getCurrent().width;
    }
    get height() {
        return this.getCurrent().height;
    }
    computeSize(d) {
        if (typeof d === 'number') {
            return d;
        }
        if (d === 'x') {
            return this.width;
        }
        if (d === 'y') {
            return this.height;
        }
        return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / Math.sqrt(2);
    }
    constructor(){
        this.viewPorts = [];
    }
}
ViewPort.DEFAULT_VIEWPORT_WIDTH = 800;
ViewPort.DEFAULT_VIEWPORT_HEIGHT = 600;
function getDefault() {
    return {
        width: ViewPort.DEFAULT_VIEWPORT_WIDTH,
        height: ViewPort.DEFAULT_VIEWPORT_HEIGHT
    };
}

class Point {
    static parse(point) {
        let defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        const [x = defaultValue, y = defaultValue] = toNumbers(point);
        return new Point(x, y);
    }
    static parseScale(scale) {
        let defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
        const [x = defaultValue, y = x] = toNumbers(scale);
        return new Point(x, y);
    }
    static parsePath(path) {
        const points = toNumbers(path);
        const len = points.length;
        const pathPoints = [];
        for(let i = 0; i < len; i += 2){
            pathPoints.push(new Point(points[i], points[i + 1]));
        }
        return pathPoints;
    }
    angleTo(point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }
    applyTransform(transform) {
        const { x , y  } = this;
        const xp = x * transform[0] + y * transform[2] + transform[4];
        const yp = x * transform[1] + y * transform[3] + transform[5];
        this.x = xp;
        this.y = yp;
    }
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Mouse {
    isWorking() {
        return this.working;
    }
    start() {
        if (this.working) {
            return;
        }
        const { screen , onClick , onMouseMove  } = this;
        const canvas = screen.ctx.canvas;
        canvas.onclick = onClick;
        canvas.onmousemove = onMouseMove;
        this.working = true;
    }
    stop() {
        if (!this.working) {
            return;
        }
        const canvas = this.screen.ctx.canvas;
        this.working = false;
        canvas.onclick = null;
        canvas.onmousemove = null;
    }
    hasEvents() {
        return this.working && this.events.length > 0;
    }
    runEvents() {
        if (!this.working) {
            return;
        }
        const { screen: document , events , eventElements  } = this;
        const { style  } = document.ctx.canvas;
        let element;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (style) {
            style.cursor = '';
        }
        events.forEach((param, i)=>{
            let { run  } = param;
            element = eventElements[i];
            while(element){
                run(element);
                element = element.parent;
            }
        });
        // done running, clear
        this.events = [];
        this.eventElements = [];
    }
    checkPath(element, ctx) {
        if (!this.working || !ctx) {
            return;
        }
        const { events , eventElements  } = this;
        events.forEach((param, i)=>{
            let { x , y  } = param;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!eventElements[i] && ctx.isPointInPath && ctx.isPointInPath(x, y)) {
                eventElements[i] = element;
            }
        });
    }
    checkBoundingBox(element, boundingBox) {
        if (!this.working || !boundingBox) {
            return;
        }
        const { events , eventElements  } = this;
        events.forEach((param, i)=>{
            let { x , y  } = param;
            if (!eventElements[i] && boundingBox.isPointInBox(x, y)) {
                eventElements[i] = element;
            }
        });
    }
    mapXY(x, y) {
        const { window , ctx  } = this.screen;
        const point = new Point(x, y);
        let element = ctx.canvas;
        while(element){
            point.x -= element.offsetLeft;
            point.y -= element.offsetTop;
            element = element.offsetParent;
        }
        if (window === null || window === void 0 ? void 0 : window.scrollX) {
            point.x += window.scrollX;
        }
        if (window === null || window === void 0 ? void 0 : window.scrollY) {
            point.y += window.scrollY;
        }
        return point;
    }
    onClick(event) {
        const { x , y  } = this.mapXY(event.clientX, event.clientY);
        this.events.push({
            type: 'onclick',
            x,
            y,
            run (eventTarget) {
                if (eventTarget.onClick) {
                    eventTarget.onClick();
                }
            }
        });
    }
    onMouseMove(event) {
        const { x , y  } = this.mapXY(event.clientX, event.clientY);
        this.events.push({
            type: 'onmousemove',
            x,
            y,
            run (eventTarget) {
                if (eventTarget.onMouseMove) {
                    eventTarget.onMouseMove();
                }
            }
        });
    }
    constructor(screen){
        this.screen = screen;
        this.working = false;
        this.events = [];
        this.eventElements = [];
        this.onClick = this.onClick.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }
}

const defaultWindow = typeof window !== 'undefined' ? window : null;
const defaultFetch$1 = typeof fetch !== 'undefined' ? fetch.bind(undefined) // `fetch` depends on context: `someObject.fetch(...)` will throw error.
 : undefined;
class Screen {
    wait(checker) {
        this.waits.push(checker);
    }
    ready() {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!this.readyPromise) {
            return Promise.resolve();
        }
        return this.readyPromise;
    }
    isReady() {
        if (this.isReadyLock) {
            return true;
        }
        const isReadyLock = this.waits.every((_)=>_()
        );
        if (isReadyLock) {
            this.waits = [];
            if (this.resolveReady) {
                this.resolveReady();
            }
        }
        this.isReadyLock = isReadyLock;
        return isReadyLock;
    }
    setDefaults(ctx) {
        // initial values and defaults
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 4;
    }
    setViewBox(param) {
        let { document , ctx , aspectRatio , width , desiredWidth , height , desiredHeight , minX =0 , minY =0 , refX , refY , clip =false , clipX =0 , clipY =0  } = param;
        // aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
        const cleanAspectRatio = compressSpaces(aspectRatio).replace(/^defer\s/, '') // ignore defer
        ;
        const [aspectRatioAlign, aspectRatioMeetOrSlice] = cleanAspectRatio.split(' ');
        const align = aspectRatioAlign || 'xMidYMid';
        const meetOrSlice = aspectRatioMeetOrSlice || 'meet';
        // calculate scale
        const scaleX = width / desiredWidth;
        const scaleY = height / desiredHeight;
        const scaleMin = Math.min(scaleX, scaleY);
        const scaleMax = Math.max(scaleX, scaleY);
        let finalDesiredWidth = desiredWidth;
        let finalDesiredHeight = desiredHeight;
        if (meetOrSlice === 'meet') {
            finalDesiredWidth *= scaleMin;
            finalDesiredHeight *= scaleMin;
        }
        if (meetOrSlice === 'slice') {
            finalDesiredWidth *= scaleMax;
            finalDesiredHeight *= scaleMax;
        }
        const refXProp = new Property(document, 'refX', refX);
        const refYProp = new Property(document, 'refY', refY);
        const hasRefs = refXProp.hasValue() && refYProp.hasValue();
        if (hasRefs) {
            ctx.translate(-scaleMin * refXProp.getPixels('x'), -scaleMin * refYProp.getPixels('y'));
        }
        if (clip) {
            const scaledClipX = scaleMin * clipX;
            const scaledClipY = scaleMin * clipY;
            ctx.beginPath();
            ctx.moveTo(scaledClipX, scaledClipY);
            ctx.lineTo(width, scaledClipY);
            ctx.lineTo(width, height);
            ctx.lineTo(scaledClipX, height);
            ctx.closePath();
            ctx.clip();
        }
        if (!hasRefs) {
            const isMeetMinY = meetOrSlice === 'meet' && scaleMin === scaleY;
            const isSliceMaxY = meetOrSlice === 'slice' && scaleMax === scaleY;
            const isMeetMinX = meetOrSlice === 'meet' && scaleMin === scaleX;
            const isSliceMaxX = meetOrSlice === 'slice' && scaleMax === scaleX;
            if (align.startsWith('xMid') && (isMeetMinY || isSliceMaxY)) {
                ctx.translate(width / 2 - finalDesiredWidth / 2, 0);
            }
            if (align.endsWith('YMid') && (isMeetMinX || isSliceMaxX)) {
                ctx.translate(0, height / 2 - finalDesiredHeight / 2);
            }
            if (align.startsWith('xMax') && (isMeetMinY || isSliceMaxY)) {
                ctx.translate(width - finalDesiredWidth, 0);
            }
            if (align.endsWith('YMax') && (isMeetMinX || isSliceMaxX)) {
                ctx.translate(0, height - finalDesiredHeight);
            }
        }
        // scale
        switch(true){
            case align === 'none':
                ctx.scale(scaleX, scaleY);
                break;
            case meetOrSlice === 'meet':
                ctx.scale(scaleMin, scaleMin);
                break;
            case meetOrSlice === 'slice':
                ctx.scale(scaleMax, scaleMax);
                break;
        }
        // translate
        ctx.translate(-minX, -minY);
    }
    start(element) {
        let { enableRedraw =false , ignoreMouse =false , ignoreAnimation =false , ignoreDimensions =false , ignoreClear =false , forceRedraw , scaleWidth , scaleHeight , offsetX , offsetY  } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        const { mouse  } = this;
        const frameDuration = 1000 / Screen.FRAMERATE;
        this.frameDuration = frameDuration;
        this.readyPromise = new Promise((resolve)=>{
            this.resolveReady = resolve;
        });
        if (this.isReady()) {
            this.render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY);
        }
        if (!enableRedraw) {
            return;
        }
        let now = Date.now();
        let then = now;
        let delta = 0;
        const tick = ()=>{
            now = Date.now();
            delta = now - then;
            if (delta >= frameDuration) {
                then = now - delta % frameDuration;
                if (this.shouldUpdate(ignoreAnimation, forceRedraw)) {
                    this.render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY);
                    mouse.runEvents();
                }
            }
            this.intervalId = raf__WEBPACK_IMPORTED_MODULE_0__(tick);
        };
        if (!ignoreMouse) {
            mouse.start();
        }
        this.intervalId = raf__WEBPACK_IMPORTED_MODULE_0__(tick);
    }
    stop() {
        if (this.intervalId) {
            raf__WEBPACK_IMPORTED_MODULE_0__.cancel(this.intervalId);
            this.intervalId = null;
        }
        this.mouse.stop();
    }
    shouldUpdate(ignoreAnimation, forceRedraw) {
        // need update from animations?
        if (!ignoreAnimation) {
            const { frameDuration  } = this;
            const shouldUpdate1 = this.animations.reduce((shouldUpdate, animation)=>animation.update(frameDuration) || shouldUpdate
            , false);
            if (shouldUpdate1) {
                return true;
            }
        }
        // need update from redraw?
        if (typeof forceRedraw === 'function' && forceRedraw()) {
            return true;
        }
        if (!this.isReadyLock && this.isReady()) {
            return true;
        }
        // need update from mouse events?
        if (this.mouse.hasEvents()) {
            return true;
        }
        return false;
    }
    render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY) {
        const { viewPort , ctx , isFirstRender  } = this;
        const canvas = ctx.canvas;
        viewPort.clear();
        if (canvas.width && canvas.height) {
            viewPort.setCurrent(canvas.width, canvas.height);
        }
        const widthStyle = element.getStyle('width');
        const heightStyle = element.getStyle('height');
        if (!ignoreDimensions && (isFirstRender || typeof scaleWidth !== 'number' && typeof scaleHeight !== 'number')) {
            // set canvas size
            if (widthStyle.hasValue()) {
                canvas.width = widthStyle.getPixels('x');
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (canvas.style) {
                    canvas.style.width = "".concat(canvas.width, "px");
                }
            }
            if (heightStyle.hasValue()) {
                canvas.height = heightStyle.getPixels('y');
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (canvas.style) {
                    canvas.style.height = "".concat(canvas.height, "px");
                }
            }
        }
        let cWidth = canvas.clientWidth || canvas.width;
        let cHeight = canvas.clientHeight || canvas.height;
        if (ignoreDimensions && widthStyle.hasValue() && heightStyle.hasValue()) {
            cWidth = widthStyle.getPixels('x');
            cHeight = heightStyle.getPixels('y');
        }
        viewPort.setCurrent(cWidth, cHeight);
        if (typeof offsetX === 'number') {
            element.getAttribute('x', true).setValue(offsetX);
        }
        if (typeof offsetY === 'number') {
            element.getAttribute('y', true).setValue(offsetY);
        }
        if (typeof scaleWidth === 'number' || typeof scaleHeight === 'number') {
            const viewBox = toNumbers(element.getAttribute('viewBox').getString());
            let xRatio = 0;
            let yRatio = 0;
            if (typeof scaleWidth === 'number') {
                const widthStyle = element.getStyle('width');
                if (widthStyle.hasValue()) {
                    xRatio = widthStyle.getPixels('x') / scaleWidth;
                } else if (viewBox[2] && !isNaN(viewBox[2])) {
                    xRatio = viewBox[2] / scaleWidth;
                }
            }
            if (typeof scaleHeight === 'number') {
                const heightStyle = element.getStyle('height');
                if (heightStyle.hasValue()) {
                    yRatio = heightStyle.getPixels('y') / scaleHeight;
                } else if (viewBox[3] && !isNaN(viewBox[3])) {
                    yRatio = viewBox[3] / scaleHeight;
                }
            }
            if (!xRatio) {
                xRatio = yRatio;
            }
            if (!yRatio) {
                yRatio = xRatio;
            }
            element.getAttribute('width', true).setValue(scaleWidth);
            element.getAttribute('height', true).setValue(scaleHeight);
            const transformStyle = element.getStyle('transform', true, true);
            transformStyle.setValue("".concat(transformStyle.getString(), " scale(").concat(1 / xRatio, ", ").concat(1 / yRatio, ")"));
        }
        // clear and render
        if (!ignoreClear) {
            ctx.clearRect(0, 0, cWidth, cHeight);
        }
        element.render(ctx);
        if (isFirstRender) {
            this.isFirstRender = false;
        }
    }
    constructor(ctx, { fetch =defaultFetch$1 , window =defaultWindow  } = {}){
        this.ctx = ctx;
        this.viewPort = new ViewPort();
        this.mouse = new Mouse(this);
        this.animations = [];
        this.waits = [];
        this.frameDuration = 0;
        this.isReadyLock = false;
        this.isFirstRender = true;
        this.intervalId = null;
        this.window = window;
        if (!fetch) {
            throw new Error("Can't find 'fetch' in 'globalThis', please provide it via options");
        }
        this.fetch = fetch;
    }
}
Screen.defaultWindow = defaultWindow;
Screen.defaultFetch = defaultFetch$1;
Screen.FRAMERATE = 30;
Screen.MAX_VIRTUAL_PIXELS = 30000;

const { defaultFetch  } = Screen;
const DefaultDOMParser = typeof DOMParser !== 'undefined' ? DOMParser : undefined;
class Parser {
    async parse(resource) {
        if (resource.startsWith('<')) {
            return this.parseFromString(resource);
        }
        return this.load(resource);
    }
    parseFromString(xml) {
        const parser = new this.DOMParser();
        try {
            return this.checkDocument(parser.parseFromString(xml, 'image/svg+xml'));
        } catch (err) {
            return this.checkDocument(parser.parseFromString(xml, 'text/xml'));
        }
    }
    checkDocument(document) {
        const parserError = document.getElementsByTagName('parsererror')[0];
        if (parserError) {
            throw new Error(parserError.textContent || 'Unknown parse error');
        }
        return document;
    }
    async load(url) {
        const response = await this.fetch(url);
        const xml = await response.text();
        return this.parseFromString(xml);
    }
    constructor({ fetch =defaultFetch , DOMParser =DefaultDOMParser  } = {}){
        if (!fetch) {
            throw new Error("Can't find 'fetch' in 'globalThis', please provide it via options");
        }
        if (!DOMParser) {
            throw new Error("Can't find 'DOMParser' in 'globalThis', please provide it via options");
        }
        this.fetch = fetch;
        this.DOMParser = DOMParser;
    }
}

class Translate {
    apply(ctx) {
        const { x , y  } = this.point;
        ctx.translate(x || 0, y || 0);
    }
    unapply(ctx) {
        const { x , y  } = this.point;
        ctx.translate(-1 * x || 0, -1 * y || 0);
    }
    applyToPoint(point) {
        const { x , y  } = this.point;
        point.applyTransform([
            1,
            0,
            0,
            1,
            x || 0,
            y || 0
        ]);
    }
    constructor(_, point){
        this.type = 'translate';
        this.point = Point.parse(point);
    }
}

class Rotate {
    apply(ctx) {
        const { cx , cy , originX , originY , angle  } = this;
        const tx = cx + originX.getPixels('x');
        const ty = cy + originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.rotate(angle.getRadians());
        ctx.translate(-tx, -ty);
    }
    unapply(ctx) {
        const { cx , cy , originX , originY , angle  } = this;
        const tx = cx + originX.getPixels('x');
        const ty = cy + originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.rotate(-1 * angle.getRadians());
        ctx.translate(-tx, -ty);
    }
    applyToPoint(point) {
        const { cx , cy , angle  } = this;
        const rad = angle.getRadians();
        point.applyTransform([
            1,
            0,
            0,
            1,
            cx || 0,
            cy || 0 // this.p.y
        ]);
        point.applyTransform([
            Math.cos(rad),
            Math.sin(rad),
            -Math.sin(rad),
            Math.cos(rad),
            0,
            0
        ]);
        point.applyTransform([
            1,
            0,
            0,
            1,
            -cx || 0,
            -cy || 0 // -this.p.y
        ]);
    }
    constructor(document, rotate, transformOrigin){
        this.type = 'rotate';
        const numbers = toNumbers(rotate);
        this.angle = new Property(document, 'angle', numbers[0]);
        this.originX = transformOrigin[0];
        this.originY = transformOrigin[1];
        this.cx = numbers[1] || 0;
        this.cy = numbers[2] || 0;
    }
}

class Scale {
    apply(ctx) {
        const { scale: { x , y  } , originX , originY  } = this;
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.scale(x, y || x);
        ctx.translate(-tx, -ty);
    }
    unapply(ctx) {
        const { scale: { x , y  } , originX , originY  } = this;
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.scale(1 / x, 1 / y || x);
        ctx.translate(-tx, -ty);
    }
    applyToPoint(point) {
        const { x , y  } = this.scale;
        point.applyTransform([
            x || 0,
            0,
            0,
            y || 0,
            0,
            0
        ]);
    }
    constructor(_, scale, transformOrigin){
        this.type = 'scale';
        const scaleSize = Point.parseScale(scale);
        // Workaround for node-canvas
        if (scaleSize.x === 0 || scaleSize.y === 0) {
            scaleSize.x = PSEUDO_ZERO;
            scaleSize.y = PSEUDO_ZERO;
        }
        this.scale = scaleSize;
        this.originX = transformOrigin[0];
        this.originY = transformOrigin[1];
    }
}

class Matrix {
    apply(ctx) {
        const { originX , originY , matrix  } = this;
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
        ctx.translate(-tx, -ty);
    }
    unapply(ctx) {
        const { originX , originY , matrix  } = this;
        const a = matrix[0];
        const b = matrix[2];
        const c = matrix[4];
        const d = matrix[1];
        const e = matrix[3];
        const f = matrix[5];
        const g = 0;
        const h = 0;
        const i = 1;
        const det = 1 / (a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.transform(det * (e * i - f * h), det * (f * g - d * i), det * (c * h - b * i), det * (a * i - c * g), det * (b * f - c * e), det * (c * d - a * f));
        ctx.translate(-tx, -ty);
    }
    applyToPoint(point) {
        point.applyTransform(this.matrix);
    }
    constructor(_, matrix, transformOrigin){
        this.type = 'matrix';
        this.matrix = toMatrixValue(matrix);
        this.originX = transformOrigin[0];
        this.originY = transformOrigin[1];
    }
}

class Skew extends Matrix {
    constructor(document, skew, transformOrigin){
        super(document, skew, transformOrigin);
        this.type = 'skew';
        this.angle = new Property(document, 'angle', skew);
    }
}

class SkewX extends Skew {
    constructor(document, skew, transformOrigin){
        super(document, skew, transformOrigin);
        this.type = 'skewX';
        this.matrix = [
            1,
            0,
            Math.tan(this.angle.getRadians()),
            1,
            0,
            0
        ];
    }
}

class SkewY extends Skew {
    constructor(document, skew, transformOrigin){
        super(document, skew, transformOrigin);
        this.type = 'skewY';
        this.matrix = [
            1,
            Math.tan(this.angle.getRadians()),
            0,
            1,
            0,
            0
        ];
    }
}

function parseTransforms(transform) {
    return compressSpaces(transform).trim().replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g, ') ').split(/\s(?=[a-z])/);
}
function parseTransform(transform) {
    const [type = '', value = ''] = transform.split('(');
    return [
        type.trim(),
        value.trim().replace(')', '')
    ];
}
class Transform {
    static fromElement(document, element) {
        const transformStyle = element.getStyle('transform', false, true);
        if (transformStyle.hasValue()) {
            const [transformOriginXProperty, transformOriginYProperty = transformOriginXProperty] = element.getStyle('transform-origin', false, true).split();
            if (transformOriginXProperty && transformOriginYProperty) {
                const transformOrigin = [
                    transformOriginXProperty,
                    transformOriginYProperty
                ];
                return new Transform(document, transformStyle.getString(), transformOrigin);
            }
        }
        return null;
    }
    apply(ctx) {
        this.transforms.forEach((transform)=>transform.apply(ctx)
        );
    }
    unapply(ctx) {
        this.transforms.forEach((transform)=>transform.unapply(ctx)
        );
    }
    // TODO: applyToPoint unused ... remove?
    applyToPoint(point) {
        this.transforms.forEach((transform)=>transform.applyToPoint(point)
        );
    }
    constructor(document, transform1, transformOrigin){
        this.document = document;
        this.transforms = [];
        const data = parseTransforms(transform1);
        data.forEach((transform)=>{
            if (transform === 'none') {
                return;
            }
            const [type, value] = parseTransform(transform);
            const TransformType = Transform.transformTypes[type];
            if (TransformType) {
                this.transforms.push(new TransformType(this.document, value, transformOrigin));
            }
        });
    }
}
Transform.transformTypes = {
    translate: Translate,
    rotate: Rotate,
    scale: Scale,
    matrix: Matrix,
    skewX: SkewX,
    skewY: SkewY
};

class Element {
    getAttribute(name) {
        let createIfNotExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        const attr = this.attributes[name];
        if (!attr && createIfNotExists) {
            const attr = new Property(this.document, name, '');
            this.attributes[name] = attr;
            return attr;
        }
        return attr || Property.empty(this.document);
    }
    getHrefAttribute() {
        let href;
        for(const key in this.attributes){
            if (key === 'href' || key.endsWith(':href')) {
                href = this.attributes[key];
                break;
            }
        }
        return href || Property.empty(this.document);
    }
    getStyle(name) {
        let createIfNotExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, skipAncestors = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        const style = this.styles[name];
        if (style) {
            return style;
        }
        const attr = this.getAttribute(name);
        if (attr.hasValue()) {
            this.styles[name] = attr // move up to me to cache
            ;
            return attr;
        }
        if (!skipAncestors) {
            const { parent  } = this;
            if (parent) {
                const parentStyle = parent.getStyle(name);
                if (parentStyle.hasValue()) {
                    return parentStyle;
                }
            }
        }
        if (createIfNotExists) {
            const style = new Property(this.document, name, '');
            this.styles[name] = style;
            return style;
        }
        return Property.empty(this.document);
    }
    render(ctx) {
        // don't render display=none
        // don't render visibility=hidden
        if (this.getStyle('display').getString() === 'none' || this.getStyle('visibility').getString() === 'hidden') {
            return;
        }
        ctx.save();
        if (this.getStyle('mask').hasValue()) {
            const mask = this.getStyle('mask').getDefinition();
            if (mask) {
                this.applyEffects(ctx);
                mask.apply(ctx, this);
            }
        } else if (this.getStyle('filter').getValue('none') !== 'none') {
            const filter = this.getStyle('filter').getDefinition();
            if (filter) {
                this.applyEffects(ctx);
                filter.apply(ctx, this);
            }
        } else {
            this.setContext(ctx);
            this.renderChildren(ctx);
            this.clearContext(ctx);
        }
        ctx.restore();
    }
    setContext(_) {
    // NO RENDER
    }
    applyEffects(ctx) {
        // transform
        const transform = Transform.fromElement(this.document, this);
        if (transform) {
            transform.apply(ctx);
        }
        // clip
        const clipPathStyleProp = this.getStyle('clip-path', false, true);
        if (clipPathStyleProp.hasValue()) {
            const clip = clipPathStyleProp.getDefinition();
            if (clip) {
                clip.apply(ctx);
            }
        }
    }
    clearContext(_) {
    // NO RENDER
    }
    renderChildren(ctx) {
        this.children.forEach((child)=>{
            child.render(ctx);
        });
    }
    addChild(childNode) {
        const child = childNode instanceof Element ? childNode : this.document.createElement(childNode);
        child.parent = this;
        if (!Element.ignoreChildTypes.includes(child.type)) {
            this.children.push(child);
        }
    }
    matchesSelector(selector) {
        var ref;
        const { node  } = this;
        if (typeof node.matches === 'function') {
            return node.matches(selector);
        }
        const styleClasses = (ref = node.getAttribute) === null || ref === void 0 ? void 0 : ref.call(node, 'class');
        if (!styleClasses || styleClasses === '') {
            return false;
        }
        return styleClasses.split(' ').some((styleClass)=>".".concat(styleClass) === selector
        );
    }
    addStylesFromStyleDefinition() {
        const { styles , stylesSpecificity  } = this.document;
        let styleProp;
        for(const selector in styles){
            if (!selector.startsWith('@') && this.matchesSelector(selector)) {
                const style = styles[selector];
                const specificity = stylesSpecificity[selector];
                if (style) {
                    for(const name in style){
                        let existingSpecificity = this.stylesSpecificity[name];
                        if (typeof existingSpecificity === 'undefined') {
                            existingSpecificity = '000';
                        }
                        if (specificity && specificity >= existingSpecificity) {
                            styleProp = style[name];
                            if (styleProp) {
                                this.styles[name] = styleProp;
                            }
                            this.stylesSpecificity[name] = specificity;
                        }
                    }
                }
            }
        }
    }
    removeStyles(element, ignoreStyles) {
        const toRestore1 = ignoreStyles.reduce((toRestore, name)=>{
            const styleProp = element.getStyle(name);
            if (!styleProp.hasValue()) {
                return toRestore;
            }
            const value = styleProp.getString();
            styleProp.setValue('');
            return [
                ...toRestore,
                [
                    name,
                    value
                ]
            ];
        }, []);
        return toRestore1;
    }
    restoreStyles(element, styles) {
        styles.forEach((param)=>{
            let [name, value] = param;
            element.getStyle(name, true).setValue(value);
        });
    }
    isFirstChild() {
        var ref;
        return ((ref = this.parent) === null || ref === void 0 ? void 0 : ref.children.indexOf(this)) === 0;
    }
    constructor(document, node, captureTextNodes = false){
        this.document = document;
        this.node = node;
        this.captureTextNodes = captureTextNodes;
        this.type = '';
        this.attributes = {};
        this.styles = {};
        this.stylesSpecificity = {};
        this.animationFrozen = false;
        this.animationFrozenValue = '';
        this.parent = null;
        this.children = [];
        if (!node || node.nodeType !== 1) {
            return;
        }
        // add attributes
        Array.from(node.attributes).forEach((attribute)=>{
            const nodeName = normalizeAttributeName(attribute.nodeName);
            this.attributes[nodeName] = new Property(document, nodeName, attribute.value);
        });
        this.addStylesFromStyleDefinition();
        // add inline styles
        if (this.getAttribute('style').hasValue()) {
            const styles = this.getAttribute('style').getString().split(';').map((_)=>_.trim()
            );
            styles.forEach((style)=>{
                if (!style) {
                    return;
                }
                const [name, value] = style.split(':').map((_)=>_.trim()
                );
                if (name) {
                    this.styles[name] = new Property(document, name, value);
                }
            });
        }
        const { definitions  } = document;
        const id = this.getAttribute('id');
        // add id
        if (id.hasValue()) {
            if (!definitions[id.getString()]) {
                definitions[id.getString()] = this;
            }
        }
        Array.from(node.childNodes).forEach((childNode)=>{
            if (childNode.nodeType === 1) {
                this.addChild(childNode) // ELEMENT_NODE
                ;
            } else if (captureTextNodes && (childNode.nodeType === 3 || childNode.nodeType === 4)) {
                const textNode = document.createTextNode(childNode);
                if (textNode.getText().length > 0) {
                    this.addChild(textNode) // TEXT_NODE
                    ;
                }
            }
        });
    }
}
Element.ignoreChildTypes = [
    'title'
];

class UnknownElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
    }
}

function wrapFontFamily(fontFamily) {
    const trimmed = fontFamily.trim();
    return /^('|")/.test(trimmed) ? trimmed : "\"".concat(trimmed, "\"");
}
function prepareFontFamily(fontFamily) {
    return typeof process === 'undefined' ? fontFamily : fontFamily.trim().split(',').map(wrapFontFamily).join(',');
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
 * @param fontStyle
 * @returns CSS font style.
 */ function prepareFontStyle(fontStyle) {
    if (!fontStyle) {
        return '';
    }
    const targetFontStyle = fontStyle.trim().toLowerCase();
    switch(targetFontStyle){
        case 'normal':
        case 'italic':
        case 'oblique':
        case 'inherit':
        case 'initial':
        case 'unset':
            return targetFontStyle;
        default:
            if (/^oblique\s+(-|)\d+deg$/.test(targetFontStyle)) {
                return targetFontStyle;
            }
            return '';
    }
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
 * @param fontWeight
 * @returns CSS font weight.
 */ function prepareFontWeight(fontWeight) {
    if (!fontWeight) {
        return '';
    }
    const targetFontWeight = fontWeight.trim().toLowerCase();
    switch(targetFontWeight){
        case 'normal':
        case 'bold':
        case 'lighter':
        case 'bolder':
        case 'inherit':
        case 'initial':
        case 'unset':
            return targetFontWeight;
        default:
            if (/^[\d.]+$/.test(targetFontWeight)) {
                return targetFontWeight;
            }
            return '';
    }
}
class Font {
    static parse() {
        let font = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '', inherit = arguments.length > 1 ? arguments[1] : void 0;
        let fontStyle = '';
        let fontVariant = '';
        let fontWeight = '';
        let fontSize = '';
        let fontFamily = '';
        const parts = compressSpaces(font).trim().split(' ');
        const set = {
            fontSize: false,
            fontStyle: false,
            fontWeight: false,
            fontVariant: false
        };
        parts.forEach((part)=>{
            switch(true){
                case !set.fontStyle && Font.styles.includes(part):
                    if (part !== 'inherit') {
                        fontStyle = part;
                    }
                    set.fontStyle = true;
                    break;
                case !set.fontVariant && Font.variants.includes(part):
                    if (part !== 'inherit') {
                        fontVariant = part;
                    }
                    set.fontStyle = true;
                    set.fontVariant = true;
                    break;
                case !set.fontWeight && Font.weights.includes(part):
                    if (part !== 'inherit') {
                        fontWeight = part;
                    }
                    set.fontStyle = true;
                    set.fontVariant = true;
                    set.fontWeight = true;
                    break;
                case !set.fontSize:
                    if (part !== 'inherit') {
                        fontSize = part.split('/')[0] || '';
                    }
                    set.fontStyle = true;
                    set.fontVariant = true;
                    set.fontWeight = true;
                    set.fontSize = true;
                    break;
                default:
                    if (part !== 'inherit') {
                        fontFamily += part;
                    }
            }
        });
        return new Font(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit);
    }
    toString() {
        return [
            prepareFontStyle(this.fontStyle),
            this.fontVariant,
            prepareFontWeight(this.fontWeight),
            this.fontSize,
            // Wrap fontFamily only on nodejs and only for canvas.ctx
            prepareFontFamily(this.fontFamily)
        ].join(' ').trim();
    }
    constructor(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit){
        const inheritFont = inherit ? typeof inherit === 'string' ? Font.parse(inherit) : inherit : {};
        this.fontFamily = fontFamily || inheritFont.fontFamily;
        this.fontSize = fontSize || inheritFont.fontSize;
        this.fontStyle = fontStyle || inheritFont.fontStyle;
        this.fontWeight = fontWeight || inheritFont.fontWeight;
        this.fontVariant = fontVariant || inheritFont.fontVariant;
    }
}
Font.styles = 'normal|italic|oblique|inherit';
Font.variants = 'normal|small-caps|inherit';
Font.weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';

class BoundingBox {
    get x() {
        return this.x1;
    }
    get y() {
        return this.y1;
    }
    get width() {
        return this.x2 - this.x1;
    }
    get height() {
        return this.y2 - this.y1;
    }
    addPoint(x, y) {
        if (typeof x !== 'undefined') {
            if (isNaN(this.x1) || isNaN(this.x2)) {
                this.x1 = x;
                this.x2 = x;
            }
            if (x < this.x1) {
                this.x1 = x;
            }
            if (x > this.x2) {
                this.x2 = x;
            }
        }
        if (typeof y !== 'undefined') {
            if (isNaN(this.y1) || isNaN(this.y2)) {
                this.y1 = y;
                this.y2 = y;
            }
            if (y < this.y1) {
                this.y1 = y;
            }
            if (y > this.y2) {
                this.y2 = y;
            }
        }
    }
    addX(x) {
        this.addPoint(x, 0);
    }
    addY(y) {
        this.addPoint(0, y);
    }
    addBoundingBox(boundingBox) {
        if (!boundingBox) {
            return;
        }
        const { x1 , y1 , x2 , y2  } = boundingBox;
        this.addPoint(x1, y1);
        this.addPoint(x2, y2);
    }
    sumCubic(t, p0, p1, p2, p3) {
        return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
    }
    bezierCurveAdd(forX, p0, p1, p2, p3) {
        const b = 6 * p0 - 12 * p1 + 6 * p2;
        const a = -3 * p0 + 9 * p1 - 9 * p2 + 3 * p3;
        const c = 3 * p1 - 3 * p0;
        if (a === 0) {
            if (b === 0) {
                return;
            }
            const t = -c / b;
            if (0 < t && t < 1) {
                if (forX) {
                    this.addX(this.sumCubic(t, p0, p1, p2, p3));
                } else {
                    this.addY(this.sumCubic(t, p0, p1, p2, p3));
                }
            }
            return;
        }
        const b2ac = Math.pow(b, 2) - 4 * c * a;
        if (b2ac < 0) {
            return;
        }
        const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
        if (0 < t1 && t1 < 1) {
            if (forX) {
                this.addX(this.sumCubic(t1, p0, p1, p2, p3));
            } else {
                this.addY(this.sumCubic(t1, p0, p1, p2, p3));
            }
        }
        const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
        if (0 < t2 && t2 < 1) {
            if (forX) {
                this.addX(this.sumCubic(t2, p0, p1, p2, p3));
            } else {
                this.addY(this.sumCubic(t2, p0, p1, p2, p3));
            }
        }
    }
    // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    addBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
        this.addPoint(p0x, p0y);
        this.addPoint(p3x, p3y);
        this.bezierCurveAdd(true, p0x, p1x, p2x, p3x);
        this.bezierCurveAdd(false, p0y, p1y, p2y, p3y);
    }
    addQuadraticCurve(p0x, p0y, p1x, p1y, p2x, p2y) {
        const cp1x = p0x + 2 / 3 * (p1x - p0x) // CP1 = QP0 + 2/3 *(QP1-QP0)
        ;
        const cp1y = p0y + 2 / 3 * (p1y - p0y) // CP1 = QP0 + 2/3 *(QP1-QP0)
        ;
        const cp2x = cp1x + 1 / 3 * (p2x - p0x) // CP2 = CP1 + 1/3 *(QP2-QP0)
        ;
        const cp2y = cp1y + 1 / 3 * (p2y - p0y) // CP2 = CP1 + 1/3 *(QP2-QP0)
        ;
        this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
    }
    isPointInBox(x, y) {
        const { x1 , y1 , x2 , y2  } = this;
        return x1 <= x && x <= x2 && y1 <= y && y <= y2;
    }
    constructor(x1 = Number.NaN, y1 = Number.NaN, x2 = Number.NaN, y2 = Number.NaN){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.addPoint(x1, y1);
        this.addPoint(x2, y2);
    }
}

class RenderedElement extends Element {
    calculateOpacity() {
        let opacity = 1;
        // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
        let element = this;
        while(element){
            const opacityStyle = element.getStyle('opacity', false, true) // no ancestors on style call
            ;
            if (opacityStyle.hasValue(true)) {
                opacity *= opacityStyle.getNumber();
            }
            element = element.parent;
        }
        return opacity;
    }
    setContext(ctx) {
        let fromMeasure = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        if (!fromMeasure) {
            // fill
            const fillStyleProp = this.getStyle('fill');
            const fillOpacityStyleProp = this.getStyle('fill-opacity');
            const strokeStyleProp = this.getStyle('stroke');
            const strokeOpacityProp = this.getStyle('stroke-opacity');
            if (fillStyleProp.isUrlDefinition()) {
                const fillStyle = fillStyleProp.getFillStyleDefinition(this, fillOpacityStyleProp);
                if (fillStyle) {
                    ctx.fillStyle = fillStyle;
                }
            } else if (fillStyleProp.hasValue()) {
                if (fillStyleProp.getString() === 'currentColor') {
                    fillStyleProp.setValue(this.getStyle('color').getColor());
                }
                const fillStyle = fillStyleProp.getColor();
                if (fillStyle !== 'inherit') {
                    ctx.fillStyle = fillStyle === 'none' ? 'rgba(0,0,0,0)' : fillStyle;
                }
            }
            if (fillOpacityStyleProp.hasValue()) {
                const fillStyle = new Property(this.document, 'fill', ctx.fillStyle).addOpacity(fillOpacityStyleProp).getColor();
                ctx.fillStyle = fillStyle;
            }
            // stroke
            if (strokeStyleProp.isUrlDefinition()) {
                const strokeStyle = strokeStyleProp.getFillStyleDefinition(this, strokeOpacityProp);
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                }
            } else if (strokeStyleProp.hasValue()) {
                if (strokeStyleProp.getString() === 'currentColor') {
                    strokeStyleProp.setValue(this.getStyle('color').getColor());
                }
                const strokeStyle = strokeStyleProp.getString();
                if (strokeStyle !== 'inherit') {
                    ctx.strokeStyle = strokeStyle === 'none' ? 'rgba(0,0,0,0)' : strokeStyle;
                }
            }
            if (strokeOpacityProp.hasValue()) {
                const strokeStyle = new Property(this.document, 'stroke', ctx.strokeStyle).addOpacity(strokeOpacityProp).getString();
                ctx.strokeStyle = strokeStyle;
            }
            const strokeWidthStyleProp = this.getStyle('stroke-width');
            if (strokeWidthStyleProp.hasValue()) {
                const newLineWidth = strokeWidthStyleProp.getPixels();
                ctx.lineWidth = !newLineWidth ? PSEUDO_ZERO // browsers don't respect 0 (or node-canvas? :-)
                 : newLineWidth;
            }
            const strokeLinecapStyleProp = this.getStyle('stroke-linecap');
            const strokeLinejoinStyleProp = this.getStyle('stroke-linejoin');
            const strokeMiterlimitProp = this.getStyle('stroke-miterlimit');
            // NEED TEST
            // const pointOrderStyleProp = this.getStyle('paint-order');
            const strokeDasharrayStyleProp = this.getStyle('stroke-dasharray');
            const strokeDashoffsetProp = this.getStyle('stroke-dashoffset');
            if (strokeLinecapStyleProp.hasValue()) {
                ctx.lineCap = strokeLinecapStyleProp.getString();
            }
            if (strokeLinejoinStyleProp.hasValue()) {
                ctx.lineJoin = strokeLinejoinStyleProp.getString();
            }
            if (strokeMiterlimitProp.hasValue()) {
                ctx.miterLimit = strokeMiterlimitProp.getNumber();
            }
            // NEED TEST
            // if (pointOrderStyleProp.hasValue()) {
            //   // ?
            //   ctx.paintOrder = pointOrderStyleProp.getValue();
            // }
            if (strokeDasharrayStyleProp.hasValue() && strokeDasharrayStyleProp.getString() !== 'none') {
                const gaps = toNumbers(strokeDasharrayStyleProp.getString());
                if (typeof ctx.setLineDash !== 'undefined') {
                    ctx.setLineDash(gaps);
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.webkitLineDash !== 'undefined') {
                    // @ts-expect-error Handle browser prefix.
                    ctx.webkitLineDash = gaps;
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.mozDash !== 'undefined' && !(gaps.length === 1 && gaps[0] === 0)) {
                    // @ts-expect-error Handle browser prefix.
                    ctx.mozDash = gaps;
                }
                const offset = strokeDashoffsetProp.getPixels();
                if (typeof ctx.lineDashOffset !== 'undefined') {
                    ctx.lineDashOffset = offset;
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.webkitLineDashOffset !== 'undefined') {
                    // @ts-expect-error Handle browser prefix.
                    ctx.webkitLineDashOffset = offset;
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.mozDashOffset !== 'undefined') {
                    // @ts-expect-error Handle browser prefix.
                    ctx.mozDashOffset = offset;
                }
            }
        }
        // font
        this.modifiedEmSizeStack = false;
        if (typeof ctx.font !== 'undefined') {
            const fontStyleProp = this.getStyle('font');
            const fontStyleStyleProp = this.getStyle('font-style');
            const fontVariantStyleProp = this.getStyle('font-variant');
            const fontWeightStyleProp = this.getStyle('font-weight');
            const fontSizeStyleProp = this.getStyle('font-size');
            const fontFamilyStyleProp = this.getStyle('font-family');
            const font = new Font(fontStyleStyleProp.getString(), fontVariantStyleProp.getString(), fontWeightStyleProp.getString(), fontSizeStyleProp.hasValue() ? "".concat(fontSizeStyleProp.getPixels(true), "px") : '', fontFamilyStyleProp.getString(), Font.parse(fontStyleProp.getString(), ctx.font));
            fontStyleStyleProp.setValue(font.fontStyle);
            fontVariantStyleProp.setValue(font.fontVariant);
            fontWeightStyleProp.setValue(font.fontWeight);
            fontSizeStyleProp.setValue(font.fontSize);
            fontFamilyStyleProp.setValue(font.fontFamily);
            ctx.font = font.toString();
            if (fontSizeStyleProp.isPixels()) {
                this.document.emSize = fontSizeStyleProp.getPixels();
                this.modifiedEmSizeStack = true;
            }
        }
        if (!fromMeasure) {
            // effects
            this.applyEffects(ctx);
            // opacity
            ctx.globalAlpha = this.calculateOpacity();
        }
    }
    clearContext(ctx) {
        super.clearContext(ctx);
        if (this.modifiedEmSizeStack) {
            this.document.popEmSize();
        }
    }
    constructor(...args){
        super(...args);
        this.modifiedEmSizeStack = false;
    }
}

class TextElement extends RenderedElement {
    setContext(ctx) {
        let fromMeasure = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        super.setContext(ctx, fromMeasure);
        const textBaseline = this.getStyle('dominant-baseline').getTextBaseline() || this.getStyle('alignment-baseline').getTextBaseline();
        if (textBaseline) {
            ctx.textBaseline = textBaseline;
        }
    }
    initializeCoordinates() {
        this.x = 0;
        this.y = 0;
        this.leafTexts = [];
        this.textChunkStart = 0;
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
    }
    getBoundingBox(ctx) {
        if (this.type !== 'text') {
            return this.getTElementBoundingBox(ctx);
        }
        // first, calculate child positions
        this.initializeCoordinates();
        this.adjustChildCoordinatesRecursive(ctx);
        let boundingBox = null;
        // then calculate bounding box
        this.children.forEach((_, i)=>{
            const childBoundingBox = this.getChildBoundingBox(ctx, this, this, i);
            if (!boundingBox) {
                boundingBox = childBoundingBox;
            } else {
                boundingBox.addBoundingBox(childBoundingBox);
            }
        });
        return boundingBox;
    }
    getFontSize() {
        const { document , parent  } = this;
        const inheritFontSize = Font.parse(document.ctx.font).fontSize;
        const fontSize = parent.getStyle('font-size').getNumber(inheritFontSize);
        return fontSize;
    }
    getTElementBoundingBox(ctx) {
        const fontSize = this.getFontSize();
        return new BoundingBox(this.x, this.y - fontSize, this.x + this.measureText(ctx), this.y);
    }
    getGlyph(font, text, i) {
        const char = text[i];
        let glyph;
        if (font.isArabic) {
            var ref;
            const len = text.length;
            const prevChar = text[i - 1];
            const nextChar = text[i + 1];
            let arabicForm = 'isolated';
            if ((i === 0 || prevChar === ' ') && i < len - 1 && nextChar !== ' ') {
                arabicForm = 'terminal';
            }
            if (i > 0 && prevChar !== ' ' && i < len - 1 && nextChar !== ' ') {
                arabicForm = 'medial';
            }
            if (i > 0 && prevChar !== ' ' && (i === len - 1 || nextChar === ' ')) {
                arabicForm = 'initial';
            }
            glyph = ((ref = font.arabicGlyphs[char]) === null || ref === void 0 ? void 0 : ref[arabicForm]) || font.glyphs[char];
        } else {
            glyph = font.glyphs[char];
        }
        if (!glyph) {
            glyph = font.missingGlyph;
        }
        return glyph;
    }
    getText() {
        return '';
    }
    getTextFromNode(node) {
        const textNode = node || this.node;
        const childNodes = Array.from(textNode.parentNode.childNodes);
        const index = childNodes.indexOf(textNode);
        const lastIndex = childNodes.length - 1;
        let text = compressSpaces(// textNode.value
        // || textNode.text
        textNode.textContent || '');
        if (index === 0) {
            text = trimLeft(text);
        }
        if (index === lastIndex) {
            text = trimRight(text);
        }
        return text;
    }
    renderChildren(ctx) {
        if (this.type !== 'text') {
            this.renderTElementChildren(ctx);
            return;
        }
        // first, calculate child positions
        this.initializeCoordinates();
        this.adjustChildCoordinatesRecursive(ctx);
        // then render
        this.children.forEach((_, i)=>{
            this.renderChild(ctx, this, this, i);
        });
        const { mouse  } = this.document.screen;
        // Do not calc bounding box if mouse is not working.
        if (mouse.isWorking()) {
            mouse.checkBoundingBox(this, this.getBoundingBox(ctx));
        }
    }
    renderTElementChildren(ctx) {
        const { document , parent  } = this;
        const renderText = this.getText();
        const customFont = parent.getStyle('font-family').getDefinition();
        if (customFont) {
            const { unitsPerEm  } = customFont.fontFace;
            const ctxFont = Font.parse(document.ctx.font);
            const fontSize = parent.getStyle('font-size').getNumber(ctxFont.fontSize);
            const fontStyle = parent.getStyle('font-style').getString(ctxFont.fontStyle);
            const scale = fontSize / unitsPerEm;
            const text = customFont.isRTL ? renderText.split('').reverse().join('') : renderText;
            const dx = toNumbers(parent.getAttribute('dx').getString());
            const len = text.length;
            for(let i = 0; i < len; i++){
                const glyph = this.getGlyph(customFont, text, i);
                ctx.translate(this.x, this.y);
                ctx.scale(scale, -scale);
                const lw = ctx.lineWidth;
                ctx.lineWidth = ctx.lineWidth * unitsPerEm / fontSize;
                if (fontStyle === 'italic') {
                    ctx.transform(1, 0, 0.4, 1, 0, 0);
                }
                glyph.render(ctx);
                if (fontStyle === 'italic') {
                    ctx.transform(1, 0, -0.4, 1, 0, 0);
                }
                ctx.lineWidth = lw;
                ctx.scale(1 / scale, -1 / scale);
                ctx.translate(-this.x, -this.y);
                this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / unitsPerEm;
                if (typeof dx[i] !== 'undefined' && !isNaN(dx[i])) {
                    this.x += dx[i];
                }
            }
            return;
        }
        const { x , y  } = this;
        // NEED TEST
        // if (ctx.paintOrder === 'stroke') {
        //   if (ctx.strokeStyle) {
        //     ctx.strokeText(renderText, x, y);
        //   }
        //   if (ctx.fillStyle) {
        //     ctx.fillText(renderText, x, y);
        //   }
        // } else {
        if (ctx.fillStyle) {
            ctx.fillText(renderText, x, y);
        }
        if (ctx.strokeStyle) {
            ctx.strokeText(renderText, x, y);
        }
    // }
    }
    applyAnchoring() {
        if (this.textChunkStart >= this.leafTexts.length) {
            return;
        }
        // This is basically the "Apply anchoring" part of https://www.w3.org/TR/SVG2/text.html#TextLayoutAlgorithm.
        // The difference is that we apply the anchoring as soon as a chunk is finished. This saves some extra looping.
        // Vertical text is not supported.
        const firstElement = this.leafTexts[this.textChunkStart];
        const textAnchor = firstElement.getStyle('text-anchor').getString('start');
        const isRTL = false // we treat RTL like LTR
        ;
        let shift = 0;
        if (textAnchor === 'start' && !isRTL || textAnchor === 'end' && isRTL) {
            shift = firstElement.x - this.minX;
        } else if (textAnchor === 'end' && !isRTL || textAnchor === 'start' && isRTL) {
            shift = firstElement.x - this.maxX;
        } else {
            shift = firstElement.x - (this.minX + this.maxX) / 2;
        }
        for(let i = this.textChunkStart; i < this.leafTexts.length; i++){
            this.leafTexts[i].x += shift;
        }
        // start new chunk
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.textChunkStart = this.leafTexts.length;
    }
    adjustChildCoordinatesRecursive(ctx) {
        this.children.forEach((_, i)=>{
            this.adjustChildCoordinatesRecursiveCore(ctx, this, this, i);
        });
        this.applyAnchoring();
    }
    adjustChildCoordinatesRecursiveCore(ctx, textParent, parent, i1) {
        const child = parent.children[i1];
        if (child.children.length > 0) {
            child.children.forEach((_, i)=>{
                textParent.adjustChildCoordinatesRecursiveCore(ctx, textParent, child, i);
            });
        } else {
            // only leafs are relevant
            this.adjustChildCoordinates(ctx, textParent, parent, i1);
        }
    }
    adjustChildCoordinates(ctx, textParent, parent, i) {
        const child = parent.children[i];
        if (typeof child.measureText !== 'function') {
            return child;
        }
        ctx.save();
        child.setContext(ctx, true);
        const xAttr = child.getAttribute('x');
        const yAttr = child.getAttribute('y');
        const dxAttr = child.getAttribute('dx');
        const dyAttr = child.getAttribute('dy');
        const customFont = child.getStyle('font-family').getDefinition();
        const isRTL = Boolean(customFont === null || customFont === void 0 ? void 0 : customFont.isRTL);
        if (i === 0) {
            // First children inherit attributes from parent(s). Positional attributes
            // are only inherited from a parent to it's first child.
            if (!xAttr.hasValue()) {
                xAttr.setValue(child.getInheritedAttribute('x'));
            }
            if (!yAttr.hasValue()) {
                yAttr.setValue(child.getInheritedAttribute('y'));
            }
            if (!dxAttr.hasValue()) {
                dxAttr.setValue(child.getInheritedAttribute('dx'));
            }
            if (!dyAttr.hasValue()) {
                dyAttr.setValue(child.getInheritedAttribute('dy'));
            }
        }
        const width = child.measureText(ctx);
        if (isRTL) {
            textParent.x -= width;
        }
        if (xAttr.hasValue()) {
            // an "x" attribute marks the start of a new chunk
            textParent.applyAnchoring();
            child.x = xAttr.getPixels('x');
            if (dxAttr.hasValue()) {
                child.x += dxAttr.getPixels('x');
            }
        } else {
            if (dxAttr.hasValue()) {
                textParent.x += dxAttr.getPixels('x');
            }
            child.x = textParent.x;
        }
        textParent.x = child.x;
        if (!isRTL) {
            textParent.x += width;
        }
        if (yAttr.hasValue()) {
            child.y = yAttr.getPixels('y');
            if (dyAttr.hasValue()) {
                child.y += dyAttr.getPixels('y');
            }
        } else {
            if (dyAttr.hasValue()) {
                textParent.y += dyAttr.getPixels('y');
            }
            child.y = textParent.y;
        }
        textParent.y = child.y;
        // update the current chunk and it's bounds
        textParent.leafTexts.push(child);
        textParent.minX = Math.min(textParent.minX, child.x, child.x + width);
        textParent.maxX = Math.max(textParent.maxX, child.x, child.x + width);
        child.clearContext(ctx);
        ctx.restore();
        return child;
    }
    getChildBoundingBox(ctx, textParent, parent, i2) {
        const child = parent.children[i2];
        // not a text node?
        if (typeof child.getBoundingBox !== 'function') {
            return null;
        }
        const boundingBox = child.getBoundingBox(ctx);
        if (boundingBox) {
            child.children.forEach((_, i)=>{
                const childBoundingBox = textParent.getChildBoundingBox(ctx, textParent, child, i);
                boundingBox.addBoundingBox(childBoundingBox);
            });
        }
        return boundingBox;
    }
    renderChild(ctx, textParent, parent, i3) {
        const child = parent.children[i3];
        child.render(ctx);
        child.children.forEach((_, i)=>{
            textParent.renderChild(ctx, textParent, child, i);
        });
    }
    measureText(ctx) {
        const { measureCache  } = this;
        if (~measureCache) {
            return measureCache;
        }
        const renderText = this.getText();
        const measure = this.measureTargetText(ctx, renderText);
        this.measureCache = measure;
        return measure;
    }
    measureTargetText(ctx, targetText) {
        if (!targetText.length) {
            return 0;
        }
        const { parent  } = this;
        const customFont = parent.getStyle('font-family').getDefinition();
        if (customFont) {
            const fontSize = this.getFontSize();
            const text = customFont.isRTL ? targetText.split('').reverse().join('') : targetText;
            const dx = toNumbers(parent.getAttribute('dx').getString());
            const len = text.length;
            let measure = 0;
            for(let i = 0; i < len; i++){
                const glyph = this.getGlyph(customFont, text, i);
                measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
                if (typeof dx[i] !== 'undefined' && !isNaN(dx[i])) {
                    measure += dx[i];
                }
            }
            return measure;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!ctx.measureText) {
            return targetText.length * 10;
        }
        ctx.save();
        this.setContext(ctx, true);
        const { width: measure  } = ctx.measureText(targetText);
        this.clearContext(ctx);
        ctx.restore();
        return measure;
    }
    /**
   * Inherits positional attributes from {@link TextElement} parent(s). Attributes
   * are only inherited from a parent to its first child.
   * @param name - The attribute name.
   * @returns The attribute value or null.
   */ getInheritedAttribute(name) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias,consistent-this
        let current = this;
        while(current instanceof TextElement && current.isFirstChild() && current.parent){
            const parentAttr = current.parent.getAttribute(name);
            if (parentAttr.hasValue(true)) {
                return parentAttr.getString('0');
            }
            current = current.parent;
        }
        return null;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, new.target === TextElement ? true : captureTextNodes);
        this.type = 'text';
        this.x = 0;
        this.y = 0;
        this.leafTexts = [];
        this.textChunkStart = 0;
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.measureCache = -1;
    }
}

class TSpanElement extends TextElement {
    getText() {
        return this.text;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, new.target === TSpanElement ? true : captureTextNodes);
        this.type = 'tspan';
        // if this node has children, then they own the text
        this.text = this.children.length > 0 ? '' : this.getTextFromNode();
    }
}

class TextNode extends TSpanElement {
    constructor(...args){
        super(...args);
        this.type = 'textNode';
    }
}

class PathParser extends svg_pathdata__WEBPACK_IMPORTED_MODULE_2__.SVGPathData {
    reset() {
        this.i = -1;
        this.command = null;
        this.previousCommand = null;
        this.start = new Point(0, 0);
        this.control = new Point(0, 0);
        this.current = new Point(0, 0);
        this.points = [];
        this.angles = [];
    }
    isEnd() {
        const { i , commands  } = this;
        return i >= commands.length - 1;
    }
    next() {
        const command = this.commands[++this.i];
        this.previousCommand = this.command;
        this.command = command;
        return command;
    }
    getPoint() {
        let xProp = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'x', yProp = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'y';
        const point = new Point(this.command[xProp], this.command[yProp]);
        return this.makeAbsolute(point);
    }
    getAsControlPoint(xProp, yProp) {
        const point = this.getPoint(xProp, yProp);
        this.control = point;
        return point;
    }
    getAsCurrentPoint(xProp, yProp) {
        const point = this.getPoint(xProp, yProp);
        this.current = point;
        return point;
    }
    getReflectedControlPoint() {
        const previousCommand = this.previousCommand.type;
        if (previousCommand !== svg_pathdata__WEBPACK_IMPORTED_MODULE_2__.SVGPathData.CURVE_TO && previousCommand !== svg_pathdata__WEBPACK_IMPORTED_MODULE_2__.SVGPathData.SMOOTH_CURVE_TO && previousCommand !== svg_pathdata__WEBPACK_IMPORTED_MODULE_2__.SVGPathData.QUAD_TO && previousCommand !== svg_pathdata__WEBPACK_IMPORTED_MODULE_2__.SVGPathData.SMOOTH_QUAD_TO) {
            return this.current;
        }
        // reflect point
        const { current: { x: cx , y: cy  } , control: { x: ox , y: oy  }  } = this;
        const point = new Point(2 * cx - ox, 2 * cy - oy);
        return point;
    }
    makeAbsolute(point) {
        if (this.command.relative) {
            const { x , y  } = this.current;
            point.x += x;
            point.y += y;
        }
        return point;
    }
    addMarker(point, from, priorTo) {
        const { points , angles  } = this;
        // if the last angle isn't filled in because we didn't have this point yet ...
        if (priorTo && angles.length > 0 && !angles[angles.length - 1]) {
            angles[angles.length - 1] = points[points.length - 1].angleTo(priorTo);
        }
        this.addMarkerAngle(point, from ? from.angleTo(point) : null);
    }
    addMarkerAngle(point, angle) {
        this.points.push(point);
        this.angles.push(angle);
    }
    getMarkerPoints() {
        return this.points;
    }
    getMarkerAngles() {
        const { angles  } = this;
        const len = angles.length;
        for(let i = 0; i < len; i++){
            if (!angles[i]) {
                for(let j = i + 1; j < len; j++){
                    if (angles[j]) {
                        angles[i] = angles[j];
                        break;
                    }
                }
            }
        }
        return angles;
    }
    constructor(path){
        super(path// Fix spaces after signs.
        .replace(/([+\-.])\s+/gm, '$1')// Remove invalid part.
        .replace(/[^MmZzLlHhVvCcSsQqTtAae\d\s.,+-].*/g, ''));
        this.control = new Point(0, 0);
        this.start = new Point(0, 0);
        this.current = new Point(0, 0);
        this.command = null;
        this.commands = this.commands;
        this.i = -1;
        this.previousCommand = null;
        this.points = [];
        this.angles = [];
    }
}

class PathElement extends RenderedElement {
    path(ctx) {
        const { pathParser  } = this;
        const boundingBox = new BoundingBox();
        pathParser.reset();
        if (ctx) {
            ctx.beginPath();
        }
        while(!pathParser.isEnd()){
            switch(pathParser.next().type){
                case PathParser.MOVE_TO:
                    this.pathM(ctx, boundingBox);
                    break;
                case PathParser.LINE_TO:
                    this.pathL(ctx, boundingBox);
                    break;
                case PathParser.HORIZ_LINE_TO:
                    this.pathH(ctx, boundingBox);
                    break;
                case PathParser.VERT_LINE_TO:
                    this.pathV(ctx, boundingBox);
                    break;
                case PathParser.CURVE_TO:
                    this.pathC(ctx, boundingBox);
                    break;
                case PathParser.SMOOTH_CURVE_TO:
                    this.pathS(ctx, boundingBox);
                    break;
                case PathParser.QUAD_TO:
                    this.pathQ(ctx, boundingBox);
                    break;
                case PathParser.SMOOTH_QUAD_TO:
                    this.pathT(ctx, boundingBox);
                    break;
                case PathParser.ARC:
                    this.pathA(ctx, boundingBox);
                    break;
                case PathParser.CLOSE_PATH:
                    this.pathZ(ctx, boundingBox);
                    break;
            }
        }
        return boundingBox;
    }
    getBoundingBox(_ctx) {
        return this.path();
    }
    getMarkers() {
        const { pathParser  } = this;
        const points = pathParser.getMarkerPoints();
        const angles = pathParser.getMarkerAngles();
        const markers = points.map((point, i)=>[
                point,
                angles[i]
            ]
        );
        return markers;
    }
    renderChildren(ctx) {
        this.path(ctx);
        this.document.screen.mouse.checkPath(this, ctx);
        const fillRuleStyleProp = this.getStyle('fill-rule');
        if (ctx.fillStyle !== '') {
            if (fillRuleStyleProp.getString('inherit') !== 'inherit') {
                ctx.fill(fillRuleStyleProp.getString());
            } else {
                ctx.fill();
            }
        }
        if (ctx.strokeStyle !== '') {
            if (this.getAttribute('vector-effect').getString() === 'non-scaling-stroke') {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.stroke();
            }
        }
        const markers = this.getMarkers();
        if (markers) {
            const markersLastIndex = markers.length - 1;
            const markerStartStyleProp = this.getStyle('marker-start');
            const markerMidStyleProp = this.getStyle('marker-mid');
            const markerEndStyleProp = this.getStyle('marker-end');
            if (markerStartStyleProp.isUrlDefinition()) {
                const marker = markerStartStyleProp.getDefinition();
                const [point, angle] = markers[0];
                marker.render(ctx, point, angle);
            }
            if (markerMidStyleProp.isUrlDefinition()) {
                const marker = markerMidStyleProp.getDefinition();
                for(let i = 1; i < markersLastIndex; i++){
                    const [point, angle] = markers[i];
                    marker.render(ctx, point, angle);
                }
            }
            if (markerEndStyleProp.isUrlDefinition()) {
                const marker = markerEndStyleProp.getDefinition();
                const [point, angle] = markers[markersLastIndex];
                marker.render(ctx, point, angle);
            }
        }
    }
    static pathM(pathParser) {
        const point = pathParser.getAsCurrentPoint();
        pathParser.start = pathParser.current;
        return {
            point
        };
    }
    pathM(ctx, boundingBox) {
        const { pathParser  } = this;
        const { point  } = PathElement.pathM(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.moveTo(x, y);
        }
    }
    static pathL(pathParser) {
        const { current  } = pathParser;
        const point = pathParser.getAsCurrentPoint();
        return {
            current,
            point
        };
    }
    pathL(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point  } = PathElement.pathL(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.lineTo(x, y);
        }
    }
    static pathH(pathParser) {
        const { current , command  } = pathParser;
        const point = new Point((command.relative ? current.x : 0) + command.x, current.y);
        pathParser.current = point;
        return {
            current,
            point
        };
    }
    pathH(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point  } = PathElement.pathH(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.lineTo(x, y);
        }
    }
    static pathV(pathParser) {
        const { current , command  } = pathParser;
        const point = new Point(current.x, (command.relative ? current.y : 0) + command.y);
        pathParser.current = point;
        return {
            current,
            point
        };
    }
    pathV(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point  } = PathElement.pathV(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.lineTo(x, y);
        }
    }
    static pathC(pathParser) {
        const { current  } = pathParser;
        const point = pathParser.getPoint('x1', 'y1');
        const controlPoint = pathParser.getAsControlPoint('x2', 'y2');
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            point,
            controlPoint,
            currentPoint
        };
    }
    pathC(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point , controlPoint , currentPoint  } = PathElement.pathC(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, point);
        boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathS(pathParser) {
        const { current  } = pathParser;
        const point = pathParser.getReflectedControlPoint();
        const controlPoint = pathParser.getAsControlPoint('x2', 'y2');
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            point,
            controlPoint,
            currentPoint
        };
    }
    pathS(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point , controlPoint , currentPoint  } = PathElement.pathS(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, point);
        boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathQ(pathParser) {
        const { current  } = pathParser;
        const controlPoint = pathParser.getAsControlPoint('x1', 'y1');
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            controlPoint,
            currentPoint
        };
    }
    pathQ(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , controlPoint , currentPoint  } = PathElement.pathQ(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, controlPoint);
        boundingBox.addQuadraticCurve(current.x, current.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathT(pathParser) {
        const { current  } = pathParser;
        const controlPoint = pathParser.getReflectedControlPoint();
        pathParser.control = controlPoint;
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            controlPoint,
            currentPoint
        };
    }
    pathT(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , controlPoint , currentPoint  } = PathElement.pathT(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, controlPoint);
        boundingBox.addQuadraticCurve(current.x, current.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathA(pathParser) {
        const { current , command  } = pathParser;
        let { rX , rY , xRot , lArcFlag , sweepFlag  } = command;
        const xAxisRotation = xRot * (Math.PI / 180);
        const currentPoint = pathParser.getAsCurrentPoint();
        // Conversion from endpoint to center parameterization
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        // x1', y1'
        const currp = new Point(Math.cos(xAxisRotation) * (current.x - currentPoint.x) / 2 + Math.sin(xAxisRotation) * (current.y - currentPoint.y) / 2, -Math.sin(xAxisRotation) * (current.x - currentPoint.x) / 2 + Math.cos(xAxisRotation) * (current.y - currentPoint.y) / 2);
        // adjust radii
        const l = Math.pow(currp.x, 2) / Math.pow(rX, 2) + Math.pow(currp.y, 2) / Math.pow(rY, 2);
        if (l > 1) {
            rX *= Math.sqrt(l);
            rY *= Math.sqrt(l);
        }
        // cx', cy'
        let s = (lArcFlag === sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rX, 2) * Math.pow(rY, 2) - Math.pow(rX, 2) * Math.pow(currp.y, 2) - Math.pow(rY, 2) * Math.pow(currp.x, 2)) / (Math.pow(rX, 2) * Math.pow(currp.y, 2) + Math.pow(rY, 2) * Math.pow(currp.x, 2)));
        if (isNaN(s)) {
            s = 0;
        }
        const cpp = new Point(s * rX * currp.y / rY, s * -rY * currp.x / rX);
        // cx, cy
        const centp = new Point((current.x + currentPoint.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (current.y + currentPoint.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
        // initial angle
        const a1 = vectorsAngle([
            1,
            0
        ], [
            (currp.x - cpp.x) / rX,
            (currp.y - cpp.y) / rY
        ]) // θ1
        ;
        // angle delta
        const u = [
            (currp.x - cpp.x) / rX,
            (currp.y - cpp.y) / rY
        ];
        const v = [
            (-currp.x - cpp.x) / rX,
            (-currp.y - cpp.y) / rY
        ];
        let ad = vectorsAngle(u, v) // Δθ
        ;
        if (vectorsRatio(u, v) <= -1) {
            ad = Math.PI;
        }
        if (vectorsRatio(u, v) >= 1) {
            ad = 0;
        }
        return {
            currentPoint,
            rX,
            rY,
            sweepFlag,
            xAxisRotation,
            centp,
            a1,
            ad
        };
    }
    pathA(ctx, boundingBox) {
        const { pathParser  } = this;
        const { currentPoint , rX , rY , sweepFlag , xAxisRotation , centp , a1 , ad  } = PathElement.pathA(pathParser);
        // for markers
        const dir = 1 - sweepFlag ? 1 : -1;
        const ah = a1 + dir * (ad / 2);
        const halfWay = new Point(centp.x + rX * Math.cos(ah), centp.y + rY * Math.sin(ah));
        pathParser.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
        pathParser.addMarkerAngle(currentPoint, ah - dir * Math.PI);
        boundingBox.addPoint(currentPoint.x, currentPoint.y) // TODO: this is too naive, make it better
        ;
        if (ctx && !isNaN(a1) && !isNaN(ad)) {
            const r = rX > rY ? rX : rY;
            const sx = rX > rY ? 1 : rX / rY;
            const sy = rX > rY ? rY / rX : 1;
            ctx.translate(centp.x, centp.y);
            ctx.rotate(xAxisRotation);
            ctx.scale(sx, sy);
            ctx.arc(0, 0, r, a1, a1 + ad, Boolean(1 - sweepFlag));
            ctx.scale(1 / sx, 1 / sy);
            ctx.rotate(-xAxisRotation);
            ctx.translate(-centp.x, -centp.y);
        }
    }
    static pathZ(pathParser) {
        pathParser.current = pathParser.start;
    }
    pathZ(ctx, boundingBox) {
        PathElement.pathZ(this.pathParser);
        if (ctx) {
            // only close path if it is not a straight line
            if (boundingBox.x1 !== boundingBox.x2 && boundingBox.y1 !== boundingBox.y2) {
                ctx.closePath();
            }
        }
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'path';
        this.pathParser = new PathParser(this.getAttribute('d').getString());
    }
}

class SVGElement extends RenderedElement {
    setContext(ctx) {
        var ref;
        const { document  } = this;
        const { screen , window  } = document;
        const canvas = ctx.canvas;
        screen.setDefaults(ctx);
        if ('style' in canvas && typeof ctx.font !== 'undefined' && window && typeof window.getComputedStyle !== 'undefined') {
            ctx.font = window.getComputedStyle(canvas).getPropertyValue('font');
            const fontSizeProp = new Property(document, 'fontSize', Font.parse(ctx.font).fontSize);
            if (fontSizeProp.hasValue()) {
                document.rootEmSize = fontSizeProp.getPixels('y');
                document.emSize = document.rootEmSize;
            }
        }
        // create new view port
        if (!this.getAttribute('x').hasValue()) {
            this.getAttribute('x', true).setValue(0);
        }
        if (!this.getAttribute('y').hasValue()) {
            this.getAttribute('y', true).setValue(0);
        }
        let { width , height  } = screen.viewPort;
        if (!this.getStyle('width').hasValue()) {
            this.getStyle('width', true).setValue('100%');
        }
        if (!this.getStyle('height').hasValue()) {
            this.getStyle('height', true).setValue('100%');
        }
        if (!this.getStyle('color').hasValue()) {
            this.getStyle('color', true).setValue('black');
        }
        const refXAttr = this.getAttribute('refX');
        const refYAttr = this.getAttribute('refY');
        const viewBoxAttr = this.getAttribute('viewBox');
        const viewBox = viewBoxAttr.hasValue() ? toNumbers(viewBoxAttr.getString()) : null;
        const clip = !this.root && this.getStyle('overflow').getValue('hidden') !== 'visible';
        let minX = 0;
        let minY = 0;
        let clipX = 0;
        let clipY = 0;
        if (viewBox) {
            minX = viewBox[0];
            minY = viewBox[1];
        }
        if (!this.root) {
            width = this.getStyle('width').getPixels('x');
            height = this.getStyle('height').getPixels('y');
            if (this.type === 'marker') {
                clipX = minX;
                clipY = minY;
                minX = 0;
                minY = 0;
            }
        }
        screen.viewPort.setCurrent(width, height);
        // Default value of transform-origin is center only for root SVG elements
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform-origin
        if (this.node // is not temporary SVGElement
         && (!this.parent || ((ref = this.node.parentNode) === null || ref === void 0 ? void 0 : ref.nodeName) === 'foreignObject') && this.getStyle('transform', false, true).hasValue() && !this.getStyle('transform-origin', false, true).hasValue()) {
            this.getStyle('transform-origin', true, true).setValue('50% 50%');
        }
        super.setContext(ctx);
        ctx.translate(this.getAttribute('x').getPixels('x'), this.getAttribute('y').getPixels('y'));
        if (viewBox) {
            width = viewBox[2];
            height = viewBox[3];
        }
        document.setViewBox({
            ctx,
            aspectRatio: this.getAttribute('preserveAspectRatio').getString(),
            width: screen.viewPort.width,
            desiredWidth: width,
            height: screen.viewPort.height,
            desiredHeight: height,
            minX,
            minY,
            refX: refXAttr.getValue(),
            refY: refYAttr.getValue(),
            clip,
            clipX,
            clipY
        });
        if (viewBox) {
            screen.viewPort.removeCurrent();
            screen.viewPort.setCurrent(width, height);
        }
    }
    clearContext(ctx) {
        super.clearContext(ctx);
        this.document.screen.viewPort.removeCurrent();
    }
    /**
   * Resize SVG to fit in given size.
   * @param width
   * @param height
   * @param preserveAspectRatio
   */ resize(width) {
        let height = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : width, preserveAspectRatio = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        const widthAttr = this.getAttribute('width', true);
        const heightAttr = this.getAttribute('height', true);
        const viewBoxAttr = this.getAttribute('viewBox');
        const styleAttr = this.getAttribute('style');
        const originWidth = widthAttr.getNumber(0);
        const originHeight = heightAttr.getNumber(0);
        if (preserveAspectRatio) {
            if (typeof preserveAspectRatio === 'string') {
                this.getAttribute('preserveAspectRatio', true).setValue(preserveAspectRatio);
            } else {
                const preserveAspectRatioAttr = this.getAttribute('preserveAspectRatio');
                if (preserveAspectRatioAttr.hasValue()) {
                    preserveAspectRatioAttr.setValue(preserveAspectRatioAttr.getString().replace(/^\s*(\S.*\S)\s*$/, '$1'));
                }
            }
        }
        widthAttr.setValue(width);
        heightAttr.setValue(height);
        if (!viewBoxAttr.hasValue()) {
            viewBoxAttr.setValue("0 0 ".concat(originWidth || width, " ").concat(originHeight || height));
        }
        if (styleAttr.hasValue()) {
            const widthStyle = this.getStyle('width');
            const heightStyle = this.getStyle('height');
            if (widthStyle.hasValue()) {
                widthStyle.setValue("".concat(width, "px"));
            }
            if (heightStyle.hasValue()) {
                heightStyle.setValue("".concat(height, "px"));
            }
        }
    }
    constructor(...args){
        super(...args);
        this.type = 'svg';
        this.root = false;
    }
}

class RectElement extends PathElement {
    path(ctx) {
        const x = this.getAttribute('x').getPixels('x');
        const y = this.getAttribute('y').getPixels('y');
        const width = this.getStyle('width', false, true).getPixels('x');
        const height = this.getStyle('height', false, true).getPixels('y');
        const rxAttr = this.getAttribute('rx');
        const ryAttr = this.getAttribute('ry');
        let rx = rxAttr.getPixels('x');
        let ry = ryAttr.getPixels('y');
        if (rxAttr.hasValue() && !ryAttr.hasValue()) {
            ry = rx;
        }
        if (ryAttr.hasValue() && !rxAttr.hasValue()) {
            rx = ry;
        }
        rx = Math.min(rx, width / 2);
        ry = Math.min(ry, height / 2);
        if (ctx) {
            const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
            ctx.beginPath() // always start the path so we don't fill prior paths
            ;
            if (height > 0 && width > 0) {
                ctx.moveTo(x + rx, y);
                ctx.lineTo(x + width - rx, y);
                ctx.bezierCurveTo(x + width - rx + KAPPA * rx, y, x + width, y + ry - KAPPA * ry, x + width, y + ry);
                ctx.lineTo(x + width, y + height - ry);
                ctx.bezierCurveTo(x + width, y + height - ry + KAPPA * ry, x + width - rx + KAPPA * rx, y + height, x + width - rx, y + height);
                ctx.lineTo(x + rx, y + height);
                ctx.bezierCurveTo(x + rx - KAPPA * rx, y + height, x, y + height - ry + KAPPA * ry, x, y + height - ry);
                ctx.lineTo(x, y + ry);
                ctx.bezierCurveTo(x, y + ry - KAPPA * ry, x + rx - KAPPA * rx, y, x + rx, y);
                ctx.closePath();
            }
        }
        return new BoundingBox(x, y, x + width, y + height);
    }
    getMarkers() {
        return null;
    }
    constructor(...args){
        super(...args);
        this.type = 'rect';
    }
}

class CircleElement extends PathElement {
    path(ctx) {
        const cx = this.getAttribute('cx').getPixels('x');
        const cy = this.getAttribute('cy').getPixels('y');
        const r = this.getAttribute('r').getPixels();
        if (ctx && r > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
            ctx.closePath();
        }
        return new BoundingBox(cx - r, cy - r, cx + r, cy + r);
    }
    getMarkers() {
        return null;
    }
    constructor(...args){
        super(...args);
        this.type = 'circle';
    }
}

class EllipseElement extends PathElement {
    path(ctx) {
        const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
        const rx = this.getAttribute('rx').getPixels('x');
        const ry = this.getAttribute('ry').getPixels('y');
        const cx = this.getAttribute('cx').getPixels('x');
        const cy = this.getAttribute('cy').getPixels('y');
        if (ctx && rx > 0 && ry > 0) {
            ctx.beginPath();
            ctx.moveTo(cx + rx, cy);
            ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
            ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
            ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
            ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
            ctx.closePath();
        }
        return new BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
    }
    getMarkers() {
        return null;
    }
    constructor(...args){
        super(...args);
        this.type = 'ellipse';
    }
}

class LineElement extends PathElement {
    getPoints() {
        return [
            new Point(this.getAttribute('x1').getPixels('x'), this.getAttribute('y1').getPixels('y')),
            new Point(this.getAttribute('x2').getPixels('x'), this.getAttribute('y2').getPixels('y'))
        ];
    }
    path(ctx) {
        const [{ x: x0 , y: y0  }, { x: x1 , y: y1  }] = this.getPoints();
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
        }
        return new BoundingBox(x0, y0, x1, y1);
    }
    getMarkers() {
        const [p0, p1] = this.getPoints();
        const a = p0.angleTo(p1);
        return [
            [
                p0,
                a
            ],
            [
                p1,
                a
            ]
        ];
    }
    constructor(...args){
        super(...args);
        this.type = 'line';
    }
}

class PolylineElement extends PathElement {
    path(ctx) {
        const { points  } = this;
        const [{ x: x0 , y: y0  }] = points;
        const boundingBox = new BoundingBox(x0, y0);
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
        }
        points.forEach((param)=>{
            let { x , y  } = param;
            boundingBox.addPoint(x, y);
            if (ctx) {
                ctx.lineTo(x, y);
            }
        });
        return boundingBox;
    }
    getMarkers() {
        const { points  } = this;
        const lastIndex = points.length - 1;
        const markers = [];
        points.forEach((point, i)=>{
            if (i === lastIndex) {
                return;
            }
            markers.push([
                point,
                point.angleTo(points[i + 1])
            ]);
        });
        if (markers.length > 0) {
            markers.push([
                points[points.length - 1],
                markers[markers.length - 1][1]
            ]);
        }
        return markers;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'polyline';
        this.points = [];
        this.points = Point.parsePath(this.getAttribute('points').getString());
    }
}

class PolygonElement extends PolylineElement {
    path(ctx) {
        const boundingBox = super.path(ctx);
        const [{ x , y  }] = this.points;
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.closePath();
        }
        return boundingBox;
    }
    constructor(...args){
        super(...args);
        this.type = 'polygon';
    }
}

class PatternElement extends Element {
    createPattern(ctx, _, parentOpacityProp) {
        const width = this.getStyle('width').getPixels('x', true);
        const height = this.getStyle('height').getPixels('y', true);
        // render me using a temporary svg element
        const patternSvg = new SVGElement(this.document, null);
        patternSvg.attributes.viewBox = new Property(this.document, 'viewBox', this.getAttribute('viewBox').getValue());
        patternSvg.attributes.width = new Property(this.document, 'width', "".concat(width, "px"));
        patternSvg.attributes.height = new Property(this.document, 'height', "".concat(height, "px"));
        patternSvg.attributes.transform = new Property(this.document, 'transform', this.getAttribute('patternTransform').getValue());
        patternSvg.children = this.children;
        const patternCanvas = this.document.createCanvas(width, height);
        const patternCtx = patternCanvas.getContext('2d');
        const xAttr = this.getAttribute('x');
        const yAttr = this.getAttribute('y');
        if (xAttr.hasValue() && yAttr.hasValue()) {
            patternCtx.translate(xAttr.getPixels('x', true), yAttr.getPixels('y', true));
        }
        if (parentOpacityProp.hasValue()) {
            this.styles['fill-opacity'] = parentOpacityProp;
        } else {
            Reflect.deleteProperty(this.styles, 'fill-opacity');
        }
        // render 3x3 grid so when we transform there's no white space on edges
        for(let x = -1; x <= 1; x++){
            for(let y = -1; y <= 1; y++){
                patternCtx.save();
                patternSvg.attributes.x = new Property(this.document, 'x', x * patternCanvas.width);
                patternSvg.attributes.y = new Property(this.document, 'y', y * patternCanvas.height);
                patternSvg.render(patternCtx);
                patternCtx.restore();
            }
        }
        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        return pattern;
    }
    constructor(...args){
        super(...args);
        this.type = 'pattern';
    }
}

class MarkerElement extends Element {
    render(ctx, point, angle) {
        if (!point) {
            return;
        }
        const { x , y  } = point;
        const orient = this.getAttribute('orient').getString('auto');
        const markerUnits = this.getAttribute('markerUnits').getString('strokeWidth');
        ctx.translate(x, y);
        if (orient === 'auto') {
            ctx.rotate(angle);
        }
        if (markerUnits === 'strokeWidth') {
            ctx.scale(ctx.lineWidth, ctx.lineWidth);
        }
        ctx.save();
        // render me using a temporary svg element
        const markerSvg = new SVGElement(this.document);
        markerSvg.type = this.type;
        markerSvg.attributes.viewBox = new Property(this.document, 'viewBox', this.getAttribute('viewBox').getValue());
        markerSvg.attributes.refX = new Property(this.document, 'refX', this.getAttribute('refX').getValue());
        markerSvg.attributes.refY = new Property(this.document, 'refY', this.getAttribute('refY').getValue());
        markerSvg.attributes.width = new Property(this.document, 'width', this.getAttribute('markerWidth').getValue());
        markerSvg.attributes.height = new Property(this.document, 'height', this.getAttribute('markerHeight').getValue());
        markerSvg.attributes.overflow = new Property(this.document, 'overflow', this.getAttribute('overflow').getValue());
        markerSvg.attributes.fill = new Property(this.document, 'fill', this.getAttribute('fill').getColor('black'));
        markerSvg.attributes.stroke = new Property(this.document, 'stroke', this.getAttribute('stroke').getValue('none'));
        markerSvg.children = this.children;
        markerSvg.render(ctx);
        ctx.restore();
        if (markerUnits === 'strokeWidth') {
            ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
        }
        if (orient === 'auto') {
            ctx.rotate(-angle);
        }
        ctx.translate(-x, -y);
    }
    constructor(...args){
        super(...args);
        this.type = 'marker';
    }
}

class DefsElement extends Element {
    render() {
    // NOOP
    }
    constructor(...args){
        super(...args);
        this.type = 'defs';
    }
}

class GElement extends RenderedElement {
    getBoundingBox(ctx) {
        const boundingBox = new BoundingBox();
        this.children.forEach((child)=>{
            boundingBox.addBoundingBox(child.getBoundingBox(ctx));
        });
        return boundingBox;
    }
    constructor(...args){
        super(...args);
        this.type = 'g';
    }
}

class GradientElement extends Element {
    getGradientUnits() {
        return this.getAttribute('gradientUnits').getString('objectBoundingBox');
    }
    createGradient(ctx, element, parentOpacityProp) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
        let stopsContainer = this;
        if (this.getHrefAttribute().hasValue()) {
            stopsContainer = this.getHrefAttribute().getDefinition();
            this.inheritStopContainer(stopsContainer);
        }
        const { stops  } = stopsContainer;
        const gradient = this.getGradient(ctx, element);
        if (!gradient) {
            return this.addParentOpacity(parentOpacityProp, stops[stops.length - 1].color);
        }
        stops.forEach((stop)=>{
            gradient.addColorStop(stop.offset, this.addParentOpacity(parentOpacityProp, stop.color));
        });
        if (this.getAttribute('gradientTransform').hasValue()) {
            // render as transformed pattern on temporary canvas
            const { document  } = this;
            const { MAX_VIRTUAL_PIXELS  } = Screen;
            const { viewPort  } = document.screen;
            const rootView = viewPort.getRoot();
            const rect = new RectElement(document);
            rect.attributes.x = new Property(document, 'x', -MAX_VIRTUAL_PIXELS / 3);
            rect.attributes.y = new Property(document, 'y', -MAX_VIRTUAL_PIXELS / 3);
            rect.attributes.width = new Property(document, 'width', MAX_VIRTUAL_PIXELS);
            rect.attributes.height = new Property(document, 'height', MAX_VIRTUAL_PIXELS);
            const group = new GElement(document);
            group.attributes.transform = new Property(document, 'transform', this.getAttribute('gradientTransform').getValue());
            group.children = [
                rect
            ];
            const patternSvg = new SVGElement(document);
            patternSvg.attributes.x = new Property(document, 'x', 0);
            patternSvg.attributes.y = new Property(document, 'y', 0);
            patternSvg.attributes.width = new Property(document, 'width', rootView.width);
            patternSvg.attributes.height = new Property(document, 'height', rootView.height);
            patternSvg.children = [
                group
            ];
            const patternCanvas = document.createCanvas(rootView.width, rootView.height);
            const patternCtx = patternCanvas.getContext('2d');
            patternCtx.fillStyle = gradient;
            patternSvg.render(patternCtx);
            return patternCtx.createPattern(patternCanvas, 'no-repeat');
        }
        return gradient;
    }
    inheritStopContainer(stopsContainer) {
        this.attributesToInherit.forEach((attributeToInherit)=>{
            if (!this.getAttribute(attributeToInherit).hasValue() && stopsContainer.getAttribute(attributeToInherit).hasValue()) {
                this.getAttribute(attributeToInherit, true).setValue(stopsContainer.getAttribute(attributeToInherit).getValue());
            }
        });
    }
    addParentOpacity(parentOpacityProp, color) {
        if (parentOpacityProp.hasValue()) {
            const colorProp = new Property(this.document, 'color', color);
            return colorProp.addOpacity(parentOpacityProp).getColor();
        }
        return color;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.attributesToInherit = [
            'gradientUnits'
        ];
        this.stops = [];
        const { stops , children  } = this;
        children.forEach((child)=>{
            if (child.type === 'stop') {
                stops.push(child);
            }
        });
    }
}

class LinearGradientElement extends GradientElement {
    getGradient(ctx, element) {
        const isBoundingBoxUnits = this.getGradientUnits() === 'objectBoundingBox';
        const boundingBox = isBoundingBoxUnits ? element.getBoundingBox(ctx) : null;
        if (isBoundingBoxUnits && !boundingBox) {
            return null;
        }
        if (!this.getAttribute('x1').hasValue() && !this.getAttribute('y1').hasValue() && !this.getAttribute('x2').hasValue() && !this.getAttribute('y2').hasValue()) {
            this.getAttribute('x1', true).setValue(0);
            this.getAttribute('y1', true).setValue(0);
            this.getAttribute('x2', true).setValue(1);
            this.getAttribute('y2', true).setValue(0);
        }
        const x1 = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('x1').getNumber() : this.getAttribute('x1').getPixels('x');
        const y1 = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('y1').getNumber() : this.getAttribute('y1').getPixels('y');
        const x2 = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('x2').getNumber() : this.getAttribute('x2').getPixels('x');
        const y2 = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('y2').getNumber() : this.getAttribute('y2').getPixels('y');
        if (x1 === x2 && y1 === y2) {
            return null;
        }
        return ctx.createLinearGradient(x1, y1, x2, y2);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'linearGradient';
        this.attributesToInherit.push('x1', 'y1', 'x2', 'y2');
    }
}

class RadialGradientElement extends GradientElement {
    getGradient(ctx, element) {
        const isBoundingBoxUnits = this.getGradientUnits() === 'objectBoundingBox';
        const boundingBox = element.getBoundingBox(ctx);
        if (isBoundingBoxUnits && !boundingBox) {
            return null;
        }
        if (!this.getAttribute('cx').hasValue()) {
            this.getAttribute('cx', true).setValue('50%');
        }
        if (!this.getAttribute('cy').hasValue()) {
            this.getAttribute('cy', true).setValue('50%');
        }
        if (!this.getAttribute('r').hasValue()) {
            this.getAttribute('r', true).setValue('50%');
        }
        const cx = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('cx').getNumber() : this.getAttribute('cx').getPixels('x');
        const cy = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('cy').getNumber() : this.getAttribute('cy').getPixels('y');
        let fx = cx;
        let fy = cy;
        if (this.getAttribute('fx').hasValue()) {
            fx = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('fx').getNumber() : this.getAttribute('fx').getPixels('x');
        }
        if (this.getAttribute('fy').hasValue()) {
            fy = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('fy').getNumber() : this.getAttribute('fy').getPixels('y');
        }
        const r = isBoundingBoxUnits ? (boundingBox.width + boundingBox.height) / 2 * this.getAttribute('r').getNumber() : this.getAttribute('r').getPixels();
        const fr = this.getAttribute('fr').getPixels();
        return ctx.createRadialGradient(fx, fy, fr, cx, cy, r);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'radialGradient';
        this.attributesToInherit.push('cx', 'cy', 'r', 'fx', 'fy', 'fr');
    }
}

class StopElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'stop';
        const offset = Math.max(0, Math.min(1, this.getAttribute('offset').getNumber()));
        const stopOpacity = this.getStyle('stop-opacity');
        let stopColor = this.getStyle('stop-color', true);
        if (stopColor.getString() === '') {
            stopColor.setValue('#000');
        }
        if (stopOpacity.hasValue()) {
            stopColor = stopColor.addOpacity(stopOpacity);
        }
        this.offset = offset;
        this.color = stopColor.getColor();
    }
}

class AnimateElement extends Element {
    getProperty() {
        const attributeType = this.getAttribute('attributeType').getString();
        const attributeName = this.getAttribute('attributeName').getString();
        if (attributeType === 'CSS') {
            return this.parent.getStyle(attributeName, true);
        }
        return this.parent.getAttribute(attributeName, true);
    }
    calcValue() {
        const { initialUnits  } = this;
        const { progress , from , to  } = this.getProgress();
        // tween value linearly
        let newValue = from.getNumber() + (to.getNumber() - from.getNumber()) * progress;
        if (initialUnits === '%') {
            newValue *= 100 // numValue() returns 0-1 whereas properties are 0-100
            ;
        }
        return "".concat(newValue).concat(initialUnits);
    }
    update(delta) {
        const { parent  } = this;
        const prop = this.getProperty();
        // set initial value
        if (!this.initialValue) {
            this.initialValue = prop.getString();
            this.initialUnits = prop.getUnits();
        }
        // if we're past the end time
        if (this.duration > this.maxDuration) {
            const fill = this.getAttribute('fill').getString('remove');
            // loop for indefinitely repeating animations
            if (this.getAttribute('repeatCount').getString() === 'indefinite' || this.getAttribute('repeatDur').getString() === 'indefinite') {
                this.duration = 0;
            } else if (fill === 'freeze' && !this.frozen) {
                this.frozen = true;
                if (parent && prop) {
                    parent.animationFrozen = true;
                    parent.animationFrozenValue = prop.getString();
                }
            } else if (fill === 'remove' && !this.removed) {
                this.removed = true;
                if (parent && prop) {
                    prop.setValue(parent.animationFrozen ? parent.animationFrozenValue : this.initialValue);
                }
                return true;
            }
            return false;
        }
        this.duration += delta;
        // if we're past the begin time
        let updated = false;
        if (this.begin < this.duration) {
            let newValue = this.calcValue() // tween
            ;
            const typeAttr = this.getAttribute('type');
            if (typeAttr.hasValue()) {
                // for transform, etc.
                const type = typeAttr.getString();
                newValue = "".concat(type, "(").concat(newValue, ")");
            }
            prop.setValue(newValue);
            updated = true;
        }
        return updated;
    }
    getProgress() {
        const { document , values  } = this;
        let progress = (this.duration - this.begin) / (this.maxDuration - this.begin);
        let from;
        let to;
        if (values.hasValue()) {
            const p = progress * (values.getValue().length - 1);
            const lb = Math.floor(p);
            const ub = Math.ceil(p);
            let value;
            value = values.getValue()[lb];
            from = new Property(document, 'from', value ? parseFloat(value) : 0);
            value = values.getValue()[ub];
            to = new Property(document, 'to', value ? parseFloat(value) : 0);
            progress = (p - lb) / (ub - lb);
        } else {
            from = this.from;
            to = this.to;
        }
        return {
            progress,
            from,
            to
        };
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'animate';
        this.duration = 0;
        this.initialUnits = '';
        this.removed = false;
        this.frozen = false;
        document.screen.animations.push(this);
        this.begin = this.getAttribute('begin').getMilliseconds();
        this.maxDuration = this.begin + this.getAttribute('dur').getMilliseconds();
        this.from = this.getAttribute('from');
        this.to = this.getAttribute('to');
        this.values = new Property(document, 'values', null);
        const valuesAttr = this.getAttribute('values');
        if (valuesAttr.hasValue()) {
            this.values.setValue(valuesAttr.getString().split(';'));
        }
    }
}

class AnimateColorElement extends AnimateElement {
    calcValue() {
        const { progress , from , to  } = this.getProgress();
        const colorFrom = new rgbcolor__WEBPACK_IMPORTED_MODULE_1__(from.getColor());
        const colorTo = new rgbcolor__WEBPACK_IMPORTED_MODULE_1__(to.getColor());
        if (colorFrom.ok && colorTo.ok) {
            // tween color linearly
            const r = colorFrom.r + (colorTo.r - colorFrom.r) * progress;
            const g = colorFrom.g + (colorTo.g - colorFrom.g) * progress;
            const b = colorFrom.b + (colorTo.b - colorFrom.b) * progress;
            // ? alpha
            return "rgb(".concat(Math.floor(r), ", ").concat(Math.floor(g), ", ").concat(Math.floor(b), ")");
        }
        return this.getAttribute('from').getColor();
    }
    constructor(...args){
        super(...args);
        this.type = 'animateColor';
    }
}

class AnimateTransformElement extends AnimateElement {
    calcValue() {
        const { progress , from: from1 , to: to1  } = this.getProgress();
        // tween value linearly
        const transformFrom = toNumbers(from1.getString());
        const transformTo = toNumbers(to1.getString());
        const newValue = transformFrom.map((from, i)=>{
            const to = transformTo[i];
            return from + (to - from) * progress;
        }).join(' ');
        return newValue;
    }
    constructor(...args){
        super(...args);
        this.type = 'animateTransform';
    }
}

class FontFaceElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'font-face';
        this.ascent = this.getAttribute('ascent').getNumber();
        this.descent = this.getAttribute('descent').getNumber();
        this.unitsPerEm = this.getAttribute('units-per-em').getNumber();
    }
}

class GlyphElement extends PathElement {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'glyph';
        this.horizAdvX = this.getAttribute('horiz-adv-x').getNumber();
        this.unicode = this.getAttribute('unicode').getString();
        this.arabicForm = this.getAttribute('arabic-form').getString();
    }
}

class MissingGlyphElement extends GlyphElement {
    constructor(...args){
        super(...args);
        this.type = 'missing-glyph';
        this.horizAdvX = 0;
    }
}

class FontElement extends Element {
    render() {
    // NO RENDER
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'font';
        this.isArabic = false;
        this.glyphs = {};
        this.arabicGlyphs = {};
        this.isRTL = false;
        this.horizAdvX = this.getAttribute('horiz-adv-x').getNumber();
        const { definitions  } = document;
        const { children  } = this;
        for (const child of children){
            if (child instanceof FontFaceElement) {
                this.fontFace = child;
                const fontFamilyStyle = child.getStyle('font-family');
                if (fontFamilyStyle.hasValue()) {
                    definitions[fontFamilyStyle.getString()] = this;
                }
            } else if (child instanceof MissingGlyphElement) {
                this.missingGlyph = child;
            } else if (child instanceof GlyphElement) {
                if (child.arabicForm) {
                    this.isRTL = true;
                    this.isArabic = true;
                    const arabicGlyph = this.arabicGlyphs[child.unicode];
                    if (typeof arabicGlyph === 'undefined') {
                        this.arabicGlyphs[child.unicode] = {
                            [child.arabicForm]: child
                        };
                    } else {
                        arabicGlyph[child.arabicForm] = child;
                    }
                } else {
                    this.glyphs[child.unicode] = child;
                }
            }
        }
    }
}

class TRefElement extends TextElement {
    getText() {
        const element = this.getHrefAttribute().getDefinition();
        if (element) {
            const firstChild = element.children[0];
            if (firstChild) {
                return firstChild.getText();
            }
        }
        return '';
    }
    constructor(...args){
        super(...args);
        this.type = 'tref';
    }
}

class AElement extends TextElement {
    getText() {
        return this.text;
    }
    renderChildren(ctx) {
        if (this.hasText) {
            // render as text element
            super.renderChildren(ctx);
            const { document , x , y  } = this;
            const { mouse  } = document.screen;
            const fontSize = new Property(document, 'fontSize', Font.parse(document.ctx.font).fontSize);
            // Do not calc bounding box if mouse is not working.
            if (mouse.isWorking()) {
                mouse.checkBoundingBox(this, new BoundingBox(x, y - fontSize.getPixels('y'), x + this.measureText(ctx), y));
            }
        } else if (this.children.length > 0) {
            // render as temporary group
            const g = new GElement(this.document);
            g.children = this.children;
            g.parent = this;
            g.render(ctx);
        }
    }
    onClick() {
        const { window  } = this.document;
        if (window) {
            window.open(this.getHrefAttribute().getString());
        }
    }
    onMouseMove() {
        const ctx = this.document.ctx;
        ctx.canvas.style.cursor = 'pointer';
    }
    constructor(document, node1, captureTextNodes){
        super(document, node1, captureTextNodes);
        this.type = 'a';
        const { childNodes  } = node1;
        const firstChild = childNodes[0];
        const hasText = childNodes.length > 0 && Array.from(childNodes).every((node)=>node.nodeType === 3
        );
        this.hasText = hasText;
        this.text = hasText ? this.getTextFromNode(firstChild) : '';
    }
}

class TextPathElement extends TextElement {
    getText() {
        return this.text;
    }
    path(ctx) {
        const { dataArray  } = this;
        if (ctx) {
            ctx.beginPath();
        }
        dataArray.forEach((param)=>{
            let { type , points  } = param;
            switch(type){
                case PathParser.LINE_TO:
                    if (ctx) {
                        ctx.lineTo(points[0], points[1]);
                    }
                    break;
                case PathParser.MOVE_TO:
                    if (ctx) {
                        ctx.moveTo(points[0], points[1]);
                    }
                    break;
                case PathParser.CURVE_TO:
                    if (ctx) {
                        ctx.bezierCurveTo(points[0], points[1], points[2], points[3], points[4], points[5]);
                    }
                    break;
                case PathParser.QUAD_TO:
                    if (ctx) {
                        ctx.quadraticCurveTo(points[0], points[1], points[2], points[3]);
                    }
                    break;
                case PathParser.ARC:
                    {
                        const [cx, cy, rx, ry, theta, dTheta, psi, fs] = points;
                        const r = rx > ry ? rx : ry;
                        const scaleX = rx > ry ? 1 : rx / ry;
                        const scaleY = rx > ry ? ry / rx : 1;
                        if (ctx) {
                            ctx.translate(cx, cy);
                            ctx.rotate(psi);
                            ctx.scale(scaleX, scaleY);
                            ctx.arc(0, 0, r, theta, theta + dTheta, Boolean(1 - fs));
                            ctx.scale(1 / scaleX, 1 / scaleY);
                            ctx.rotate(-psi);
                            ctx.translate(-cx, -cy);
                        }
                        break;
                    }
                case PathParser.CLOSE_PATH:
                    if (ctx) {
                        ctx.closePath();
                    }
                    break;
            }
        });
    }
    renderChildren(ctx) {
        this.setTextData(ctx);
        ctx.save();
        const textDecoration = this.parent.getStyle('text-decoration').getString();
        const fontSize = this.getFontSize();
        const { glyphInfo  } = this;
        const fill = ctx.fillStyle;
        if (textDecoration === 'underline') {
            ctx.beginPath();
        }
        glyphInfo.forEach((glyph, i)=>{
            const { p0 , p1 , rotation , text: partialText  } = glyph;
            ctx.save();
            ctx.translate(p0.x, p0.y);
            ctx.rotate(rotation);
            if (ctx.fillStyle) {
                ctx.fillText(partialText, 0, 0);
            }
            if (ctx.strokeStyle) {
                ctx.strokeText(partialText, 0, 0);
            }
            ctx.restore();
            if (textDecoration === 'underline') {
                if (i === 0) {
                    ctx.moveTo(p0.x, p0.y + fontSize / 8);
                }
                ctx.lineTo(p1.x, p1.y + fontSize / 5);
            }
        // // To assist with debugging visually, uncomment following
        //
        // ctx.beginPath();
        // if (i % 2)
        //   ctx.strokeStyle = 'red';
        // else
        //   ctx.strokeStyle = 'green';
        // ctx.moveTo(p0.x, p0.y);
        // ctx.lineTo(p1.x, p1.y);
        // ctx.stroke();
        // ctx.closePath();
        });
        if (textDecoration === 'underline') {
            ctx.lineWidth = fontSize / 20;
            ctx.strokeStyle = fill;
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
    getLetterSpacingAt() {
        let idx = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
        return this.letterSpacingCache[idx] || 0;
    }
    findSegmentToFitChar(ctx, anchor, textFullWidth, fullPathWidth, spacesNumber, inputOffset, dy, c, charI) {
        let offset = inputOffset;
        let glyphWidth = this.measureText(ctx, c);
        if (c === ' ' && anchor === 'justify' && textFullWidth < fullPathWidth) {
            glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
        }
        if (charI > -1) {
            offset += this.getLetterSpacingAt(charI);
        }
        const splineStep = this.textHeight / 20;
        const p0 = this.getEquidistantPointOnPath(offset, splineStep, 0);
        const p1 = this.getEquidistantPointOnPath(offset + glyphWidth, splineStep, 0);
        const segment = {
            p0,
            p1
        };
        const rotation = p0 && p1 ? Math.atan2(p1.y - p0.y, p1.x - p0.x) : 0;
        if (dy) {
            const dyX = Math.cos(Math.PI / 2 + rotation) * dy;
            const dyY = Math.cos(-rotation) * dy;
            segment.p0 = {
                ...p0,
                x: p0.x + dyX,
                y: p0.y + dyY
            };
            segment.p1 = {
                ...p1,
                x: p1.x + dyX,
                y: p1.y + dyY
            };
        }
        offset += glyphWidth;
        return {
            offset,
            segment,
            rotation
        };
    }
    measureText(ctx, text) {
        const { measuresCache  } = this;
        const targetText = text || this.getText();
        if (measuresCache.has(targetText)) {
            return measuresCache.get(targetText);
        }
        const measure = this.measureTargetText(ctx, targetText);
        measuresCache.set(targetText, measure);
        return measure;
    }
    // This method supposes what all custom fonts already loaded.
    // If some font will be loaded after this method call, <textPath> will not be rendered correctly.
    // You need to call this method manually to update glyphs cache.
    setTextData(ctx) {
        if (this.glyphInfo) {
            return;
        }
        const renderText = this.getText();
        const chars = renderText.split('');
        const spacesNumber = renderText.split(' ').length - 1;
        const dx = this.parent.getAttribute('dx').split().map((_)=>_.getPixels('x')
        );
        const dy = this.parent.getAttribute('dy').getPixels('y');
        const anchor = this.parent.getStyle('text-anchor').getString('start');
        const thisSpacing = this.getStyle('letter-spacing');
        const parentSpacing = this.parent.getStyle('letter-spacing');
        let letterSpacing = 0;
        if (!thisSpacing.hasValue() || thisSpacing.getValue() === 'inherit') {
            letterSpacing = parentSpacing.getPixels();
        } else if (thisSpacing.hasValue()) {
            if (thisSpacing.getValue() !== 'initial' && thisSpacing.getValue() !== 'unset') {
                letterSpacing = thisSpacing.getPixels();
            }
        }
        // fill letter-spacing cache
        const letterSpacingCache = [];
        const textLen = renderText.length;
        this.letterSpacingCache = letterSpacingCache;
        for(let i1 = 0; i1 < textLen; i1++){
            letterSpacingCache.push(typeof dx[i1] !== 'undefined' ? dx[i1] : letterSpacing);
        }
        const dxSum = letterSpacingCache.reduce((acc, cur, i)=>i === 0 ? 0 : acc + cur || 0
        , 0);
        const textWidth = this.measureText(ctx);
        const textFullWidth = Math.max(textWidth + dxSum, 0);
        this.textWidth = textWidth;
        this.textHeight = this.getFontSize();
        this.glyphInfo = [];
        const fullPathWidth = this.getPathLength();
        const startOffset = this.getStyle('startOffset').getNumber(0) * fullPathWidth;
        let offset = 0;
        if (anchor === 'middle' || anchor === 'center') {
            offset = -textFullWidth / 2;
        }
        if (anchor === 'end' || anchor === 'right') {
            offset = -textFullWidth;
        }
        offset += startOffset;
        chars.forEach((char, i)=>{
            // Find such segment what distance between p0 and p1 is approx. width of glyph
            const { offset: nextOffset , segment , rotation  } = this.findSegmentToFitChar(ctx, anchor, textFullWidth, fullPathWidth, spacesNumber, offset, dy, char, i);
            offset = nextOffset;
            if (!segment.p0 || !segment.p1) {
                return;
            }
            // const width = this.getLineLength(
            //   segment.p0.x,
            //   segment.p0.y,
            //   segment.p1.x,
            //   segment.p1.y
            // );
            // Note: Since glyphs are rendered one at a time, any kerning pair data built into the font will not be used.
            // Can foresee having a rough pair table built in that the developer can override as needed.
            // Or use "dx" attribute of the <text> node as a naive replacement
            // const kern = 0;
            // placeholder for future implementation
            // const midpoint = this.getPointOnLine(
            //   kern + width / 2.0,
            //   segment.p0.x, segment.p0.y, segment.p1.x, segment.p1.y
            // );
            this.glyphInfo.push({
                // transposeX: midpoint.x,
                // transposeY: midpoint.y,
                text: chars[i],
                p0: segment.p0,
                p1: segment.p1,
                rotation
            });
        });
    }
    parsePathData(path) {
        this.pathLength = -1 // reset path length
        ;
        if (!path) {
            return [];
        }
        const pathCommands = [];
        const { pathParser  } = path;
        pathParser.reset();
        // convert l, H, h, V, and v to L
        while(!pathParser.isEnd()){
            const { current  } = pathParser;
            const startX = current ? current.x : 0;
            const startY = current ? current.y : 0;
            const command = pathParser.next();
            let nextCommandType = command.type;
            let points = [];
            switch(command.type){
                case PathParser.MOVE_TO:
                    this.pathM(pathParser, points);
                    break;
                case PathParser.LINE_TO:
                    nextCommandType = this.pathL(pathParser, points);
                    break;
                case PathParser.HORIZ_LINE_TO:
                    nextCommandType = this.pathH(pathParser, points);
                    break;
                case PathParser.VERT_LINE_TO:
                    nextCommandType = this.pathV(pathParser, points);
                    break;
                case PathParser.CURVE_TO:
                    this.pathC(pathParser, points);
                    break;
                case PathParser.SMOOTH_CURVE_TO:
                    nextCommandType = this.pathS(pathParser, points);
                    break;
                case PathParser.QUAD_TO:
                    this.pathQ(pathParser, points);
                    break;
                case PathParser.SMOOTH_QUAD_TO:
                    nextCommandType = this.pathT(pathParser, points);
                    break;
                case PathParser.ARC:
                    points = this.pathA(pathParser);
                    break;
                case PathParser.CLOSE_PATH:
                    PathElement.pathZ(pathParser);
                    break;
            }
            if (command.type !== PathParser.CLOSE_PATH) {
                pathCommands.push({
                    type: nextCommandType,
                    points,
                    start: {
                        x: startX,
                        y: startY
                    },
                    pathLength: this.calcLength(startX, startY, nextCommandType, points)
                });
            } else {
                pathCommands.push({
                    type: PathParser.CLOSE_PATH,
                    points: [],
                    pathLength: 0
                });
            }
        }
        return pathCommands;
    }
    pathM(pathParser, points) {
        const { x , y  } = PathElement.pathM(pathParser).point;
        points.push(x, y);
    }
    pathL(pathParser, points) {
        const { x , y  } = PathElement.pathL(pathParser).point;
        points.push(x, y);
        return PathParser.LINE_TO;
    }
    pathH(pathParser, points) {
        const { x , y  } = PathElement.pathH(pathParser).point;
        points.push(x, y);
        return PathParser.LINE_TO;
    }
    pathV(pathParser, points) {
        const { x , y  } = PathElement.pathV(pathParser).point;
        points.push(x, y);
        return PathParser.LINE_TO;
    }
    pathC(pathParser, points) {
        const { point , controlPoint , currentPoint  } = PathElement.pathC(pathParser);
        points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
    }
    pathS(pathParser, points) {
        const { point , controlPoint , currentPoint  } = PathElement.pathS(pathParser);
        points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        return PathParser.CURVE_TO;
    }
    pathQ(pathParser, points) {
        const { controlPoint , currentPoint  } = PathElement.pathQ(pathParser);
        points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
    }
    pathT(pathParser, points) {
        const { controlPoint , currentPoint  } = PathElement.pathT(pathParser);
        points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        return PathParser.QUAD_TO;
    }
    pathA(pathParser) {
        let { rX , rY , sweepFlag , xAxisRotation , centp , a1 , ad  } = PathElement.pathA(pathParser);
        if (sweepFlag === 0 && ad > 0) {
            ad -= 2 * Math.PI;
        }
        if (sweepFlag === 1 && ad < 0) {
            ad += 2 * Math.PI;
        }
        return [
            centp.x,
            centp.y,
            rX,
            rY,
            a1,
            ad,
            xAxisRotation,
            sweepFlag
        ];
    }
    calcLength(x, y, commandType, points) {
        let len = 0;
        let p1 = null;
        let p2 = null;
        let t = 0;
        switch(commandType){
            case PathParser.LINE_TO:
                return this.getLineLength(x, y, points[0], points[1]);
            case PathParser.CURVE_TO:
                // Approximates by breaking curve into 100 line segments
                len = 0;
                p1 = this.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                for(t = 0.01; t <= 1; t += 0.01){
                    p2 = this.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case PathParser.QUAD_TO:
                // Approximates by breaking curve into 100 line segments
                len = 0;
                p1 = this.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                for(t = 0.01; t <= 1; t += 0.01){
                    p2 = this.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case PathParser.ARC:
                {
                    // Approximates by breaking curve into line segments
                    len = 0;
                    const start = points[4];
                    // 4 = theta
                    const dTheta = points[5];
                    // 5 = dTheta
                    const end = points[4] + dTheta;
                    let inc = Math.PI / 180;
                    // 1 degree resolution
                    if (Math.abs(start - end) < inc) {
                        inc = Math.abs(start - end);
                    }
                    // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                    p1 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                    if (dTheta < 0) {
                        for(t = start - inc; t > end; t -= inc){
                            p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                    } else {
                        for(t = start + inc; t < end; t += inc){
                            p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                    }
                    p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    return len;
                }
        }
        return 0;
    }
    getPointOnLine(dist, p1x, p1y, p2x, p2y) {
        let fromX = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : p1x, fromY = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : p1y;
        const m = (p2y - p1y) / (p2x - p1x + PSEUDO_ZERO);
        let run = Math.sqrt(dist * dist / (1 + m * m));
        if (p2x < p1x) {
            run *= -1;
        }
        let rise = m * run;
        let pt = null;
        if (p2x === p1x) {
            pt = {
                x: fromX,
                y: fromY + rise
            };
        } else if ((fromY - p1y) / (fromX - p1x + PSEUDO_ZERO) === m) {
            pt = {
                x: fromX + run,
                y: fromY + rise
            };
        } else {
            let ix = 0;
            let iy = 0;
            const len = this.getLineLength(p1x, p1y, p2x, p2y);
            if (len < PSEUDO_ZERO) {
                return null;
            }
            let u = (fromX - p1x) * (p2x - p1x) + (fromY - p1y) * (p2y - p1y);
            u /= len * len;
            ix = p1x + u * (p2x - p1x);
            iy = p1y + u * (p2y - p1y);
            const pRise = this.getLineLength(fromX, fromY, ix, iy);
            const pRun = Math.sqrt(dist * dist - pRise * pRise);
            run = Math.sqrt(pRun * pRun / (1 + m * m));
            if (p2x < p1x) {
                run *= -1;
            }
            rise = m * run;
            pt = {
                x: ix + run,
                y: iy + rise
            };
        }
        return pt;
    }
    getPointOnPath(distance) {
        const fullLen = this.getPathLength();
        let cumulativePathLength = 0;
        let p = null;
        if (distance < -0.00005 || distance - 0.00005 > fullLen) {
            return null;
        }
        const { dataArray  } = this;
        for (const command of dataArray){
            if (command && (command.pathLength < 0.00005 || cumulativePathLength + command.pathLength + 0.00005 < distance)) {
                cumulativePathLength += command.pathLength;
                continue;
            }
            const delta = distance - cumulativePathLength;
            let currentT = 0;
            switch(command.type){
                case PathParser.LINE_TO:
                    p = this.getPointOnLine(delta, command.start.x, command.start.y, command.points[0], command.points[1], command.start.x, command.start.y);
                    break;
                case PathParser.ARC:
                    {
                        const start = command.points[4];
                        // 4 = theta
                        const dTheta = command.points[5];
                        // 5 = dTheta
                        const end = command.points[4] + dTheta;
                        currentT = start + delta / command.pathLength * dTheta;
                        if (dTheta < 0 && currentT < end || dTheta >= 0 && currentT > end) {
                            break;
                        }
                        p = this.getPointOnEllipticalArc(command.points[0], command.points[1], command.points[2], command.points[3], currentT, command.points[6]);
                        break;
                    }
                case PathParser.CURVE_TO:
                    currentT = delta / command.pathLength;
                    if (currentT > 1) {
                        currentT = 1;
                    }
                    p = this.getPointOnCubicBezier(currentT, command.start.x, command.start.y, command.points[0], command.points[1], command.points[2], command.points[3], command.points[4], command.points[5]);
                    break;
                case PathParser.QUAD_TO:
                    currentT = delta / command.pathLength;
                    if (currentT > 1) {
                        currentT = 1;
                    }
                    p = this.getPointOnQuadraticBezier(currentT, command.start.x, command.start.y, command.points[0], command.points[1], command.points[2], command.points[3]);
                    break;
            }
            if (p) {
                return p;
            }
            break;
        }
        return null;
    }
    getLineLength(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    getPathLength() {
        if (this.pathLength === -1) {
            this.pathLength = this.dataArray.reduce((length, command)=>command.pathLength > 0 ? length + command.pathLength : length
            , 0);
        }
        return this.pathLength;
    }
    getPointOnCubicBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
        const x = p4x * CB1(pct) + p3x * CB2(pct) + p2x * CB3(pct) + p1x * CB4(pct);
        const y = p4y * CB1(pct) + p3y * CB2(pct) + p2y * CB3(pct) + p1y * CB4(pct);
        return {
            x,
            y
        };
    }
    getPointOnQuadraticBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y) {
        const x = p3x * QB1(pct) + p2x * QB2(pct) + p1x * QB3(pct);
        const y = p3y * QB1(pct) + p2y * QB2(pct) + p1y * QB3(pct);
        return {
            x,
            y
        };
    }
    getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
        const cosPsi = Math.cos(psi);
        const sinPsi = Math.sin(psi);
        const pt = {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta)
        };
        return {
            x: cx + (pt.x * cosPsi - pt.y * sinPsi),
            y: cy + (pt.x * sinPsi + pt.y * cosPsi)
        };
    }
    // TODO need some optimisations. possibly build cache only for curved segments?
    buildEquidistantCache(inputStep, inputPrecision) {
        const fullLen = this.getPathLength();
        const precision = inputPrecision || 0.25 // accuracy vs performance
        ;
        const step = inputStep || fullLen / 100;
        if (!this.equidistantCache || this.equidistantCache.step !== step || this.equidistantCache.precision !== precision) {
            // Prepare cache
            this.equidistantCache = {
                step,
                precision,
                points: []
            };
            // Calculate points
            let s = 0;
            for(let l = 0; l <= fullLen; l += precision){
                const p0 = this.getPointOnPath(l);
                const p1 = this.getPointOnPath(l + precision);
                if (!p0 || !p1) {
                    continue;
                }
                s += this.getLineLength(p0.x, p0.y, p1.x, p1.y);
                if (s >= step) {
                    this.equidistantCache.points.push({
                        x: p0.x,
                        y: p0.y,
                        distance: l
                    });
                    s -= step;
                }
            }
        }
    }
    getEquidistantPointOnPath(targetDistance, step, precision) {
        this.buildEquidistantCache(step, precision);
        if (targetDistance < 0 || targetDistance - this.getPathLength() > 0.00005) {
            return null;
        }
        const idx = Math.round(targetDistance / this.getPathLength() * (this.equidistantCache.points.length - 1));
        return this.equidistantCache.points[idx] || null;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'textPath';
        this.textWidth = 0;
        this.textHeight = 0;
        this.pathLength = -1;
        this.glyphInfo = null;
        this.letterSpacingCache = [];
        this.measuresCache = new Map([
            [
                '',
                0
            ]
        ]);
        const pathElement = this.getHrefAttribute().getDefinition();
        this.text = this.getTextFromNode();
        this.dataArray = this.parsePathData(pathElement);
    }
}

// groups: 1: mime-type (+ charset), 2: mime-type (w/o charset), 3: charset, 4: base64?, 5: body
const dataUriRegex = /^\s*data:(([^/,;]+\/[^/,;]+)(?:;([^,;=]+=[^,;=]+))?)?(?:;(base64))?,(.*)$/i;
class ImageElement extends RenderedElement {
    async loadImage(href) {
        try {
            const image = await this.document.createImage(href);
            this.image = image;
        } catch (err) {
            console.error("Error while loading image \"".concat(href, "\":"), err);
        }
        this.loaded = true;
    }
    async loadSvg(href) {
        const match = dataUriRegex.exec(href);
        if (match) {
            const data = match[5];
            if (data) {
                if (match[4] === 'base64') {
                    this.image = atob(data);
                } else {
                    this.image = decodeURIComponent(data);
                }
            }
        } else {
            try {
                const response = await this.document.fetch(href);
                const svg = await response.text();
                this.image = svg;
            } catch (err) {
                console.error("Error while loading image \"".concat(href, "\":"), err);
            }
        }
        this.loaded = true;
    }
    renderChildren(ctx) {
        const { document , image , loaded  } = this;
        const x = this.getAttribute('x').getPixels('x');
        const y = this.getAttribute('y').getPixels('y');
        const width = this.getStyle('width').getPixels('x');
        const height = this.getStyle('height').getPixels('y');
        if (!loaded || !image || !width || !height) {
            return;
        }
        ctx.save();
        ctx.translate(x, y);
        if (typeof image === 'string') {
            const subDocument = document.canvg.forkString(ctx, image, {
                ignoreMouse: true,
                ignoreAnimation: true,
                ignoreDimensions: true,
                ignoreClear: true,
                offsetX: 0,
                offsetY: 0,
                scaleWidth: width,
                scaleHeight: height
            });
            const { documentElement  } = subDocument.document;
            if (documentElement) {
                documentElement.parent = this;
            }
            void subDocument.render();
        } else {
            document.setViewBox({
                ctx,
                aspectRatio: this.getAttribute('preserveAspectRatio').getString(),
                width,
                desiredWidth: image.width,
                height,
                desiredHeight: image.height
            });
            if (this.loaded) {
                if (!('complete' in image) || image.complete) {
                    ctx.drawImage(image, 0, 0);
                }
            }
        }
        ctx.restore();
    }
    getBoundingBox() {
        const x = this.getAttribute('x').getPixels('x');
        const y = this.getAttribute('y').getPixels('y');
        const width = this.getStyle('width').getPixels('x');
        const height = this.getStyle('height').getPixels('y');
        return new BoundingBox(x, y, x + width, y + height);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'image';
        this.loaded = false;
        const href = this.getHrefAttribute().getString();
        if (!href) {
            return;
        }
        const isSvg = href.endsWith('.svg') || /^\s*data:image\/svg\+xml/i.test(href);
        document.images.push(this);
        if (!isSvg) {
            void this.loadImage(href);
        } else {
            void this.loadSvg(href);
        }
    }
}

class SymbolElement extends RenderedElement {
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'symbol';
    }
}

class SVGFontLoader {
    async load(fontFamily, url) {
        try {
            const { document  } = this;
            const svgDocument = await document.canvg.parser.load(url);
            const fonts = svgDocument.getElementsByTagName('font');
            Array.from(fonts).forEach((fontNode)=>{
                const font = document.createElement(fontNode);
                document.definitions[fontFamily] = font;
            });
        } catch (err) {
            console.error("Error while loading font \"".concat(url, "\":"), err);
        }
        this.loaded = true;
    }
    constructor(document){
        this.document = document;
        this.loaded = false;
        document.fonts.push(this);
    }
}

class StyleElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'style';
        const css = compressSpaces(Array.from(node.childNodes)// NEED TEST
        .map((_)=>_.textContent
        ).join('').replace(/(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, '') // remove comments
        .replace(/@import.*;/g, '') // remove imports
        );
        const cssDefs = css.split('}');
        cssDefs.forEach((_1)=>{
            const def = _1.trim();
            if (!def) {
                return;
            }
            const cssParts = def.split('{');
            const cssClasses = cssParts[0].split(',');
            const cssProps = cssParts[1].split(';');
            cssClasses.forEach((_)=>{
                const cssClass = _.trim();
                if (!cssClass) {
                    return;
                }
                const props = document.styles[cssClass] || {};
                cssProps.forEach((cssProp)=>{
                    const prop = cssProp.indexOf(':');
                    const name = cssProp.substr(0, prop).trim();
                    const value = cssProp.substr(prop + 1, cssProp.length - prop).trim();
                    if (name && value) {
                        props[name] = new Property(document, name, value);
                    }
                });
                document.styles[cssClass] = props;
                document.stylesSpecificity[cssClass] = getSelectorSpecificity(cssClass);
                if (cssClass === '@font-face') {
                    const fontFamily = props['font-family'].getString().replace(/"|'/g, '');
                    const srcs = props.src.getString().split(',');
                    srcs.forEach((src)=>{
                        if (src.indexOf('format("svg")') > 0) {
                            const url = parseExternalUrl(src);
                            if (url) {
                                void new SVGFontLoader(document).load(fontFamily, url);
                            }
                        }
                    });
                }
            });
        });
    }
}
StyleElement.parseExternalUrl = parseExternalUrl;

class UseElement extends RenderedElement {
    setContext(ctx) {
        super.setContext(ctx);
        const xAttr = this.getAttribute('x');
        const yAttr = this.getAttribute('y');
        if (xAttr.hasValue()) {
            ctx.translate(xAttr.getPixels('x'), 0);
        }
        if (yAttr.hasValue()) {
            ctx.translate(0, yAttr.getPixels('y'));
        }
    }
    path(ctx) {
        const { element  } = this;
        if (element) {
            element.path(ctx);
        }
    }
    renderChildren(ctx) {
        const { document , element  } = this;
        if (element) {
            let tempSvg = element;
            if (element.type === 'symbol') {
                // render me using a temporary svg element in symbol cases (http://www.w3.org/TR/SVG/struct.html#UseElement)
                tempSvg = new SVGElement(document);
                tempSvg.attributes.viewBox = new Property(document, 'viewBox', element.getAttribute('viewBox').getString());
                tempSvg.attributes.preserveAspectRatio = new Property(document, 'preserveAspectRatio', element.getAttribute('preserveAspectRatio').getString());
                tempSvg.attributes.overflow = new Property(document, 'overflow', element.getAttribute('overflow').getString());
                tempSvg.children = element.children;
                // element is still the parent of the children
                element.styles.opacity = new Property(document, 'opacity', this.calculateOpacity());
            }
            if (tempSvg.type === 'svg') {
                const widthStyle = this.getStyle('width', false, true);
                const heightStyle = this.getStyle('height', false, true);
                // if symbol or svg, inherit width/height from me
                if (widthStyle.hasValue()) {
                    tempSvg.attributes.width = new Property(document, 'width', widthStyle.getString());
                }
                if (heightStyle.hasValue()) {
                    tempSvg.attributes.height = new Property(document, 'height', heightStyle.getString());
                }
            }
            const oldParent = tempSvg.parent;
            tempSvg.parent = this;
            tempSvg.render(ctx);
            tempSvg.parent = oldParent;
        }
    }
    getBoundingBox(ctx) {
        const { element  } = this;
        if (element) {
            return element.getBoundingBox(ctx);
        }
        return null;
    }
    elementTransform() {
        const { document , element  } = this;
        if (!element) {
            return null;
        }
        return Transform.fromElement(document, element);
    }
    get element() {
        if (!this.cachedElement) {
            this.cachedElement = this.getHrefAttribute().getDefinition();
        }
        return this.cachedElement;
    }
    constructor(...args){
        super(...args);
        this.type = 'use';
    }
}

function imGet(img, x, y, width, _height, rgba) {
    return img[y * width * 4 + x * 4 + rgba];
}
function imSet(img, x, y, width, _height, rgba, val) {
    img[y * width * 4 + x * 4 + rgba] = val;
}
function m(matrix, i, v) {
    const mi = matrix[i];
    return mi * v;
}
function c(a, m1, m2, m3) {
    return m1 + Math.cos(a) * m2 + Math.sin(a) * m3;
}
class FeColorMatrixElement extends Element {
    apply(ctx, _x, _y, width, height) {
        // assuming x==0 && y==0 for now
        const { includeOpacity , matrix  } = this;
        const srcData = ctx.getImageData(0, 0, width, height);
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                const r = imGet(srcData.data, x, y, width, height, 0);
                const g = imGet(srcData.data, x, y, width, height, 1);
                const b = imGet(srcData.data, x, y, width, height, 2);
                const a = imGet(srcData.data, x, y, width, height, 3);
                let nr = m(matrix, 0, r) + m(matrix, 1, g) + m(matrix, 2, b) + m(matrix, 3, a) + m(matrix, 4, 1);
                let ng = m(matrix, 5, r) + m(matrix, 6, g) + m(matrix, 7, b) + m(matrix, 8, a) + m(matrix, 9, 1);
                let nb = m(matrix, 10, r) + m(matrix, 11, g) + m(matrix, 12, b) + m(matrix, 13, a) + m(matrix, 14, 1);
                let na = m(matrix, 15, r) + m(matrix, 16, g) + m(matrix, 17, b) + m(matrix, 18, a) + m(matrix, 19, 1);
                if (includeOpacity) {
                    nr = 0;
                    ng = 0;
                    nb = 0;
                    na *= a / 255;
                }
                imSet(srcData.data, x, y, width, height, 0, nr);
                imSet(srcData.data, x, y, width, height, 1, ng);
                imSet(srcData.data, x, y, width, height, 2, nb);
                imSet(srcData.data, x, y, width, height, 3, na);
            }
        }
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(srcData, 0, 0);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'feColorMatrix';
        let matrix = toNumbers(this.getAttribute('values').getString());
        switch(this.getAttribute('type').getString('matrix')){
            case 'saturate':
                {
                    const s = matrix[0];
                    /* eslint-disable array-element-newline */ matrix = [
                        0.213 + 0.787 * s,
                        0.715 - 0.715 * s,
                        0.072 - 0.072 * s,
                        0,
                        0,
                        0.213 - 0.213 * s,
                        0.715 + 0.285 * s,
                        0.072 - 0.072 * s,
                        0,
                        0,
                        0.213 - 0.213 * s,
                        0.715 - 0.715 * s,
                        0.072 + 0.928 * s,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
                }
            case 'hueRotate':
                {
                    const a = matrix[0] * Math.PI / 180;
                    /* eslint-disable array-element-newline */ matrix = [
                        c(a, 0.213, 0.787, -0.213),
                        c(a, 0.715, -0.715, -0.715),
                        c(a, 0.072, -0.072, 0.928),
                        0,
                        0,
                        c(a, 0.213, -0.213, 0.143),
                        c(a, 0.715, 0.285, 0.14),
                        c(a, 0.072, -0.072, -0.283),
                        0,
                        0,
                        c(a, 0.213, -0.213, -0.787),
                        c(a, 0.715, -0.715, 0.715),
                        c(a, 0.072, 0.928, 0.072),
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
                }
            case 'luminanceToAlpha':
                /* eslint-disable array-element-newline */ matrix = [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0.2125,
                    0.7154,
                    0.0721,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    1
                ];
                break;
        }
        this.matrix = matrix;
        this.includeOpacity = this.getAttribute('includeOpacity').hasValue();
    }
}

class MaskElement extends Element {
    apply(ctx, element) {
        const { document  } = this;
        // render as temp svg
        let x = this.getAttribute('x').getPixels('x');
        let y = this.getAttribute('y').getPixels('y');
        let width = this.getStyle('width').getPixels('x');
        let height = this.getStyle('height').getPixels('y');
        if (!width && !height) {
            const boundingBox = new BoundingBox();
            this.children.forEach((child)=>{
                boundingBox.addBoundingBox(child.getBoundingBox(ctx));
            });
            x = Math.floor(boundingBox.x1);
            y = Math.floor(boundingBox.y1);
            width = Math.floor(boundingBox.width);
            height = Math.floor(boundingBox.height);
        }
        const ignoredStyles = this.removeStyles(element, MaskElement.ignoreStyles);
        const maskCanvas = document.createCanvas(x + width, y + height);
        const maskCtx = maskCanvas.getContext('2d');
        document.screen.setDefaults(maskCtx);
        this.renderChildren(maskCtx);
        // convert mask to alpha with a fake node
        // TODO: refactor out apply from feColorMatrix
        new FeColorMatrixElement(document, {
            nodeType: 1,
            childNodes: [],
            attributes: [
                {
                    nodeName: 'type',
                    value: 'luminanceToAlpha'
                },
                {
                    nodeName: 'includeOpacity',
                    value: 'true'
                }
            ]
        }).apply(maskCtx, 0, 0, x + width, y + height);
        const tmpCanvas = document.createCanvas(x + width, y + height);
        const tmpCtx = tmpCanvas.getContext('2d');
        document.screen.setDefaults(tmpCtx);
        element.render(tmpCtx);
        tmpCtx.globalCompositeOperation = 'destination-in';
        tmpCtx.fillStyle = maskCtx.createPattern(maskCanvas, 'no-repeat');
        tmpCtx.fillRect(0, 0, x + width, y + height);
        ctx.fillStyle = tmpCtx.createPattern(tmpCanvas, 'no-repeat');
        ctx.fillRect(0, 0, x + width, y + height);
        // reassign mask
        this.restoreStyles(element, ignoredStyles);
    }
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'mask';
    }
}
MaskElement.ignoreStyles = [
    'mask',
    'transform',
    'clip-path'
];

const noop = ()=>{
// NOOP
};
class ClipPathElement extends Element {
    apply(ctx) {
        const { document  } = this;
        const contextProto = Reflect.getPrototypeOf(ctx);
        const { beginPath , closePath  } = ctx;
        if (contextProto) {
            contextProto.beginPath = noop;
            contextProto.closePath = noop;
        }
        Reflect.apply(beginPath, ctx, []);
        this.children.forEach((child)=>{
            if (!('path' in child)) {
                return;
            }
            let transform = 'elementTransform' in child ? child.elementTransform() : null // handle <use />
            ;
            if (!transform) {
                transform = Transform.fromElement(document, child);
            }
            if (transform) {
                transform.apply(ctx);
            }
            child.path(ctx);
            if (contextProto) {
                contextProto.closePath = closePath;
            }
            if (transform) {
                transform.unapply(ctx);
            }
        });
        Reflect.apply(closePath, ctx, []);
        ctx.clip();
        if (contextProto) {
            contextProto.beginPath = beginPath;
            contextProto.closePath = closePath;
        }
    }
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'clipPath';
    }
}

class FilterElement extends Element {
    apply(ctx, element) {
        // render as temp svg
        const { document , children  } = this;
        const boundingBox = 'getBoundingBox' in element ? element.getBoundingBox(ctx) : null;
        if (!boundingBox) {
            return;
        }
        let px = 0;
        let py = 0;
        children.forEach((child)=>{
            const efd = child.extraFilterDistance || 0;
            px = Math.max(px, efd);
            py = Math.max(py, efd);
        });
        const width = Math.floor(boundingBox.width);
        const height = Math.floor(boundingBox.height);
        const tmpCanvasWidth = width + 2 * px;
        const tmpCanvasHeight = height + 2 * py;
        if (tmpCanvasWidth < 1 || tmpCanvasHeight < 1) {
            return;
        }
        const x = Math.floor(boundingBox.x);
        const y = Math.floor(boundingBox.y);
        const ignoredStyles = this.removeStyles(element, FilterElement.ignoreStyles);
        const tmpCanvas = document.createCanvas(tmpCanvasWidth, tmpCanvasHeight);
        const tmpCtx = tmpCanvas.getContext('2d');
        document.screen.setDefaults(tmpCtx);
        tmpCtx.translate(-x + px, -y + py);
        element.render(tmpCtx);
        // apply filters
        children.forEach((child)=>{
            if (typeof child.apply === 'function') {
                child.apply(tmpCtx, 0, 0, tmpCanvasWidth, tmpCanvasHeight);
            }
        });
        // render on me
        ctx.drawImage(tmpCanvas, 0, 0, tmpCanvasWidth, tmpCanvasHeight, x - px, y - py, tmpCanvasWidth, tmpCanvasHeight);
        this.restoreStyles(element, ignoredStyles);
    }
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'filter';
    }
}
FilterElement.ignoreStyles = [
    'filter',
    'transform',
    'clip-path'
];

class FeDropShadowElement extends Element {
    apply(_, _x, _y, _width, _height) {
    // TODO: implement
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'feDropShadow';
        this.addStylesFromStyleDefinition();
    }
}

class FeMorphologyElement extends Element {
    apply(_, _x, _y, _width, _height) {
    // TODO: implement
    }
    constructor(...args){
        super(...args);
        this.type = 'feMorphology';
    }
}

class FeCompositeElement extends Element {
    apply(_, _x, _y, _width, _height) {
    // TODO: implement
    }
    constructor(...args){
        super(...args);
        this.type = 'feComposite';
    }
}

class FeGaussianBlurElement extends Element {
    apply(ctx, x, y, width, height) {
        const { document , blurRadius  } = this;
        const body = document.window ? document.window.document.body : null;
        const canvas = ctx.canvas;
        // StackBlur requires canvas be on document
        canvas.id = document.getUniqueId();
        if (body) {
            canvas.style.display = 'none';
            body.appendChild(canvas);
        }
        (0,stackblur_canvas__WEBPACK_IMPORTED_MODULE_3__.canvasRGBA)(canvas, x, y, width, height, blurRadius);
        if (body) {
            body.removeChild(canvas);
        }
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'feGaussianBlur';
        this.blurRadius = Math.floor(this.getAttribute('stdDeviation').getNumber());
        this.extraFilterDistance = this.blurRadius;
    }
}

class TitleElement extends Element {
    constructor(...args){
        super(...args);
        this.type = 'title';
    }
}

class DescElement extends Element {
    constructor(...args){
        super(...args);
        this.type = 'desc';
    }
}

const elements = {
    'svg': SVGElement,
    'rect': RectElement,
    'circle': CircleElement,
    'ellipse': EllipseElement,
    'line': LineElement,
    'polyline': PolylineElement,
    'polygon': PolygonElement,
    'path': PathElement,
    'pattern': PatternElement,
    'marker': MarkerElement,
    'defs': DefsElement,
    'linearGradient': LinearGradientElement,
    'radialGradient': RadialGradientElement,
    'stop': StopElement,
    'animate': AnimateElement,
    'animateColor': AnimateColorElement,
    'animateTransform': AnimateTransformElement,
    'font': FontElement,
    'font-face': FontFaceElement,
    'missing-glyph': MissingGlyphElement,
    'glyph': GlyphElement,
    'text': TextElement,
    'tspan': TSpanElement,
    'tref': TRefElement,
    'a': AElement,
    'textPath': TextPathElement,
    'image': ImageElement,
    'g': GElement,
    'symbol': SymbolElement,
    'style': StyleElement,
    'use': UseElement,
    'mask': MaskElement,
    'clipPath': ClipPathElement,
    'filter': FilterElement,
    'feDropShadow': FeDropShadowElement,
    'feMorphology': FeMorphologyElement,
    'feComposite': FeCompositeElement,
    'feColorMatrix': FeColorMatrixElement,
    'feGaussianBlur': FeGaussianBlurElement,
    'title': TitleElement,
    'desc': DescElement
};

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
async function createImage(src) {
    let anonymousCrossOrigin = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    const image = document.createElement('img');
    if (anonymousCrossOrigin) {
        image.crossOrigin = 'Anonymous';
    }
    return new Promise((resolve, reject)=>{
        image.onload = ()=>{
            resolve(image);
        };
        image.onerror = (_event, _source, _lineno, _colno, error)=>{
            reject(error);
        };
        image.src = src;
    });
}
const DEFAULT_EM_SIZE = 12;
class Document {
    bindCreateImage(createImage1, anonymousCrossOrigin) {
        if (typeof anonymousCrossOrigin === 'boolean') {
            return (source, forceAnonymousCrossOrigin)=>createImage1(source, typeof forceAnonymousCrossOrigin === 'boolean' ? forceAnonymousCrossOrigin : anonymousCrossOrigin)
            ;
        }
        return createImage1;
    }
    get window() {
        return this.screen.window;
    }
    get fetch() {
        return this.screen.fetch;
    }
    get ctx() {
        return this.screen.ctx;
    }
    get emSize() {
        const { emSizeStack  } = this;
        return emSizeStack[emSizeStack.length - 1] || DEFAULT_EM_SIZE;
    }
    set emSize(value) {
        const { emSizeStack  } = this;
        emSizeStack.push(value);
    }
    popEmSize() {
        const { emSizeStack  } = this;
        emSizeStack.pop();
    }
    getUniqueId() {
        return "canvg".concat(++this.uniqueId);
    }
    isImagesLoaded() {
        return this.images.every((_)=>_.loaded
        );
    }
    isFontsLoaded() {
        return this.fonts.every((_)=>_.loaded
        );
    }
    createDocumentElement(document) {
        const documentElement = this.createElement(document.documentElement);
        documentElement.root = true;
        documentElement.addStylesFromStyleDefinition();
        this.documentElement = documentElement;
        return documentElement;
    }
    createElement(node) {
        const elementType = node.nodeName.replace(/^[^:]+:/, '');
        const ElementType = Document.elementTypes[elementType];
        if (ElementType) {
            return new ElementType(this, node);
        }
        return new UnknownElement(this, node);
    }
    createTextNode(node) {
        return new TextNode(this, node);
    }
    setViewBox(config) {
        this.screen.setViewBox({
            document: this,
            ...config
        });
    }
    constructor(canvg, { rootEmSize =DEFAULT_EM_SIZE , emSize =DEFAULT_EM_SIZE , createCanvas: createCanvas1 = Document.createCanvas , createImage: createImage2 = Document.createImage , anonymousCrossOrigin  } = {}){
        this.canvg = canvg;
        this.definitions = {};
        this.styles = {};
        this.stylesSpecificity = {};
        this.images = [];
        this.fonts = [];
        this.emSizeStack = [];
        this.uniqueId = 0;
        this.screen = canvg.screen;
        this.rootEmSize = rootEmSize;
        this.emSize = emSize;
        this.createCanvas = createCanvas1;
        this.createImage = this.bindCreateImage(createImage2, anonymousCrossOrigin);
        this.screen.wait(()=>this.isImagesLoaded()
        );
        this.screen.wait(()=>this.isFontsLoaded()
        );
    }
}
Document.createCanvas = createCanvas;
Document.createImage = createImage;
Document.elementTypes = elements;

/**
 * SVG renderer on canvas.
 */ class Canvg {
    /**
   * Create Canvg instance from SVG source string or URL.
   * @param ctx - Rendering context.
   * @param svg - SVG source string or URL.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ static async from(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        const parser = new Parser(options);
        const svgDocument = await parser.parse(svg);
        return new Canvg(ctx, svgDocument, options);
    }
    /**
   * Create Canvg instance from SVG source string.
   * @param ctx - Rendering context.
   * @param svg - SVG source string.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ static fromString(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        const parser = new Parser(options);
        const svgDocument = parser.parseFromString(svg);
        return new Canvg(ctx, svgDocument, options);
    }
    /**
   * Create new Canvg instance with inherited options.
   * @param ctx - Rendering context.
   * @param svg - SVG source string or URL.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ fork(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        return Canvg.from(ctx, svg, {
            ...this.options,
            ...options
        });
    }
    /**
   * Create new Canvg instance with inherited options.
   * @param ctx - Rendering context.
   * @param svg - SVG source string.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ forkString(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        return Canvg.fromString(ctx, svg, {
            ...this.options,
            ...options
        });
    }
    /**
   * Document is ready promise.
   * @returns Ready promise.
   */ ready() {
        return this.screen.ready();
    }
    /**
   * Document is ready value.
   * @returns Is ready or not.
   */ isReady() {
        return this.screen.isReady();
    }
    /**
   * Render only first frame, ignoring animations and mouse.
   * @param options - Rendering options.
   */ async render() {
        let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        this.start({
            enableRedraw: true,
            ignoreAnimation: true,
            ignoreMouse: true,
            ...options
        });
        await this.ready();
        this.stop();
    }
    /**
   * Start rendering.
   * @param options - Render options.
   */ start() {
        let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const { documentElement , screen , options: baseOptions  } = this;
        screen.start(documentElement, {
            enableRedraw: true,
            ...baseOptions,
            ...options
        });
    }
    /**
   * Stop rendering.
   */ stop() {
        this.screen.stop();
    }
    /**
   * Resize SVG to fit in given size.
   * @param width
   * @param height
   * @param preserveAspectRatio
   */ resize(width) {
        let height = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : width, preserveAspectRatio = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        this.documentElement.resize(width, height, preserveAspectRatio);
    }
    /**
   * Main constructor.
   * @param ctx - Rendering context.
   * @param svg - SVG Document.
   * @param options - Rendering options.
   */ constructor(ctx, svg, options = {}){
        this.parser = new Parser(options);
        this.screen = new Screen(ctx, options);
        this.options = options;
        const document = new Document(this, options);
        const documentElement = document.createDocumentElement(svg);
        this.document = document;
        this.documentElement = documentElement;
    }
}


//# sourceMappingURL=index.js.map


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var now = __webpack_require__(7)
  , root = typeof window === 'undefined' ? __webpack_require__.g : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}


/***/ }),
/* 7 */
/***/ (function(module) {

// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

//# sourceMappingURL=performance-now.js.map


/***/ }),
/* 8 */
/***/ ((module) => {

/*
	Based on rgbcolor.js by Stoyan Stefanov <sstoo@gmail.com>
	http://www.phpied.com/rgb-color-parser-in-javascript/
*/

module.exports = function(color_string) {
    this.ok = false;
    this.alpha = 1.0;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        rebeccapurple: '663399',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    color_string = simple_colors[color_string] || color_string;
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*((?:\d?\.)?\d)\)$/,
            example: ['rgba(123, 234, 45, 0.8)', 'rgba(255,234,245,1.0)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3]),
                    parseFloat(bits[4])
                ];
            }
        },
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            if (channels.length > 3) {
                this.alpha = channels[3];
            }
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    this.alpha = (this.alpha < 0) ? 0 : ((this.alpha > 1.0 || isNaN(this.alpha)) ? 1.0 : this.alpha);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toRGBA = function () {
        return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.alpha + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText =
                        'margin: 3px; '
                        + 'border: 1px solid black; '
                        + 'background:' + list_color.toHex() + '; '
                        + 'color:' + list_color.toHex()
                ;
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(
                    ' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
                );
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch(e){}
        }
        return xml;

    }

}


/***/ }),
/* 9 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COMMAND_ARG_COUNTS": () => (/* binding */ N),
/* harmony export */   "SVGPathData": () => (/* binding */ _),
/* harmony export */   "SVGPathDataParser": () => (/* binding */ f),
/* harmony export */   "SVGPathDataTransformer": () => (/* binding */ u),
/* harmony export */   "encodeSVGPath": () => (/* binding */ e)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var t=function(r,e){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,r){t.__proto__=r}||function(t,r){for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e])})(r,e)};function r(r,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=r}t(r,e),r.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}function e(t){var r="";Array.isArray(t)||(t=[t]);for(var e=0;e<t.length;e++){var i=t[e];if(i.type===_.CLOSE_PATH)r+="z";else if(i.type===_.HORIZ_LINE_TO)r+=(i.relative?"h":"H")+i.x;else if(i.type===_.VERT_LINE_TO)r+=(i.relative?"v":"V")+i.y;else if(i.type===_.MOVE_TO)r+=(i.relative?"m":"M")+i.x+" "+i.y;else if(i.type===_.LINE_TO)r+=(i.relative?"l":"L")+i.x+" "+i.y;else if(i.type===_.CURVE_TO)r+=(i.relative?"c":"C")+i.x1+" "+i.y1+" "+i.x2+" "+i.y2+" "+i.x+" "+i.y;else if(i.type===_.SMOOTH_CURVE_TO)r+=(i.relative?"s":"S")+i.x2+" "+i.y2+" "+i.x+" "+i.y;else if(i.type===_.QUAD_TO)r+=(i.relative?"q":"Q")+i.x1+" "+i.y1+" "+i.x+" "+i.y;else if(i.type===_.SMOOTH_QUAD_TO)r+=(i.relative?"t":"T")+i.x+" "+i.y;else{if(i.type!==_.ARC)throw new Error('Unexpected command type "'+i.type+'" at index '+e+".");r+=(i.relative?"a":"A")+i.rX+" "+i.rY+" "+i.xRot+" "+ +i.lArcFlag+" "+ +i.sweepFlag+" "+i.x+" "+i.y}}return r}function i(t,r){var e=t[0],i=t[1];return[e*Math.cos(r)-i*Math.sin(r),e*Math.sin(r)+i*Math.cos(r)]}function a(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var e=0;e<t.length;e++)if("number"!=typeof t[e])throw new Error("assertNumbers arguments["+e+"] is not a number. "+typeof t[e]+" == typeof "+t[e]);return!0}var n=Math.PI;function o(t,r,e){t.lArcFlag=0===t.lArcFlag?0:1,t.sweepFlag=0===t.sweepFlag?0:1;var a=t.rX,o=t.rY,s=t.x,u=t.y;a=Math.abs(t.rX),o=Math.abs(t.rY);var h=i([(r-s)/2,(e-u)/2],-t.xRot/180*n),c=h[0],y=h[1],p=Math.pow(c,2)/Math.pow(a,2)+Math.pow(y,2)/Math.pow(o,2);1<p&&(a*=Math.sqrt(p),o*=Math.sqrt(p)),t.rX=a,t.rY=o;var m=Math.pow(a,2)*Math.pow(y,2)+Math.pow(o,2)*Math.pow(c,2),O=(t.lArcFlag!==t.sweepFlag?1:-1)*Math.sqrt(Math.max(0,(Math.pow(a,2)*Math.pow(o,2)-m)/m)),l=a*y/o*O,T=-o*c/a*O,v=i([l,T],t.xRot/180*n);t.cX=v[0]+(r+s)/2,t.cY=v[1]+(e+u)/2,t.phi1=Math.atan2((y-T)/o,(c-l)/a),t.phi2=Math.atan2((-y-T)/o,(-c-l)/a),0===t.sweepFlag&&t.phi2>t.phi1&&(t.phi2-=2*n),1===t.sweepFlag&&t.phi2<t.phi1&&(t.phi2+=2*n),t.phi1*=180/n,t.phi2*=180/n}function s(t,r,e){a(t,r,e);var i=t*t+r*r-e*e;if(0>i)return[];if(0===i)return[[t*e/(t*t+r*r),r*e/(t*t+r*r)]];var n=Math.sqrt(i);return[[(t*e+r*n)/(t*t+r*r),(r*e-t*n)/(t*t+r*r)],[(t*e-r*n)/(t*t+r*r),(r*e+t*n)/(t*t+r*r)]]}var u,h=Math.PI/180;function c(t,r,e){return(1-e)*t+e*r}function y(t,r,e,i){return t+Math.cos(i/180*n)*r+Math.sin(i/180*n)*e}function p(t,r,e,i){var a=1e-6,n=r-t,o=e-r,s=3*n+3*(i-e)-6*o,u=6*(o-n),h=3*n;return Math.abs(s)<a?[-h/u]:function(t,r,e){void 0===e&&(e=1e-6);var i=t*t/4-r;if(i<-e)return[];if(i<=e)return[-t/2];var a=Math.sqrt(i);return[-t/2-a,-t/2+a]}(u/s,h/s,a)}function m(t,r,e,i,a){var n=1-a;return t*(n*n*n)+r*(3*n*n*a)+e*(3*n*a*a)+i*(a*a*a)}!function(t){function r(){return u((function(t,r,e){return t.relative&&(void 0!==t.x1&&(t.x1+=r),void 0!==t.y1&&(t.y1+=e),void 0!==t.x2&&(t.x2+=r),void 0!==t.y2&&(t.y2+=e),void 0!==t.x&&(t.x+=r),void 0!==t.y&&(t.y+=e),t.relative=!1),t}))}function e(){var t=NaN,r=NaN,e=NaN,i=NaN;return u((function(a,n,o){return a.type&_.SMOOTH_CURVE_TO&&(a.type=_.CURVE_TO,t=isNaN(t)?n:t,r=isNaN(r)?o:r,a.x1=a.relative?n-t:2*n-t,a.y1=a.relative?o-r:2*o-r),a.type&_.CURVE_TO?(t=a.relative?n+a.x2:a.x2,r=a.relative?o+a.y2:a.y2):(t=NaN,r=NaN),a.type&_.SMOOTH_QUAD_TO&&(a.type=_.QUAD_TO,e=isNaN(e)?n:e,i=isNaN(i)?o:i,a.x1=a.relative?n-e:2*n-e,a.y1=a.relative?o-i:2*o-i),a.type&_.QUAD_TO?(e=a.relative?n+a.x1:a.x1,i=a.relative?o+a.y1:a.y1):(e=NaN,i=NaN),a}))}function n(){var t=NaN,r=NaN;return u((function(e,i,a){if(e.type&_.SMOOTH_QUAD_TO&&(e.type=_.QUAD_TO,t=isNaN(t)?i:t,r=isNaN(r)?a:r,e.x1=e.relative?i-t:2*i-t,e.y1=e.relative?a-r:2*a-r),e.type&_.QUAD_TO){t=e.relative?i+e.x1:e.x1,r=e.relative?a+e.y1:e.y1;var n=e.x1,o=e.y1;e.type=_.CURVE_TO,e.x1=((e.relative?0:i)+2*n)/3,e.y1=((e.relative?0:a)+2*o)/3,e.x2=(e.x+2*n)/3,e.y2=(e.y+2*o)/3}else t=NaN,r=NaN;return e}))}function u(t){var r=0,e=0,i=NaN,a=NaN;return function(n){if(isNaN(i)&&!(n.type&_.MOVE_TO))throw new Error("path must start with moveto");var o=t(n,r,e,i,a);return n.type&_.CLOSE_PATH&&(r=i,e=a),void 0!==n.x&&(r=n.relative?r+n.x:n.x),void 0!==n.y&&(e=n.relative?e+n.y:n.y),n.type&_.MOVE_TO&&(i=r,a=e),o}}function O(t,r,e,i,n,o){return a(t,r,e,i,n,o),u((function(a,s,u,h){var c=a.x1,y=a.x2,p=a.relative&&!isNaN(h),m=void 0!==a.x?a.x:p?0:s,O=void 0!==a.y?a.y:p?0:u;function l(t){return t*t}a.type&_.HORIZ_LINE_TO&&0!==r&&(a.type=_.LINE_TO,a.y=a.relative?0:u),a.type&_.VERT_LINE_TO&&0!==e&&(a.type=_.LINE_TO,a.x=a.relative?0:s),void 0!==a.x&&(a.x=a.x*t+O*e+(p?0:n)),void 0!==a.y&&(a.y=m*r+a.y*i+(p?0:o)),void 0!==a.x1&&(a.x1=a.x1*t+a.y1*e+(p?0:n)),void 0!==a.y1&&(a.y1=c*r+a.y1*i+(p?0:o)),void 0!==a.x2&&(a.x2=a.x2*t+a.y2*e+(p?0:n)),void 0!==a.y2&&(a.y2=y*r+a.y2*i+(p?0:o));var T=t*i-r*e;if(void 0!==a.xRot&&(1!==t||0!==r||0!==e||1!==i))if(0===T)delete a.rX,delete a.rY,delete a.xRot,delete a.lArcFlag,delete a.sweepFlag,a.type=_.LINE_TO;else{var v=a.xRot*Math.PI/180,f=Math.sin(v),N=Math.cos(v),x=1/l(a.rX),d=1/l(a.rY),E=l(N)*x+l(f)*d,A=2*f*N*(x-d),C=l(f)*x+l(N)*d,M=E*i*i-A*r*i+C*r*r,R=A*(t*i+r*e)-2*(E*e*i+C*t*r),g=E*e*e-A*t*e+C*t*t,I=(Math.atan2(R,M-g)+Math.PI)%Math.PI/2,S=Math.sin(I),L=Math.cos(I);a.rX=Math.abs(T)/Math.sqrt(M*l(L)+R*S*L+g*l(S)),a.rY=Math.abs(T)/Math.sqrt(M*l(S)-R*S*L+g*l(L)),a.xRot=180*I/Math.PI}return void 0!==a.sweepFlag&&0>T&&(a.sweepFlag=+!a.sweepFlag),a}))}function l(){return function(t){var r={};for(var e in t)r[e]=t[e];return r}}t.ROUND=function(t){function r(r){return Math.round(r*t)/t}return void 0===t&&(t=1e13),a(t),function(t){return void 0!==t.x1&&(t.x1=r(t.x1)),void 0!==t.y1&&(t.y1=r(t.y1)),void 0!==t.x2&&(t.x2=r(t.x2)),void 0!==t.y2&&(t.y2=r(t.y2)),void 0!==t.x&&(t.x=r(t.x)),void 0!==t.y&&(t.y=r(t.y)),void 0!==t.rX&&(t.rX=r(t.rX)),void 0!==t.rY&&(t.rY=r(t.rY)),t}},t.TO_ABS=r,t.TO_REL=function(){return u((function(t,r,e){return t.relative||(void 0!==t.x1&&(t.x1-=r),void 0!==t.y1&&(t.y1-=e),void 0!==t.x2&&(t.x2-=r),void 0!==t.y2&&(t.y2-=e),void 0!==t.x&&(t.x-=r),void 0!==t.y&&(t.y-=e),t.relative=!0),t}))},t.NORMALIZE_HVZ=function(t,r,e){return void 0===t&&(t=!0),void 0===r&&(r=!0),void 0===e&&(e=!0),u((function(i,a,n,o,s){if(isNaN(o)&&!(i.type&_.MOVE_TO))throw new Error("path must start with moveto");return r&&i.type&_.HORIZ_LINE_TO&&(i.type=_.LINE_TO,i.y=i.relative?0:n),e&&i.type&_.VERT_LINE_TO&&(i.type=_.LINE_TO,i.x=i.relative?0:a),t&&i.type&_.CLOSE_PATH&&(i.type=_.LINE_TO,i.x=i.relative?o-a:o,i.y=i.relative?s-n:s),i.type&_.ARC&&(0===i.rX||0===i.rY)&&(i.type=_.LINE_TO,delete i.rX,delete i.rY,delete i.xRot,delete i.lArcFlag,delete i.sweepFlag),i}))},t.NORMALIZE_ST=e,t.QT_TO_C=n,t.INFO=u,t.SANITIZE=function(t){void 0===t&&(t=0),a(t);var r=NaN,e=NaN,i=NaN,n=NaN;return u((function(a,o,s,u,h){var c=Math.abs,y=!1,p=0,m=0;if(a.type&_.SMOOTH_CURVE_TO&&(p=isNaN(r)?0:o-r,m=isNaN(e)?0:s-e),a.type&(_.CURVE_TO|_.SMOOTH_CURVE_TO)?(r=a.relative?o+a.x2:a.x2,e=a.relative?s+a.y2:a.y2):(r=NaN,e=NaN),a.type&_.SMOOTH_QUAD_TO?(i=isNaN(i)?o:2*o-i,n=isNaN(n)?s:2*s-n):a.type&_.QUAD_TO?(i=a.relative?o+a.x1:a.x1,n=a.relative?s+a.y1:a.y2):(i=NaN,n=NaN),a.type&_.LINE_COMMANDS||a.type&_.ARC&&(0===a.rX||0===a.rY||!a.lArcFlag)||a.type&_.CURVE_TO||a.type&_.SMOOTH_CURVE_TO||a.type&_.QUAD_TO||a.type&_.SMOOTH_QUAD_TO){var O=void 0===a.x?0:a.relative?a.x:a.x-o,l=void 0===a.y?0:a.relative?a.y:a.y-s;p=isNaN(i)?void 0===a.x1?p:a.relative?a.x:a.x1-o:i-o,m=isNaN(n)?void 0===a.y1?m:a.relative?a.y:a.y1-s:n-s;var T=void 0===a.x2?0:a.relative?a.x:a.x2-o,v=void 0===a.y2?0:a.relative?a.y:a.y2-s;c(O)<=t&&c(l)<=t&&c(p)<=t&&c(m)<=t&&c(T)<=t&&c(v)<=t&&(y=!0)}return a.type&_.CLOSE_PATH&&c(o-u)<=t&&c(s-h)<=t&&(y=!0),y?[]:a}))},t.MATRIX=O,t.ROTATE=function(t,r,e){void 0===r&&(r=0),void 0===e&&(e=0),a(t,r,e);var i=Math.sin(t),n=Math.cos(t);return O(n,i,-i,n,r-r*n+e*i,e-r*i-e*n)},t.TRANSLATE=function(t,r){return void 0===r&&(r=0),a(t,r),O(1,0,0,1,t,r)},t.SCALE=function(t,r){return void 0===r&&(r=t),a(t,r),O(t,0,0,r,0,0)},t.SKEW_X=function(t){return a(t),O(1,0,Math.atan(t),1,0,0)},t.SKEW_Y=function(t){return a(t),O(1,Math.atan(t),0,1,0,0)},t.X_AXIS_SYMMETRY=function(t){return void 0===t&&(t=0),a(t),O(-1,0,0,1,t,0)},t.Y_AXIS_SYMMETRY=function(t){return void 0===t&&(t=0),a(t),O(1,0,0,-1,0,t)},t.A_TO_C=function(){return u((function(t,r,e){return _.ARC===t.type?function(t,r,e){var a,n,s,u;t.cX||o(t,r,e);for(var y=Math.min(t.phi1,t.phi2),p=Math.max(t.phi1,t.phi2)-y,m=Math.ceil(p/90),O=new Array(m),l=r,T=e,v=0;v<m;v++){var f=c(t.phi1,t.phi2,v/m),N=c(t.phi1,t.phi2,(v+1)/m),x=N-f,d=4/3*Math.tan(x*h/4),E=[Math.cos(f*h)-d*Math.sin(f*h),Math.sin(f*h)+d*Math.cos(f*h)],A=E[0],C=E[1],M=[Math.cos(N*h),Math.sin(N*h)],R=M[0],g=M[1],I=[R+d*Math.sin(N*h),g-d*Math.cos(N*h)],S=I[0],L=I[1];O[v]={relative:t.relative,type:_.CURVE_TO};var H=function(r,e){var a=i([r*t.rX,e*t.rY],t.xRot),n=a[0],o=a[1];return[t.cX+n,t.cY+o]};a=H(A,C),O[v].x1=a[0],O[v].y1=a[1],n=H(S,L),O[v].x2=n[0],O[v].y2=n[1],s=H(R,g),O[v].x=s[0],O[v].y=s[1],t.relative&&(O[v].x1-=l,O[v].y1-=T,O[v].x2-=l,O[v].y2-=T,O[v].x-=l,O[v].y-=T),l=(u=[O[v].x,O[v].y])[0],T=u[1]}return O}(t,t.relative?0:r,t.relative?0:e):t}))},t.ANNOTATE_ARCS=function(){return u((function(t,r,e){return t.relative&&(r=0,e=0),_.ARC===t.type&&o(t,r,e),t}))},t.CLONE=l,t.CALCULATE_BOUNDS=function(){var t=function(t){var r={};for(var e in t)r[e]=t[e];return r},i=r(),a=n(),h=e(),c=u((function(r,e,n){var u=h(a(i(t(r))));function O(t){t>c.maxX&&(c.maxX=t),t<c.minX&&(c.minX=t)}function l(t){t>c.maxY&&(c.maxY=t),t<c.minY&&(c.minY=t)}if(u.type&_.DRAWING_COMMANDS&&(O(e),l(n)),u.type&_.HORIZ_LINE_TO&&O(u.x),u.type&_.VERT_LINE_TO&&l(u.y),u.type&_.LINE_TO&&(O(u.x),l(u.y)),u.type&_.CURVE_TO){O(u.x),l(u.y);for(var T=0,v=p(e,u.x1,u.x2,u.x);T<v.length;T++){0<(w=v[T])&&1>w&&O(m(e,u.x1,u.x2,u.x,w))}for(var f=0,N=p(n,u.y1,u.y2,u.y);f<N.length;f++){0<(w=N[f])&&1>w&&l(m(n,u.y1,u.y2,u.y,w))}}if(u.type&_.ARC){O(u.x),l(u.y),o(u,e,n);for(var x=u.xRot/180*Math.PI,d=Math.cos(x)*u.rX,E=Math.sin(x)*u.rX,A=-Math.sin(x)*u.rY,C=Math.cos(x)*u.rY,M=u.phi1<u.phi2?[u.phi1,u.phi2]:-180>u.phi2?[u.phi2+360,u.phi1+360]:[u.phi2,u.phi1],R=M[0],g=M[1],I=function(t){var r=t[0],e=t[1],i=180*Math.atan2(e,r)/Math.PI;return i<R?i+360:i},S=0,L=s(A,-d,0).map(I);S<L.length;S++){(w=L[S])>R&&w<g&&O(y(u.cX,d,A,w))}for(var H=0,U=s(C,-E,0).map(I);H<U.length;H++){var w;(w=U[H])>R&&w<g&&l(y(u.cY,E,C,w))}}return r}));return c.minX=1/0,c.maxX=-1/0,c.minY=1/0,c.maxY=-1/0,c}}(u||(u={}));var O,l=function(){function t(){}return t.prototype.round=function(t){return this.transform(u.ROUND(t))},t.prototype.toAbs=function(){return this.transform(u.TO_ABS())},t.prototype.toRel=function(){return this.transform(u.TO_REL())},t.prototype.normalizeHVZ=function(t,r,e){return this.transform(u.NORMALIZE_HVZ(t,r,e))},t.prototype.normalizeST=function(){return this.transform(u.NORMALIZE_ST())},t.prototype.qtToC=function(){return this.transform(u.QT_TO_C())},t.prototype.aToC=function(){return this.transform(u.A_TO_C())},t.prototype.sanitize=function(t){return this.transform(u.SANITIZE(t))},t.prototype.translate=function(t,r){return this.transform(u.TRANSLATE(t,r))},t.prototype.scale=function(t,r){return this.transform(u.SCALE(t,r))},t.prototype.rotate=function(t,r,e){return this.transform(u.ROTATE(t,r,e))},t.prototype.matrix=function(t,r,e,i,a,n){return this.transform(u.MATRIX(t,r,e,i,a,n))},t.prototype.skewX=function(t){return this.transform(u.SKEW_X(t))},t.prototype.skewY=function(t){return this.transform(u.SKEW_Y(t))},t.prototype.xSymmetry=function(t){return this.transform(u.X_AXIS_SYMMETRY(t))},t.prototype.ySymmetry=function(t){return this.transform(u.Y_AXIS_SYMMETRY(t))},t.prototype.annotateArcs=function(){return this.transform(u.ANNOTATE_ARCS())},t}(),T=function(t){return" "===t||"\t"===t||"\r"===t||"\n"===t},v=function(t){return"0".charCodeAt(0)<=t.charCodeAt(0)&&t.charCodeAt(0)<="9".charCodeAt(0)},f=function(t){function e(){var r=t.call(this)||this;return r.curNumber="",r.curCommandType=-1,r.curCommandRelative=!1,r.canParseCommandOrComma=!0,r.curNumberHasExp=!1,r.curNumberHasExpDigits=!1,r.curNumberHasDecimal=!1,r.curArgs=[],r}return r(e,t),e.prototype.finish=function(t){if(void 0===t&&(t=[]),this.parse(" ",t),0!==this.curArgs.length||!this.canParseCommandOrComma)throw new SyntaxError("Unterminated command at the path end.");return t},e.prototype.parse=function(t,r){var e=this;void 0===r&&(r=[]);for(var i=function(t){r.push(t),e.curArgs.length=0,e.canParseCommandOrComma=!0},a=0;a<t.length;a++){var n=t[a],o=!(this.curCommandType!==_.ARC||3!==this.curArgs.length&&4!==this.curArgs.length||1!==this.curNumber.length||"0"!==this.curNumber&&"1"!==this.curNumber),s=v(n)&&("0"===this.curNumber&&"0"===n||o);if(!v(n)||s)if("e"!==n&&"E"!==n)if("-"!==n&&"+"!==n||!this.curNumberHasExp||this.curNumberHasExpDigits)if("."!==n||this.curNumberHasExp||this.curNumberHasDecimal||o){if(this.curNumber&&-1!==this.curCommandType){var u=Number(this.curNumber);if(isNaN(u))throw new SyntaxError("Invalid number ending at "+a);if(this.curCommandType===_.ARC)if(0===this.curArgs.length||1===this.curArgs.length){if(0>u)throw new SyntaxError('Expected positive number, got "'+u+'" at index "'+a+'"')}else if((3===this.curArgs.length||4===this.curArgs.length)&&"0"!==this.curNumber&&"1"!==this.curNumber)throw new SyntaxError('Expected a flag, got "'+this.curNumber+'" at index "'+a+'"');this.curArgs.push(u),this.curArgs.length===N[this.curCommandType]&&(_.HORIZ_LINE_TO===this.curCommandType?i({type:_.HORIZ_LINE_TO,relative:this.curCommandRelative,x:u}):_.VERT_LINE_TO===this.curCommandType?i({type:_.VERT_LINE_TO,relative:this.curCommandRelative,y:u}):this.curCommandType===_.MOVE_TO||this.curCommandType===_.LINE_TO||this.curCommandType===_.SMOOTH_QUAD_TO?(i({type:this.curCommandType,relative:this.curCommandRelative,x:this.curArgs[0],y:this.curArgs[1]}),_.MOVE_TO===this.curCommandType&&(this.curCommandType=_.LINE_TO)):this.curCommandType===_.CURVE_TO?i({type:_.CURVE_TO,relative:this.curCommandRelative,x1:this.curArgs[0],y1:this.curArgs[1],x2:this.curArgs[2],y2:this.curArgs[3],x:this.curArgs[4],y:this.curArgs[5]}):this.curCommandType===_.SMOOTH_CURVE_TO?i({type:_.SMOOTH_CURVE_TO,relative:this.curCommandRelative,x2:this.curArgs[0],y2:this.curArgs[1],x:this.curArgs[2],y:this.curArgs[3]}):this.curCommandType===_.QUAD_TO?i({type:_.QUAD_TO,relative:this.curCommandRelative,x1:this.curArgs[0],y1:this.curArgs[1],x:this.curArgs[2],y:this.curArgs[3]}):this.curCommandType===_.ARC&&i({type:_.ARC,relative:this.curCommandRelative,rX:this.curArgs[0],rY:this.curArgs[1],xRot:this.curArgs[2],lArcFlag:this.curArgs[3],sweepFlag:this.curArgs[4],x:this.curArgs[5],y:this.curArgs[6]})),this.curNumber="",this.curNumberHasExpDigits=!1,this.curNumberHasExp=!1,this.curNumberHasDecimal=!1,this.canParseCommandOrComma=!0}if(!T(n))if(","===n&&this.canParseCommandOrComma)this.canParseCommandOrComma=!1;else if("+"!==n&&"-"!==n&&"."!==n)if(s)this.curNumber=n,this.curNumberHasDecimal=!1;else{if(0!==this.curArgs.length)throw new SyntaxError("Unterminated command at index "+a+".");if(!this.canParseCommandOrComma)throw new SyntaxError('Unexpected character "'+n+'" at index '+a+". Command cannot follow comma");if(this.canParseCommandOrComma=!1,"z"!==n&&"Z"!==n)if("h"===n||"H"===n)this.curCommandType=_.HORIZ_LINE_TO,this.curCommandRelative="h"===n;else if("v"===n||"V"===n)this.curCommandType=_.VERT_LINE_TO,this.curCommandRelative="v"===n;else if("m"===n||"M"===n)this.curCommandType=_.MOVE_TO,this.curCommandRelative="m"===n;else if("l"===n||"L"===n)this.curCommandType=_.LINE_TO,this.curCommandRelative="l"===n;else if("c"===n||"C"===n)this.curCommandType=_.CURVE_TO,this.curCommandRelative="c"===n;else if("s"===n||"S"===n)this.curCommandType=_.SMOOTH_CURVE_TO,this.curCommandRelative="s"===n;else if("q"===n||"Q"===n)this.curCommandType=_.QUAD_TO,this.curCommandRelative="q"===n;else if("t"===n||"T"===n)this.curCommandType=_.SMOOTH_QUAD_TO,this.curCommandRelative="t"===n;else{if("a"!==n&&"A"!==n)throw new SyntaxError('Unexpected character "'+n+'" at index '+a+".");this.curCommandType=_.ARC,this.curCommandRelative="a"===n}else r.push({type:_.CLOSE_PATH}),this.canParseCommandOrComma=!0,this.curCommandType=-1}else this.curNumber=n,this.curNumberHasDecimal="."===n}else this.curNumber+=n,this.curNumberHasDecimal=!0;else this.curNumber+=n;else this.curNumber+=n,this.curNumberHasExp=!0;else this.curNumber+=n,this.curNumberHasExpDigits=this.curNumberHasExp}return r},e.prototype.transform=function(t){return Object.create(this,{parse:{value:function(r,e){void 0===e&&(e=[]);for(var i=0,a=Object.getPrototypeOf(this).parse.call(this,r);i<a.length;i++){var n=a[i],o=t(n);Array.isArray(o)?e.push.apply(e,o):e.push(o)}return e}}})},e}(l),_=function(t){function i(r){var e=t.call(this)||this;return e.commands="string"==typeof r?i.parse(r):r,e}return r(i,t),i.prototype.encode=function(){return i.encode(this.commands)},i.prototype.getBounds=function(){var t=u.CALCULATE_BOUNDS();return this.transform(t),t},i.prototype.transform=function(t){for(var r=[],e=0,i=this.commands;e<i.length;e++){var a=t(i[e]);Array.isArray(a)?r.push.apply(r,a):r.push(a)}return this.commands=r,this},i.encode=function(t){return e(t)},i.parse=function(t){var r=new f,e=[];return r.parse(t,e),r.finish(e),e},i.CLOSE_PATH=1,i.MOVE_TO=2,i.HORIZ_LINE_TO=4,i.VERT_LINE_TO=8,i.LINE_TO=16,i.CURVE_TO=32,i.SMOOTH_CURVE_TO=64,i.QUAD_TO=128,i.SMOOTH_QUAD_TO=256,i.ARC=512,i.LINE_COMMANDS=i.LINE_TO|i.HORIZ_LINE_TO|i.VERT_LINE_TO,i.DRAWING_COMMANDS=i.HORIZ_LINE_TO|i.VERT_LINE_TO|i.LINE_TO|i.CURVE_TO|i.SMOOTH_CURVE_TO|i.QUAD_TO|i.SMOOTH_QUAD_TO|i.ARC,i}(l),N=((O={})[_.MOVE_TO]=2,O[_.LINE_TO]=2,O[_.HORIZ_LINE_TO]=1,O[_.VERT_LINE_TO]=1,O[_.CLOSE_PATH]=0,O[_.QUAD_TO]=4,O[_.SMOOTH_QUAD_TO]=2,O[_.CURVE_TO]=6,O[_.SMOOTH_CURVE_TO]=4,O[_.ARC]=7,O);
//# sourceMappingURL=SVGPathData.module.js.map


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BlurStack": () => (/* binding */ BlurStack),
/* harmony export */   "canvasRGB": () => (/* binding */ processCanvasRGB),
/* harmony export */   "canvasRGBA": () => (/* binding */ processCanvasRGBA),
/* harmony export */   "image": () => (/* binding */ processImage),
/* harmony export */   "imageDataRGB": () => (/* binding */ processImageDataRGB),
/* harmony export */   "imageDataRGBA": () => (/* binding */ processImageDataRGBA)
/* harmony export */ });
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/* eslint-disable no-bitwise -- used for calculations */

/* eslint-disable unicorn/prefer-query-selector -- aiming at
  backward-compatibility */

/**
* StackBlur - a fast almost Gaussian Blur For Canvas
*
* In case you find this class useful - especially in commercial projects -
* I am not totally unhappy for a small donation to my PayPal account
* mario@quasimondo.de
*
* Or support me on flattr:
* {@link https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript}.
*
* @module StackBlur
* @author Mario Klingemann
* Contact: mario@quasimondo.com
* Website: {@link http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html}
* Twitter: @quasimondo
*
* @copyright (c) 2010 Mario Klingemann
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
var mulTable = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
var shgTable = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
/**
 * @param {string|HTMLImageElement} img
 * @param {string|HTMLCanvasElement} canvas
 * @param {Float} radius
 * @param {boolean} blurAlphaChannel
 * @param {boolean} useOffset
 * @param {boolean} skipStyles
 * @returns {undefined}
 */

function processImage(img, canvas, radius, blurAlphaChannel, useOffset, skipStyles) {
  if (typeof img === 'string') {
    img = document.getElementById(img);
  }

  if (!img || !('naturalWidth' in img)) {
    return;
  }

  var dimensionType = useOffset ? 'offset' : 'natural';
  var w = img[dimensionType + 'Width'];
  var h = img[dimensionType + 'Height'];

  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas || !('getContext' in canvas)) {
    return;
  }

  if (!skipStyles) {
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  canvas.width = w;
  canvas.height = h;
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, w, h);
  context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);

  if (isNaN(radius) || radius < 1) {
    return;
  }

  if (blurAlphaChannel) {
    processCanvasRGBA(canvas, 0, 0, w, h, radius);
  } else {
    processCanvasRGB(canvas, 0, 0, w, h, radius);
  }
}
/**
 * @param {string|HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @throws {Error|TypeError}
 * @returns {ImageData} See {@link https://html.spec.whatwg.org/multipage/canvas.html#imagedata}
 */


function getImageDataFromCanvas(canvas, topX, topY, width, height) {
  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas || _typeof(canvas) !== 'object' || !('getContext' in canvas)) {
    throw new TypeError('Expecting canvas with `getContext` method ' + 'in processCanvasRGB(A) calls!');
  }

  var context = canvas.getContext('2d');

  try {
    return context.getImageData(topX, topY, width, height);
  } catch (e) {
    throw new Error('unable to access image data: ' + e);
  }
}
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {undefined}
 */


function processCanvasRGBA(canvas, topX, topY, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }

  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
  imageData = processImageDataRGBA(imageData, topX, topY, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, topX, topY);
}
/**
 * @param {ImageData} imageData
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {ImageData}
 */


function processImageDataRGBA(imageData, topX, topY, width, height, radius) {
  var pixels = imageData.data;
  var div = 2 * radius + 1; // const w4 = width << 2;

  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  var stackEnd;

  for (var i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();

    if (i === radiusPlus1) {
      stackEnd = stack;
    }
  }

  stack.next = stackStart;
  var stackIn = null,
      stackOut = null,
      yw = 0,
      yi = 0;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];

  for (var y = 0; y < height; y++) {
    stack = stackStart;
    var pr = pixels[yi],
        pg = pixels[yi + 1],
        pb = pixels[yi + 2],
        pa = pixels[yi + 3];

    for (var _i = 0; _i < radiusPlus1; _i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    var rInSum = 0,
        gInSum = 0,
        bInSum = 0,
        aInSum = 0,
        rOutSum = radiusPlus1 * pr,
        gOutSum = radiusPlus1 * pg,
        bOutSum = radiusPlus1 * pb,
        aOutSum = radiusPlus1 * pa,
        rSum = sumFactor * pr,
        gSum = sumFactor * pg,
        bSum = sumFactor * pb,
        aSum = sumFactor * pa;

    for (var _i2 = 1; _i2 < radiusPlus1; _i2++) {
      var p = yi + ((widthMinus1 < _i2 ? widthMinus1 : _i2) << 2);
      var r = pixels[p],
          g = pixels[p + 1],
          b = pixels[p + 2],
          a = pixels[p + 3];
      var rbs = radiusPlus1 - _i2;
      rSum += (stack.r = r) * rbs;
      gSum += (stack.g = g) * rbs;
      bSum += (stack.b = b) * rbs;
      aSum += (stack.a = a) * rbs;
      rInSum += r;
      gInSum += g;
      bInSum += b;
      aInSum += a;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (var x = 0; x < width; x++) {
      var paInitial = aSum * mulSum >> shgSum;
      pixels[yi + 3] = paInitial;

      if (paInitial !== 0) {
        var _a2 = 255 / paInitial;

        pixels[yi] = (rSum * mulSum >> shgSum) * _a2;
        pixels[yi + 1] = (gSum * mulSum >> shgSum) * _a2;
        pixels[yi + 2] = (bSum * mulSum >> shgSum) * _a2;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      aSum -= aOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      aOutSum -= stackIn.a;

      var _p = x + radius + 1;

      _p = yw + (_p < widthMinus1 ? _p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[_p];
      gInSum += stackIn.g = pixels[_p + 1];
      bInSum += stackIn.b = pixels[_p + 2];
      aInSum += stackIn.a = pixels[_p + 3];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      aSum += aInSum;
      stackIn = stackIn.next;
      var _stackOut = stackOut,
          _r = _stackOut.r,
          _g = _stackOut.g,
          _b = _stackOut.b,
          _a = _stackOut.a;
      rOutSum += _r;
      gOutSum += _g;
      bOutSum += _b;
      aOutSum += _a;
      rInSum -= _r;
      gInSum -= _g;
      bInSum -= _b;
      aInSum -= _a;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (var _x = 0; _x < width; _x++) {
    yi = _x << 2;

    var _pr = pixels[yi],
        _pg = pixels[yi + 1],
        _pb = pixels[yi + 2],
        _pa = pixels[yi + 3],
        _rOutSum = radiusPlus1 * _pr,
        _gOutSum = radiusPlus1 * _pg,
        _bOutSum = radiusPlus1 * _pb,
        _aOutSum = radiusPlus1 * _pa,
        _rSum = sumFactor * _pr,
        _gSum = sumFactor * _pg,
        _bSum = sumFactor * _pb,
        _aSum = sumFactor * _pa;

    stack = stackStart;

    for (var _i3 = 0; _i3 < radiusPlus1; _i3++) {
      stack.r = _pr;
      stack.g = _pg;
      stack.b = _pb;
      stack.a = _pa;
      stack = stack.next;
    }

    var yp = width;
    var _gInSum = 0,
        _bInSum = 0,
        _aInSum = 0,
        _rInSum = 0;

    for (var _i4 = 1; _i4 <= radius; _i4++) {
      yi = yp + _x << 2;

      var _rbs = radiusPlus1 - _i4;

      _rSum += (stack.r = _pr = pixels[yi]) * _rbs;
      _gSum += (stack.g = _pg = pixels[yi + 1]) * _rbs;
      _bSum += (stack.b = _pb = pixels[yi + 2]) * _rbs;
      _aSum += (stack.a = _pa = pixels[yi + 3]) * _rbs;
      _rInSum += _pr;
      _gInSum += _pg;
      _bInSum += _pb;
      _aInSum += _pa;
      stack = stack.next;

      if (_i4 < heightMinus1) {
        yp += width;
      }
    }

    yi = _x;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (var _y = 0; _y < height; _y++) {
      var _p2 = yi << 2;

      pixels[_p2 + 3] = _pa = _aSum * mulSum >> shgSum;

      if (_pa > 0) {
        _pa = 255 / _pa;
        pixels[_p2] = (_rSum * mulSum >> shgSum) * _pa;
        pixels[_p2 + 1] = (_gSum * mulSum >> shgSum) * _pa;
        pixels[_p2 + 2] = (_bSum * mulSum >> shgSum) * _pa;
      } else {
        pixels[_p2] = pixels[_p2 + 1] = pixels[_p2 + 2] = 0;
      }

      _rSum -= _rOutSum;
      _gSum -= _gOutSum;
      _bSum -= _bOutSum;
      _aSum -= _aOutSum;
      _rOutSum -= stackIn.r;
      _gOutSum -= stackIn.g;
      _bOutSum -= stackIn.b;
      _aOutSum -= stackIn.a;
      _p2 = _x + ((_p2 = _y + radiusPlus1) < heightMinus1 ? _p2 : heightMinus1) * width << 2;
      _rSum += _rInSum += stackIn.r = pixels[_p2];
      _gSum += _gInSum += stackIn.g = pixels[_p2 + 1];
      _bSum += _bInSum += stackIn.b = pixels[_p2 + 2];
      _aSum += _aInSum += stackIn.a = pixels[_p2 + 3];
      stackIn = stackIn.next;
      _rOutSum += _pr = stackOut.r;
      _gOutSum += _pg = stackOut.g;
      _bOutSum += _pb = stackOut.b;
      _aOutSum += _pa = stackOut.a;
      _rInSum -= _pr;
      _gInSum -= _pg;
      _bInSum -= _pb;
      _aInSum -= _pa;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {undefined}
 */


function processCanvasRGB(canvas, topX, topY, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }

  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
  imageData = processImageDataRGB(imageData, topX, topY, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, topX, topY);
}
/**
 * @param {ImageData} imageData
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {ImageData}
 */


function processImageDataRGB(imageData, topX, topY, width, height, radius) {
  var pixels = imageData.data;
  var div = 2 * radius + 1; // const w4 = width << 2;

  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  var stackEnd;

  for (var i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();

    if (i === radiusPlus1) {
      stackEnd = stack;
    }
  }

  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];
  var p, rbs;
  var yw = 0,
      yi = 0;

  for (var y = 0; y < height; y++) {
    var pr = pixels[yi],
        pg = pixels[yi + 1],
        pb = pixels[yi + 2],
        rOutSum = radiusPlus1 * pr,
        gOutSum = radiusPlus1 * pg,
        bOutSum = radiusPlus1 * pb,
        rSum = sumFactor * pr,
        gSum = sumFactor * pg,
        bSum = sumFactor * pb;
    stack = stackStart;

    for (var _i5 = 0; _i5 < radiusPlus1; _i5++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    var rInSum = 0,
        gInSum = 0,
        bInSum = 0;

    for (var _i6 = 1; _i6 < radiusPlus1; _i6++) {
      p = yi + ((widthMinus1 < _i6 ? widthMinus1 : _i6) << 2);
      rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - _i6);
      gSum += (stack.g = pg = pixels[p + 1]) * rbs;
      bSum += (stack.b = pb = pixels[p + 2]) * rbs;
      rInSum += pr;
      gInSum += pg;
      bInSum += pb;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (var x = 0; x < width; x++) {
      pixels[yi] = rSum * mulSum >> shgSum;
      pixels[yi + 1] = gSum * mulSum >> shgSum;
      pixels[yi + 2] = bSum * mulSum >> shgSum;
      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[p];
      gInSum += stackIn.g = pixels[p + 1];
      bInSum += stackIn.b = pixels[p + 2];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      stackIn = stackIn.next;
      rOutSum += pr = stackOut.r;
      gOutSum += pg = stackOut.g;
      bOutSum += pb = stackOut.b;
      rInSum -= pr;
      gInSum -= pg;
      bInSum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (var _x2 = 0; _x2 < width; _x2++) {
    yi = _x2 << 2;

    var _pr2 = pixels[yi],
        _pg2 = pixels[yi + 1],
        _pb2 = pixels[yi + 2],
        _rOutSum2 = radiusPlus1 * _pr2,
        _gOutSum2 = radiusPlus1 * _pg2,
        _bOutSum2 = radiusPlus1 * _pb2,
        _rSum2 = sumFactor * _pr2,
        _gSum2 = sumFactor * _pg2,
        _bSum2 = sumFactor * _pb2;

    stack = stackStart;

    for (var _i7 = 0; _i7 < radiusPlus1; _i7++) {
      stack.r = _pr2;
      stack.g = _pg2;
      stack.b = _pb2;
      stack = stack.next;
    }

    var _rInSum2 = 0,
        _gInSum2 = 0,
        _bInSum2 = 0;

    for (var _i8 = 1, yp = width; _i8 <= radius; _i8++) {
      yi = yp + _x2 << 2;
      _rSum2 += (stack.r = _pr2 = pixels[yi]) * (rbs = radiusPlus1 - _i8);
      _gSum2 += (stack.g = _pg2 = pixels[yi + 1]) * rbs;
      _bSum2 += (stack.b = _pb2 = pixels[yi + 2]) * rbs;
      _rInSum2 += _pr2;
      _gInSum2 += _pg2;
      _bInSum2 += _pb2;
      stack = stack.next;

      if (_i8 < heightMinus1) {
        yp += width;
      }
    }

    yi = _x2;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (var _y2 = 0; _y2 < height; _y2++) {
      p = yi << 2;
      pixels[p] = _rSum2 * mulSum >> shgSum;
      pixels[p + 1] = _gSum2 * mulSum >> shgSum;
      pixels[p + 2] = _bSum2 * mulSum >> shgSum;
      _rSum2 -= _rOutSum2;
      _gSum2 -= _gOutSum2;
      _bSum2 -= _bOutSum2;
      _rOutSum2 -= stackIn.r;
      _gOutSum2 -= stackIn.g;
      _bOutSum2 -= stackIn.b;
      p = _x2 + ((p = _y2 + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      _rSum2 += _rInSum2 += stackIn.r = pixels[p];
      _gSum2 += _gInSum2 += stackIn.g = pixels[p + 1];
      _bSum2 += _bInSum2 += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      _rOutSum2 += _pr2 = stackOut.r;
      _gOutSum2 += _pg2 = stackOut.g;
      _bOutSum2 += _pb2 = stackOut.b;
      _rInSum2 -= _pr2;
      _gInSum2 -= _pg2;
      _bInSum2 -= _pb2;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}
/**
 *
 */


var BlurStack =
/**
 * Set properties.
 */
function BlurStack() {
  _classCallCheck(this, BlurStack);

  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
};




/***/ }),
/* 11 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createEndpoint": () => (/* binding */ createEndpoint),
/* harmony export */   "expose": () => (/* binding */ expose),
/* harmony export */   "proxy": () => (/* binding */ proxy),
/* harmony export */   "proxyMarker": () => (/* binding */ proxyMarker),
/* harmony export */   "releaseProxy": () => (/* binding */ releaseProxy),
/* harmony export */   "transfer": () => (/* binding */ transfer),
/* harmony export */   "transferHandlers": () => (/* binding */ transferHandlers),
/* harmony export */   "windowEndpoint": () => (/* binding */ windowEndpoint),
/* harmony export */   "wrap": () => (/* binding */ wrap)
/* harmony export */ });
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const proxyMarker = Symbol("Comlink.proxy");
const createEndpoint = Symbol("Comlink.endpoint");
const releaseProxy = Symbol("Comlink.releaseProxy");
const throwMarker = Symbol("Comlink.thrown");
const isObject = (val) => (typeof val === "object" && val !== null) || typeof val === "function";
/**
 * Internal transfer handle to handle objects marked to proxy.
 */
const proxyTransferHandler = {
    canHandle: (val) => isObject(val) && val[proxyMarker],
    serialize(obj) {
        const { port1, port2 } = new MessageChannel();
        expose(obj, port1);
        return [port2, [port2]];
    },
    deserialize(port) {
        port.start();
        return wrap(port);
    },
};
/**
 * Internal transfer handler to handle thrown exceptions.
 */
const throwTransferHandler = {
    canHandle: (value) => isObject(value) && throwMarker in value,
    serialize({ value }) {
        let serialized;
        if (value instanceof Error) {
            serialized = {
                isError: true,
                value: {
                    message: value.message,
                    name: value.name,
                    stack: value.stack,
                },
            };
        }
        else {
            serialized = { isError: false, value };
        }
        return [serialized, []];
    },
    deserialize(serialized) {
        if (serialized.isError) {
            throw Object.assign(new Error(serialized.value.message), serialized.value);
        }
        throw serialized.value;
    },
};
/**
 * Allows customizing the serialization of certain values.
 */
const transferHandlers = new Map([
    ["proxy", proxyTransferHandler],
    ["throw", throwTransferHandler],
]);
function expose(obj, ep = self) {
    ep.addEventListener("message", function callback(ev) {
        if (!ev || !ev.data) {
            return;
        }
        const { id, type, path } = Object.assign({ path: [] }, ev.data);
        const argumentList = (ev.data.argumentList || []).map(fromWireValue);
        let returnValue;
        try {
            const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);
            const rawValue = path.reduce((obj, prop) => obj[prop], obj);
            switch (type) {
                case "GET" /* GET */:
                    {
                        returnValue = rawValue;
                    }
                    break;
                case "SET" /* SET */:
                    {
                        parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
                        returnValue = true;
                    }
                    break;
                case "APPLY" /* APPLY */:
                    {
                        returnValue = rawValue.apply(parent, argumentList);
                    }
                    break;
                case "CONSTRUCT" /* CONSTRUCT */:
                    {
                        const value = new rawValue(...argumentList);
                        returnValue = proxy(value);
                    }
                    break;
                case "ENDPOINT" /* ENDPOINT */:
                    {
                        const { port1, port2 } = new MessageChannel();
                        expose(obj, port2);
                        returnValue = transfer(port1, [port1]);
                    }
                    break;
                case "RELEASE" /* RELEASE */:
                    {
                        returnValue = undefined;
                    }
                    break;
                default:
                    return;
            }
        }
        catch (value) {
            returnValue = { value, [throwMarker]: 0 };
        }
        Promise.resolve(returnValue)
            .catch((value) => {
            return { value, [throwMarker]: 0 };
        })
            .then((returnValue) => {
            const [wireValue, transferables] = toWireValue(returnValue);
            ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
            if (type === "RELEASE" /* RELEASE */) {
                // detach and deactive after sending release response above.
                ep.removeEventListener("message", callback);
                closeEndPoint(ep);
            }
        });
    });
    if (ep.start) {
        ep.start();
    }
}
function isMessagePort(endpoint) {
    return endpoint.constructor.name === "MessagePort";
}
function closeEndPoint(endpoint) {
    if (isMessagePort(endpoint))
        endpoint.close();
}
function wrap(ep, target) {
    return createProxy(ep, [], target);
}
function throwIfProxyReleased(isReleased) {
    if (isReleased) {
        throw new Error("Proxy has been released and is not useable");
    }
}
function createProxy(ep, path = [], target = function () { }) {
    let isProxyReleased = false;
    const proxy = new Proxy(target, {
        get(_target, prop) {
            throwIfProxyReleased(isProxyReleased);
            if (prop === releaseProxy) {
                return () => {
                    return requestResponseMessage(ep, {
                        type: "RELEASE" /* RELEASE */,
                        path: path.map((p) => p.toString()),
                    }).then(() => {
                        closeEndPoint(ep);
                        isProxyReleased = true;
                    });
                };
            }
            if (prop === "then") {
                if (path.length === 0) {
                    return { then: () => proxy };
                }
                const r = requestResponseMessage(ep, {
                    type: "GET" /* GET */,
                    path: path.map((p) => p.toString()),
                }).then(fromWireValue);
                return r.then.bind(r);
            }
            return createProxy(ep, [...path, prop]);
        },
        set(_target, prop, rawValue) {
            throwIfProxyReleased(isProxyReleased);
            // FIXME: ES6 Proxy Handler `set` methods are supposed to return a
            // boolean. To show good will, we return true asynchronously ¯\_(ツ)_/¯
            const [value, transferables] = toWireValue(rawValue);
            return requestResponseMessage(ep, {
                type: "SET" /* SET */,
                path: [...path, prop].map((p) => p.toString()),
                value,
            }, transferables).then(fromWireValue);
        },
        apply(_target, _thisArg, rawArgumentList) {
            throwIfProxyReleased(isProxyReleased);
            const last = path[path.length - 1];
            if (last === createEndpoint) {
                return requestResponseMessage(ep, {
                    type: "ENDPOINT" /* ENDPOINT */,
                }).then(fromWireValue);
            }
            // We just pretend that `bind()` didn’t happen.
            if (last === "bind") {
                return createProxy(ep, path.slice(0, -1));
            }
            const [argumentList, transferables] = processArguments(rawArgumentList);
            return requestResponseMessage(ep, {
                type: "APPLY" /* APPLY */,
                path: path.map((p) => p.toString()),
                argumentList,
            }, transferables).then(fromWireValue);
        },
        construct(_target, rawArgumentList) {
            throwIfProxyReleased(isProxyReleased);
            const [argumentList, transferables] = processArguments(rawArgumentList);
            return requestResponseMessage(ep, {
                type: "CONSTRUCT" /* CONSTRUCT */,
                path: path.map((p) => p.toString()),
                argumentList,
            }, transferables).then(fromWireValue);
        },
    });
    return proxy;
}
function myFlat(arr) {
    return Array.prototype.concat.apply([], arr);
}
function processArguments(argumentList) {
    const processed = argumentList.map(toWireValue);
    return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
}
const transferCache = new WeakMap();
function transfer(obj, transfers) {
    transferCache.set(obj, transfers);
    return obj;
}
function proxy(obj) {
    return Object.assign(obj, { [proxyMarker]: true });
}
function windowEndpoint(w, context = self, targetOrigin = "*") {
    return {
        postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),
        addEventListener: context.addEventListener.bind(context),
        removeEventListener: context.removeEventListener.bind(context),
    };
}
function toWireValue(value) {
    for (const [name, handler] of transferHandlers) {
        if (handler.canHandle(value)) {
            const [serializedValue, transferables] = handler.serialize(value);
            return [
                {
                    type: "HANDLER" /* HANDLER */,
                    name,
                    value: serializedValue,
                },
                transferables,
            ];
        }
    }
    return [
        {
            type: "RAW" /* RAW */,
            value,
        },
        transferCache.get(value) || [],
    ];
}
function fromWireValue(value) {
    switch (value.type) {
        case "HANDLER" /* HANDLER */:
            return transferHandlers.get(value.name).deserialize(value.value);
        case "RAW" /* RAW */:
            return value.value;
    }
}
function requestResponseMessage(ep, msg, transfers) {
    return new Promise((resolve) => {
        const id = generateUUID();
        ep.addEventListener("message", function l(ev) {
            if (!ev.data || !ev.data.id || ev.data.id !== id) {
                return;
            }
            ep.removeEventListener("message", l);
            resolve(ev.data);
        });
        if (ep.start) {
            ep.start();
        }
        ep.postMessage(Object.assign({ id }, msg), transfers);
    });
}
function generateUUID() {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}


//# sourceMappingURL=comlink.mjs.map


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 		} catch(e) {
/******/ 			module.error = e;
/******/ 			throw e;
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("main." + __webpack_require__.h() + ".hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("da061f6818238942b2dc")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises;
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		// eslint-disable-next-line no-unused-vars
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId) {
/******/ 				return trackBlockingPromise(require.e(chunkId));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				//inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results);
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 					blockingPromises.push(promise);
/******/ 					waitForBlockingPromises(function () {
/******/ 						return setStatus("ready");
/******/ 					});
/******/ 					return promise;
/******/ 				case "prepare":
/******/ 					blockingPromises.push(promise);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises.length === 0) return fn();
/******/ 			var blocker = blockingPromises;
/******/ 			blockingPromises = [];
/******/ 			return Promise.all(blocker).then(function () {
/******/ 				return waitForBlockingPromises(fn);
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						blockingPromises = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							},
/******/ 							[])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								} else {
/******/ 									return setStatus("ready").then(function () {
/******/ 										return updatedModules;
/******/ 									});
/******/ 								}
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error("apply() is only allowed in ready status");
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = __webpack_require__.hmrS_importScripts = __webpack_require__.hmrS_importScripts || {
/******/ 			0: 1
/******/ 		};
/******/ 		
/******/ 		// no chunk install function needed
/******/ 		// no chunk loading
/******/ 		
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			var success = false;
/******/ 			self["webpackHotUpdatereact_worker"] = (_, moreModules, runtime) => {
/******/ 				for(var moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						currentUpdate[moduleId] = moreModules[moduleId];
/******/ 						if(updatedModulesList) updatedModulesList.push(moduleId);
/******/ 					}
/******/ 				}
/******/ 				if(runtime) currentUpdateRuntime.push(runtime);
/******/ 				success = true;
/******/ 			};
/******/ 			// start update chunk loading
/******/ 			importScripts(__webpack_require__.p + __webpack_require__.hu(chunkId));
/******/ 			if(!success) throw new Error("Loading update chunk failed for unknown reason");
/******/ 		}
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.importScripsHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result;
/******/ 					if (newModuleFactory) {
/******/ 						result = getAffectedModuleEffects(moduleId);
/******/ 					} else {
/******/ 						result = {
/******/ 							type: "disposed",
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err2) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err2,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err2);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.importScrips = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.importScrips = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.importScripsHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						!__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						__webpack_require__.o(installedChunks, chunkId) &&
/******/ 						installedChunks[chunkId] !== undefined
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;