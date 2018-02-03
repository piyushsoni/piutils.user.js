Author and Copyright : Piyush Soni
Version 1.0


var isChrome = (navigator.userAgent.toLowerCase().indexOf('chrome') >= 0);
var isFirefox = (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0);


//String Utils
String.prototype.Contains = function(testStr, isExactMatch /*=false*/, isNOTCaseSensitive /*=false, i.e., case sensitive by default*/)
{
	var me = new String(this);
	if(isNOTCaseSensitive)
	{
		me = me.toLowerCase();
		testStr = testStr.toLowerCase();
	}
	
	if(!isExactMatch)
	{
		var index = this.indexOf(testStr);
		if(index >= 0)
		{
			containsIndex = index;
			return true;
		}
		else
			return false;
	}
	else
	{
		return (this == testStr);
	}
}

//Written only for strings and string arrays. Tests if the string 'Contains' any of the strings in the array
String.prototype.ContainsOneOf = function(array, isExactMatch /*=false*/, isNOTCaseSensitive /*=false, i.e., case sensitive by default*/)
{
	if(!array.length || array.length == 0)
		return false;
	
	for(var ind = 0; ind < array.length; ++ind)
	{
		if(this.Contains(array[ind], isExactMatch, isNOTCaseSensitive))
			return true;
	}
}

//Written only for strings and string arrays. Tests if any of the array's strings contain test string. 
Array.prototype.ArrayContains = function(testStr, isExactMatch /*=false*/, isNOTCaseSensitive /*=false, i.e., case sensitive by default*/)
{
	if(isExactMatch && !isNOTCaseSensitive)
		return (this.indexOf(testStr) > 0);
		
	for(var ind = 0; ind < this.length; ++ind)
	{
		if(this[ind].Contains(testStr, isExactMatch, isNOTCaseSensitive))
			return true;
	}
	
	return false;
}



//DOM Utils
function getChildrenByXPath(currentNode, xpath, CallBack, evaluationDoc, secondArgument, returnOnlyOne)
{
	var returnArray = new Array();
	var count = 0;
	var doc = evaluationDoc ? evaluationDoc : document;
	var nodesSnapshot;
	
	if(!xpath || typeof xpath != "string")
	{
		console.error('xpath : ' + xpath + ' is not string');
		return;
	}
	
	//When I send a node other than the document, I mostly want to select nodes 'under it'. And xpath
	//that starts with "//" defeats that purpose by still selecting from the root document. 
	//I have mostly not sent it for that purpose. 
	if(currentNode != document && xpath.indexOf("//") == 0)
	{
		xpath = "." + xpath; //This ensures that the nodes are selected under the currentNode. 
	}
	
	try
	{
		nodesSnapshot = doc.evaluate(xpath, currentNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
		if(returnOnlyOne)
		{
			if(nodesSnapshot && nodesSnapshot.snapshotLength > 0)
				return nodesSnapshot.snapshotItem(0);
			else
				return null;
		}
	
		for ( var i=0 ; i < nodesSnapshot.snapshotLength; i++ )
		{
			returnArray.push(CallBack ? CallBack(nodesSnapshot.snapshotItem(i), (secondArgument ? secondArgument : null)) : nodesSnapshot.snapshotItem(i));
		}
	
		return returnArray;
	}
	catch(ex)
	{
		console.error("xpath: " + xpath + ", error: " + ex.message );
	}

	return new Array();
}

function isHidden(el)
{
	if(!el || (el && el.type && el.type == 'hidden'))
		return true;
	else if(GM_getValue('AllowHidden', false))
		return false;
	
	if(el.style && (el.style.display == 'none' || el.style.display == 'hidden'))
		return true;
    var style = window.getComputedStyle(el);
    return (style.display === 'none' || style.display === 'hidden' || style.left < 0 || style.top < 0);
}

getElementXPath = function(element)
{
    if (element && element.id)
        return '//*[@id="' + element.id + '"]';
    else
        return getElementTreeXPath(element);
};

getElementTreeXPath = function(element)
{
    var paths = [];

    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var index = 0;
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
        {
            // Ignore document type declaration.
            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

            if (sibling.nodeName == element.nodeName)
                ++index;
        }

        var tagName = element.nodeName.toLowerCase();
        var pathIndex = (index ? "[" + (index+1) + "]" : "");
        paths.splice(0, 0, tagName + pathIndex);
    }

    return paths.length ? "/" + paths.join("/") : null;
};

function $(identifier, altParent, returnAll)
{
	var obj = null, objs = null;
	doc = altParent ? altParent : document;
	if(identifier.indexOf(".") == 0)
	{
		identifier = identifier.replace(".","");
		objs = doc.getElementsByClassName(identifier);
	}
	else if(identifier.indexOf("<") == 0)
	{
		identifier = identifier.replace("<","").replace(">","");
		objs = doc.getElementsByTagName(identifier);
	}
	else
	{
		obj = doc.getElementById(identifier);
		if(!obj)
		objs = doc.getElementsByName(identifier);
	}
	if(objs && objs.length > 0)
	{
		if(returnAll)
		return objs;
		else
		return objs[0];
	}   
	else
	return obj;
}

function random(intIn)
{
	//return a random integer from 0 to intIn. 
	return Math.round(Math.random() * intIn);
}

function randomBetween(int1, int2)
{
	return random(int2 - int1) + int1;
}

function FireClickEvent(obj, xpath)
{
	if(!obj || isHidden(obj))
	{
		console.log('Was told to click the object with calculated xpath: ' + getElementXPath(obj) + ' but returning since it is hidden');
		return;
	}
		
	answeredSomething = true;
	
	var clickEvent = window.document.createEvent("MouseEvent");
	clickEvent.initEvent("click", true, true);
    obj.dispatchEvent(clickEvent);
	// if(obj.onclick)
		// obj.onclick();
	
	console.log(obj);
	if(xpath)
		console.log("Clicked above mentioned object with xpath: " + xpath);
	else
		console.log("Clicked above mentioned object.");
}

function FireChangeEvent(obj)
{
	if(!obj)
	{
		console.error("obj null, can't click change event");
		return;
	}
	
    var evt = document.createEvent("Events");
    evt.initEvent("change", true, true);
    return !obj.dispatchEvent(evt);
}


//Window Utils
function windowStaysInFocus()
{
    Object.defineProperty(document, "hidden", { value : false});
    window.top.document.hasFocus = function () {return true;};
}



//Cookies
//***************************************************************************
function createCookie(name,value,days) 
{
    if (days) 
    {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) 
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) 
    {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) 
            return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) 
{
    createCookie(name,"",-1);
}
//***************************************************************************



//Query String
//***************************************************************************
function getQuerystring(key, default_)
{
  if (default_==null) default_="";
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]").toLowerCase();
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  url = new String(window.location.href).toLowerCase();
  var qs = regex.exec(url);
  if(qs == null)
    return default_;
  else
    return qs[1];
}
//***************************************************************************



//Get/Set State/variables 
function getFromGMOrAsk(key, failValue, message)
{
    let value = GM_getValue(key, failValue);
    if(value == failValue)
    {
        value = prompt(message);
        if(value != failValue)
            GM_setValue(key, value);
    }
    return value;
}


