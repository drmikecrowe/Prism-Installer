/*
//@line 40 "z:\Development\moz1.9.2\src\prism\components\src\nsPlatformGlue.js"
*/

/* Development of this Contribution was supported by Yahoo! Inc. */

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const PRISM_PROTOCOL_PREFIX = "prism.protocol.";
const PROTOCOL_HANDLER_CLASSNAME = "WebRunner protocol handler";
const PROTOCOL_HANDLER_CID = Components.ID("{2033eb27-55cf-4e06-80ae-134b59ed5437}");

function PlatformGlueSound() {
  //Constructor
}

PlatformGlueSound.prototype = {
  classDescription: "Platform sound API",
  classID:          Components.ID("{eb7e36e0-ec6d-11dc-95ff-0800200c9a66}"),
  contractID:       "@mozilla.org/platform-sound-api;1",

  QueryInterface: XPCOMUtils.generateQI(
    [Ci.nsIPlatformGlueSound,
     Ci.nsISecurityCheckedComponent,
     Ci.nsIClassInfo]),

  // nsIClassInfo
  implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,
  flags: Ci.nsIClassInfo.DOM_OBJECT,

  getInterfaces: function getInterfaces(aCount) {
    var interfaces = [Ci.nsIPlatformGlueSound,
                      Ci.nsISecurityCheckedComponent,
                      Ci.nsIClassInfo];
    aCount.value = interfaces.length;
    return interfaces;
  },

  getHelperForLanguage: function getHelperForLanguage(aLanguage) {
    return null;
  },

  //nsISecurityCheckedComponent
  canCallMethod: function canCallMethod(iid, methodName) {
    Components.utils.reportError(methodName);
    return "AllAccess";
  },

  canCreateWrapper: function canCreateWrapper(iid) {
    return "AllAccess";
  },

  canGetProperty: function canGetProperty(iid, propertyName) {
    Components.utils.reportError(propertyName);
    return "AllAccess";
  },

  canSetProperty: function canSetProperty(iid, propertyName) {
    Components.utils.reportError(propertyName);
    return "NoAccess";
  },

  //nsIPlatformGlueSound
  beep: function beep() {
    var sound = Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound);
    sound.beep();
  },

  playSound: function playSound(aSoundURI) {
    var sound = Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound);
    if (aSoundURI.indexOf("://") == -1) {
      sound.playSystemSound(aSoundURI);
    }
    else
    {
      var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
      sound.play(ioService.newURI(aSoundURI, null, null));
    }
  }
}

function MakeProtocolHandlerFactory(contractid, platformGlue) {
  var factory = {
    QueryInterface: function (aIID) {
      if (!aIID.equals(Components.interfaces.nsISupports) &&
        !aIID.equals(Components.interfaces.nsIFactory))
        throw Components.results.NS_ERROR_NO_INTERFACE;
      return this;
    },
    createInstance: function (outer, iid) {
      if (outer != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;
      return (new PlatformProtocolHandler(contractid, platformGlue)).QueryInterface(iid);
    }
  };

  return factory;
}

function PlatformProtocolHandler(contractid, platformGlue) {
  this._ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  this._platformGlue = platformGlue;
}

PlatformProtocolHandler.prototype = {
  QueryInterface: XPCOMUtils.generateQI(
    [Ci.nsIProtocolHandler,
    Ci.nsIClassInfo]),

  // nsIClassInfo
  implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,
  flags: Ci.nsIClassInfo.DOM_OBJECT,

  getInterfaces: function getInterfaces(aCount) {
    var interfaces = [Ci.nsIProtocolHandler,
                      Ci.nsIClassInfo];
    aCount.value = interfaces.length;
    return interfaces;
  },

  getHelperForLanguage: function getHelperForLanguage(aLanguage) {
    return null;
  },

  get defaultPort() {
    return 80;
  },

  get protocolFlags() {
    return 0;
  },

  newURI: function newURI(aSpec, anOriginalCharset, aBaseURI) {
    var callback = {};
    var uriString = this._platformGlue.getProtocolURI(aSpec, callback);
    if (!callback.value) {
      return this._ioService.newURI(uriString, "", null);
    }
    else {
      // Use the original URI so we can invoke the callback and cancel
      var uri = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI);
      uri.spec = aSpec;
      return uri;
    }
  },
  
  newChannel: function newChannel(aUri) {
    // We never create a channel for the protocol since it redirects to the protocol URI in newURI
    throw Components.results.NS_ERROR_UNEXPECTED;
  },
  
  allowPort: function allowPort(aPort, aScheme) {
    // We are not overriding any special ports
    return false;
  }
}

var protocolCallbacks = {};

function PlatformGlue() {
  var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  var win = windowMediator.getMostRecentWindow("navigator:browser");
  if (win) {
    var browser = win.document.getElementById("browser_content");
    this.setWindow(browser.contentWindow);
  }
}

PlatformGlue.prototype = {
  classDescription: "Platform web API",
  classID:          Components.ID("{d3a004e0-0532-4b0d-b7be-8ed90eab675f}"),
  contractID:       "@mozilla.org/platform-web-api;1",

  _xpcom_categories : [
     { category: "JavaScript global property", entry: "platform" },
  ],

  _prefs : Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch),
  _window : null,
  _chromeWindow : null,
  _icon : null,

  QueryInterface: XPCOMUtils.generateQI(
    [Ci.nsIPlatformGlue,
     Ci.nsIPlatformGlueInternal,
     Ci.nsISecurityCheckedComponent,
     Ci.nsISupportsWeakReference,
     Ci.nsIClassInfo]),

  // nsIClassInfo
  implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,
  flags: Ci.nsIClassInfo.DOM_OBJECT,

  getInterfaces: function getInterfaces(aCount) {
    var interfaces = [Ci.nsIPlatformGlue,
                      Ci.nsIPlatformGlueInternal,
                      Ci.nsISecurityCheckedComponent,
                      Ci.nsISupportsWeakReference,
                      Ci.nsIClassInfo];
    aCount.value = interfaces.length;
    return interfaces;
  },

  getHelperForLanguage: function getHelperForLanguage(aLanguage) {
    return null;
  },

  //nsISecurityCheckedComponent
  canCallMethod: function canCallMethod(iid, methodName) {
    Components.utils.reportError(methodName);
    return "AllAccess";
  },

  canCreateWrapper: function canCreateWrapper(iid) {
    return "AllAccess";
  },

  canGetProperty: function canGetProperty(iid, propertyName) {
    Components.utils.reportError(propertyName);
    return "AllAccess";
  },

  canSetProperty: function canSetProperty(iid, propertyName) {
    Components.utils.reportError(propertyName);
    return "NoAccess";
  },

  // nsIPlatformGlueInternal
  setWindow : function setWindow(aWindow) {
    this._window = aWindow;
    var webNav = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation);
    var rootTreeItem = webNav.QueryInterface(Ci.nsIDocShellTreeItem).rootTreeItem;
    var xulWindow = rootTreeItem.treeOwner.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIXULWindow);
    this._chromeWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal).QueryInterface(Ci.nsIDOMWindow);
  },
  
  registerProtocolFactory : function(uriScheme) {
    var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
    var contractId = "@mozilla.org/network/protocol;1?name=" + uriScheme;
    registrar.registerFactory(PROTOCOL_HANDLER_CID, PROTOCOL_HANDLER_CLASSNAME, contractId,
      MakeProtocolHandlerFactory(contractId, this));
  },
  
  //nsIPlatformGlue
  showNotification: function showNotification(aTitle, aText, aImageURI, textClickable, aListener)
  {
    var alertListener = (!aListener) ? null :
      {
        observe: function(subject, topic, data) {
            if ((topic === "alertclickcallback") && !!textClickable) {
              aListener.onClick();
            } else if (topic === "alertfinished") {
              /* Workaround to allow optional callback. Checking for null is not
               * possible as the interface and not the passed object is tested.
               */
              try {
                aListener.onFinished();
              } catch(err) {
                // Do nothing.
              }
            }
          }
      };

    var alerts = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
    alerts.showAlertNotification(aImageURI, aTitle, aText, !!textClickable, "", alertListener);
  },

  postStatus: function postStatus(aName, aValue) {
    if (this._icon)
      this._icon.setBadgeText(aValue);
  },
  
  openURI : function openURI(aURISpec) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var extps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
    extps.loadURI(ioService.newURI(aURISpec, null, null), null);
  },
  
  canQuitApplication : function canQuitApplication() {
    var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    if (!os) return true;
    
    try {
      var cancelQuit = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
      os.notifyObservers(cancelQuit, "quit-application-requested", null);
      
      // Something aborted the quit process. 
      if (cancelQuit.data)
        return false;
    }
    catch (ex) { }
    return true;
  },

  quit : function quit() {
    if (!this.canQuitApplication())
      return false;

    var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
    appStartup.quit(Ci.nsIAppStartup.eAttemptQuit);
    return true;
  },

 
  sound: function sound() {
    if (!this._sound)
      this._sound = new PlatformGlueSound();
    return this._sound;
  },

  icon: function icon() {
    if (!this._window) {
      // Not initialized yet
      throw Components.results.NS_ERROR_NOT_INITIALIZED;
    }
    
    if (!this._icon) {
      var desktop = Cc["@mozilla.org/desktop-environment;1"].getService(Ci.nsIDesktopEnvironment);
      this._icon = desktop.getApplicationIcon(this._window);
    }
    return this._icon;
  },
  
  registerProtocolHandler: function registerProtocol(uriScheme, uriString) {
    // First register the protocol with the shell
    var shellService = Cc["@mozilla.org/desktop-environment;1"].getService(Ci.nsIWebProtocolService);
    shellService.registerProtocol(uriScheme, null, null);
    
    // Register with the component registrar
    this.registerProtocolFactory(uriScheme);
    
    // Then store a pref so we remember the URI string we want to load
    this._prefs.setCharPref(PRISM_PROTOCOL_PREFIX + uriScheme, uriString);
  },
  
  registerProtocolCallback : function(uriScheme, callback) {
    protocolCallbacks[uriScheme] = callback;
  },
  
  unregisterProtocolHandler: function unregisterProtocol(uriScheme) {
    // Unregister the protocol with the shell so the URI scheme no longer invokes the application
    var shellService = Cc["@mozilla.org/desktop-environment;1"].getService(Ci.nsIWebProtocolService);
    shellService.unregisterProtocol(uriScheme);
    
    // Unregister with the component registrar
    var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
    var contractId = "@mozilla.org/network/protocol;1?name=" + uriScheme;
    // Now what?

    // And remove the pref
    this._prefs.clearUserPref(PRISM_PROTOCOL_PREFIX + uriScheme);
    
    // Remove the callback, if any
    if (uriScheme in protocolCallbacks) {
      delete protocolCallbacks[uriScheme];
    }
  },
  
  getProtocolURI : function getProtocolURI(uriSpec, callback) {
    var uriScheme = uriSpec.replace(/(.*):.*/, "$1");
    if (callback && uriScheme in protocolCallbacks) {
      callback.value = protocolCallbacks[uriScheme];
    }
    try {
      var uriString = this._prefs.getCharPref(PRISM_PROTOCOL_PREFIX + uriScheme);
      return uriString.replace(/%s/, escape(uriSpec.replace(/.*:(.*)/, "$1")));
    }
    catch (e) {
      return "";
    }
  },
  
  isRegisteredProtocolHandler : function isRegisteredProtocolHandler(uriScheme) {
    var shellService = Cc["@mozilla.org/desktop-environment;1"].getService(Ci.nsIWebProtocolService);
    var appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    try {
      return (shellService.getDefaultApplicationForURIScheme(uriScheme) == appInfo.name);
    }
    catch(e) {
      return false;
    }
  },
  
  clearPrivateData : function clearPrivateData() {
    Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader).
      loadSubScript("chrome://webrunner/content/browser/sanitize.js", null);
    Sanitizer.sanitize();
  },
  
  getAttention : function getAttention() {
    this._chromeWindow.getAttention();
  },
  
  restoreWindow : function restoreWindow() {
    var evt = this._window.document.createEvent("Events");
    evt.initEvent("DOMActivate", true, false);
    this._chromeWindow.dispatchEvent(evt);
  },

  showPreferences : function showPreferences(paneToShow)
  {
    this._chromeWindow.openDialog("chrome://webrunner/content/preferences/preferences.xul", "preferences", "chrome,titlebar,toolbar,centerscreen,dialog", paneToShow);
  },
  
  showAbout : function showAbout()
  {
    this._chromeWindow.openDialog("chrome://webrunner/content/about.xul", "about", "centerscreen,modal");
  }
}

var components = [PlatformGlue];

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}
