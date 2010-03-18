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
 *   Mark Finkle <mark.finkle@gmail.com>, <mfinkle@mozilla.com>
 *   Cesar Oliveira <a.sacred.line@gmail.com>
 *   Matthew Gertner <matthew@allpeers.com>
 *
 * ***** END LICENSE BLOCK ***** */

const Cc = Components.classes;
const Ci = Components.interfaces;

EXPORTED_SYMBOLS = ["WebAppProperties", "FileIO"];

const PR_WRONLY = 0x02;
const PR_CREATE_FILE = 0x08;
const PR_TRUNCATE = 0x20;

const PR_PERMS_FILE = 0644;
const PR_PERMS_DIRECTORY = 0755;

const PR_UINT32_MAX = 4294967295;

/**
 * Constructs an nsISimpleEnumerator for the given array of items.
 */
function ArrayEnumerator(aItems) {
  this._items = aItems;
  this._nextIndex = 0;
}

ArrayEnumerator.prototype = {
  hasMoreElements: function()
  {
    return this._nextIndex < this._items.length;
  },
  getNext: function()
  {
    if (!this.hasMoreElements())
      throw Components.results.NS_ERROR_NOT_AVAILABLE;

    return this._items[this._nextIndex++];
  },
  QueryInterface: function(aIID)
  {
    if (Ci.nsISimpleEnumerator.equals(aIID) ||
        Ci.nsISupports.equals(aIID))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

/**
 * Directory provider for web app directory.
 */

function WebRunnerDirectoryProvider(aFolder) {
  this._folder = aFolder;
}

WebRunnerDirectoryProvider.prototype = {
  getFile: function(prop, persistent) {
    if (prop == "WebAppD") {
      return this._folder.clone();
    }
    else {
      return Components.results.NS_ERROR_FAILURE;
    }
  },

  getFiles: function(prop, persistent) {
    return Components.results.NS_ERROR_FAILURE;
  },

  QueryInterface: function(iid) {
    if (iid.equals(Ci.nsIDirectoryServiceProvider) ||
        iid.equals(Ci.nsIDirectoryServiceProvider2) ||
        iid.equals(Ci.nsISupports))
    {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

/**
 * Directory provider that provides access to external chrome icons
 */
const NS_APP_CHROME_DIR_LIST = "AChromDL";

function IconProvider(aFolder) {
  this._folder = aFolder;
}

IconProvider.prototype = {
  getFile: function(prop, persistent) {
    return Components.results.NS_ERROR_FAILURE;
  },

  getFiles: function(prop, persistent) {
    if (prop == NS_APP_CHROME_DIR_LIST) {
      return new ArrayEnumerator([this._folder.clone()]);
    }
    else {
      return Components.results.NS_ERROR_FAILURE;
    }
  },

  QueryInterface: function(iid) {
    if (iid.equals(Ci.nsIDirectoryServiceProvider) ||
        iid.equals(Ci.nsIDirectoryServiceProvider2) ||
        iid.equals(Ci.nsISupports))
    {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

var WebAppProperties =
{
  script : {},
  scriptLoaded : false,
  id : "",
  name : null,
  fileTypes : [],
  uri : null,
  icon : "webapp",
  status : false,
  location : false,
  sidebar : false,
  trayicon: false,
  credits : "",
  splashscreen : null,
  navigation : false,
  include : null,
  exclude : null,
  refresh : null,
  iconic : false,
  maximize: false,
  appBundle : null,
  appRoot : null,
  installRoot : null,
  flags : ["id", "name", "uri", "icon", "status", "location", "sidebar", "trayicon", "navigation",
           "credits", "splashscreen", "include", "exclude", "refresh", "iconic", "maximize"],

  getInstallRoot : function() {
    if (!this.installRoot) {
      var dirSvc = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);

      this.installRoot = dirSvc.get("AppData", Ci.nsIFile);
      this.installRoot.append("WebApps");

      // Register the directory provider for the web apps directory
      var installRoot = this.getInstallRoot();
      
      var dirProvider = new WebRunnerDirectoryProvider(installRoot);
      dirSvc.QueryInterface(Ci.nsIDirectoryService).registerProvider(dirProvider);
    }
    
    return this.installRoot;
  },
  
  getAppRoot : function() {
    if (this.appRoot) {
      return this.appRoot.clone();
    }
    else {
      if (!this.installRoot) {
        this.getInstallRoot();
      }
    
      var dirSvc = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
      var appRoot = dirSvc.get("WebAppD", Ci.nsIFile);
      appRoot.append(this.id);
      return appRoot;
    }
  },

  setParameter: function(aName, aValue) {
    if (WebAppProperties.flags.indexOf(aName) == -1)
      return;

    if (typeof WebAppProperties[aName] == "boolean" && typeof aValue != "boolean")
      aValue = (aValue.toLowerCase() == "true" || aValue.toLowerCase() == "yes");

    WebAppProperties[aName] = aValue;
  },

  readINI : function(aFile) {
    var iniFactory = Components.manager.getClassObjectByContractID("@mozilla.org/xpcom/ini-parser-factory;1", Ci.nsIINIParserFactory);
    var iniParser = iniFactory.createINIParser(aFile);

    var keys = iniParser.getKeys("Parameters");
    while (keys.hasMore()) {
      var key = keys.getNext();
      var value = iniParser.getString("Parameters", key);
      this.setParameter(key.toLowerCase(), value);
    }

    keys = iniParser.getKeys("FileTypes");
    while (keys.hasMore()) {
      var key = keys.getNext();
      var value = iniParser.getString("Parameters", key);
      var values = value.split(";");
      if (values.length == 4) {
        var type = {};
        type.name = values[0];
        type.extension = values[1];
        type.description = values[2];
        type.contentType = values[3];
        WebAppProperties.fileTypes.push(type);
      }
    }
  },

  init : function(aFile) {
    this.appRoot = aFile.clone();
    
    var appSandbox = aFile.clone();

    // Read the INI settings
    var appINI = appSandbox.clone();
    appINI.append("webapp.ini");
    if (appINI.exists())
      this.readINI(appINI);

    // Load the application script (if it isn't already loaded)
    if (!this.scriptLoaded) {
      var appScript = appSandbox.clone();
      appScript.append("webapp.js");
      if (appScript.exists()) {
        var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        var appScriptURI = ios.newFileURI(appScript);

        var scriptLoader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
        scriptLoader.loadSubScript(appScriptURI.spec, WebAppProperties.script);
        this.scriptLoaded = true;
      }
    }

    // Load the application style
    var appStyle = appSandbox.clone();
    appStyle.append("webapp.css");
    if (appStyle.exists()) {
      var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
      var appStyleURI = ios.newFileURI(appStyle);

      var styleSheets = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
      styleSheets.loadAndRegisterSheet(appStyleURI, styleSheets.USER_SHEET);
    }

    // Initialize the icon provider
    var dirSvc = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIDirectoryService);
    var iconProvider = new IconProvider(aFile);
    dirSvc.registerProvider(iconProvider);
  }
};

var FileIO = {
  // Returns the text content of a given nsIFile
  fileToString : function(file) {
    // Get a nsIFileInputStream for the file
    var fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    fis.init(file, -1, 0, 0);

    // Get an intl-aware nsIConverterInputStream for the file
    var is = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
    is.init(fis, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

    // Read the file into string via buffer
    var data = "";
    var buffer = {};
    while (is.readString(4096, buffer) != 0) {
      data += buffer.value;
    }

    // Clean up
    is.close();
    fis.close();

    return data;
  },

  // Saves the given text string to the given nsIFile
  stringToFile : function(data, file, encoding) {
    encoding = encoding || "UTF-8";
        
    // Get a nsIFileOutputStream for the file
    var fos = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    fos.init(file, PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE, (arguments.length == 3 ? arguments[2] : PR_PERMS_FILE), 0);

    // Get an intl-aware nsIConverterOutputStream for the file
    var os = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
    os.init(fos, encoding, 0, 0x0000);

    // Write data to the file
    os.writeString(data);

    // Clean up
    os.close();
    fos.close();
  }
};
