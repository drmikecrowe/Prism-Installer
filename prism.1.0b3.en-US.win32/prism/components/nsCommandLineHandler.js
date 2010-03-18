//@line 2 "z:\Development\moz1.9.2\src\prism\components\src\nsCommandLineHandler.js"
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is WebRunner.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Matthew Gertner <matthew.gertner@gmail.com>
 *
 * ***** END LICENSE BLOCK ***** */
 
/* Development of this Contribution was supported by Yahoo! Inc. */

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var WebRunnerCloseEvent = function() {
};

WebRunnerCloseEvent.prototype = {
  run: function() {
    var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
    appStartup.quit(appStartup.eForceQuit);
  },
  
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports)) {
            return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

function WebRunnerCommandLineHandler() {
}

WebRunnerCommandLineHandler.prototype = {
  classDescription: "WebRunnerCommandLineHandler",
  classID: Components.ID("{8fd0bfd1-4d85-4167-804f-0911cb3224dc}"),
  contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=webrunner",
  
  _xpcom_categories: [{ category: "command-line-handler", entry: "m-webrunner" }],
  
  QueryInterface: XPCOMUtils.generateQI([Ci.nsICommandLineHandler]),
     
  handle : function(aCmdLine) {
    if (!aCmdLine)
      return;
      
    Components.utils.import("resource://prism/modules/WebAppProperties.jsm");

    var file = null;

    if (aCmdLine.handleFlag("close", false)) {
      var mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
      mainThread.dispatch(new WebRunnerCloseEvent(), Ci.nsIEventTarget.DISPATCH_NORMAL);
      aCmdLine.preventDefault = true;
      return;
    }

    // Check for a webapp profile
    var environment = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
    var webapp;
    if (environment.exists("PRISM_WEBAPP")) {
      webapp = environment.get("PRISM_WEBAPP");
    }
    else {
      webapp = aCmdLine.handleFlagWithParam("webapp", false);
    }

//@line 108 "z:\Development\moz1.9.2\src\prism\components\src\nsCommandLineHandler.js"
    
    if (webapp) {
      // Check for a bundle first
      try {
        if (aCmdLine.state == aCmdLine.STATE_INITIAL_LAUNCH) {
          file = aCmdLine.resolveFile(webapp);
        }
        else {
          file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
          file.initWithPath(webapp);
        }
      }
      catch (ex) {
        // Ouch, not a file
        file = null;
      }

      // Do we have a valid file? or did it fail?
      if (!file || !file.exists()) {
        // Its not a bundle. look for an installed webapp
        var installRoot = WebAppProperties.getInstallRoot();
        var appSandbox = installRoot.clone();
        appSandbox.append(webapp);
        if (appSandbox.exists())
          file = appSandbox.clone();
      }
    }

    // Load any prefs from the bundle (e.g. inherited from Firefox)
    if (file) {
      this.loadPrefs(file);
    }

    var protocolURI = null;
    var callback = {};

    // Check for an OSX launch
    var uriSpec = aCmdLine.handleFlagWithParam("url", false);
    if (uriSpec) {
      // Check whether we were launched as a protocol
      // If so, get the URL to load for the protocol scheme
      var platform = Cc["@mozilla.org/platform-web-api;1"].createInstance(Ci.nsIPlatformGlue);
      protocolURI = platform.getProtocolURI(uriSpec, callback);

      if (!protocolURI || protocolURI.length == 0) {
        var uri = aCmdLine.resolveURI(uriSpec);
        if (!file && uri.scheme == "file") {
          file = uri.QueryInterface(Ci.nsIFileURL).file;
        }
      }
    }
    
    if (file && file.exists()) {
      // Bundles are files and need to be installed
      if (!file.isDirectory()) {
        Components.utils.import("resource://prism/modules/WebAppInstall.jsm");
        file = WebAppInstall.install(file);
      }
      WebAppProperties.init(file);
    }

    for (var index in WebAppProperties.flags) {
      var key = WebAppProperties.flags[index];
      try {
        var value = aCmdLine.handleFlagWithParam(key, false);
      }
      catch(e) {
        if (e.result == Components.results.NS_ERROR_INVALID_ARG) {
          // Boolean parameters are true if they don't have an explicit value
          value = true;
        }
      }
      if (value != null)
        WebAppProperties.setParameter(key, value);
    }
    
    if (protocolURI && protocolURI.length > 0) {
      WebAppProperties.uri = protocolURI;
    }
    
    var win = this.activateWindow();

    if (callback.value) {
      // Invoke the callback and don't load a new page
      callback.value.handleURI(uriSpec);

      aCmdLine.preventDefault = true;
      return;
    }

    // Check for an existing window and reuse it if there is one
    if (win) {
      if (protocolURI) {
        win.document.getElementById("browser_content").loadURI(WebAppProperties.uri, null, null);
      }
      
      aCmdLine.preventDefault = true;
      return;
    }
    
    if (WebAppProperties.script.startup)
      WebAppProperties.script.startup();
  },
  
  activateWindow : function() {
    var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var win = windowMediator.getMostRecentWindow("navigator:browser");

    if (win) {
      var event = win.document.QueryInterface(Ci.nsIDOMDocumentEvent).createEvent("Events");
      event.initEvent("DOMActivate", true, true);
      win.QueryInterface(Ci.nsIDOMEventTarget).dispatchEvent(event);
    }
    
    return win;
  },

  loadPrefs : function(root) {
    try {
      var prefFile = root.clone();
      prefFile.append("prefs.json");
      if (prefFile.exists()) {
        var json = FileIO.fileToString(prefFile);
        var nativeJSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
        var prefValues = nativeJSON.decode(json);
        var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        prefs = prefs.getBranch("network.proxy.");
        for (prefNum in prefValues) {
          var pref = prefValues[prefNum];
          switch (pref.type) {
            case prefs.PREF_STRING: prefs.setCharPref(pref.name, pref.value); break;
            case prefs.PREF_INT: prefs.setIntPref(pref.name, pref.value); break;
            case prefs.PREF_BOOL: prefs.setBoolPref(pref.name, pref.value); break;
          }
        }
        prefFile.remove(false);
      }
    }
    catch(e) {
      // Something went wrong, let's catch it here so we can at least run the app properly
      Components.utils.reportError(e);
    }
  },
  
  helpInfo : "",
};

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([WebRunnerCommandLineHandler]);
}
