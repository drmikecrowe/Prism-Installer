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
 * The Original Code is Mozilla.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Matthew Gertner <matthew@allpeers.com>
 *   Mark Finkle <mark.finkle@gmail.com>, <mfinkle@mozilla.com>
 *
 * ***** END LICENSE BLOCK ***** */

Components.utils.import("resource://prism/modules/ImageUtils.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;
const PR_UINT32_MAX = 4294967295;

EXPORTED_SYMBOLS = ["FaviconDownloader"];

function FaviconDownloader() {
  this._storageStream = null;
  this._outputStream = null;
  this._mimeType = null;
  this._callback = null;
  this._iframe = null;
  this._haveIcon = false;
}

FaviconDownloader.prototype = {
  QueryInterface : function(iid) {
    if (iid,equals(Ci.nsISupports) || iid.equals(Ci.nsIStreamListener))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  startDownload : function(uri, iframe, callback) {
    this._iframe = iframe;
    this._callback = callback;
    this._mimeType = null;
    this._haveIcon = false;

    // Hook the iframe events to the favicon loader
    this._iframe.addEventListener("DOMLinkAdded", this, false);
    this._iframe.addEventListener("DOMContentLoaded", this, false);

    // Load the web content into the iframe, which also starts the favicon download
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var channel = ioService.newChannelFromURI(uri);
    var uriLoader = Cc["@mozilla.org/uriloader;1"].getService(Ci.nsIURILoader);
    uriLoader.openURI(channel, true, this._iframe.docShell);
  },

  get mimeType() {
    return this._mimeType;
  },

  get imageStream()
  {
    if (this._haveIcon)
      return this._storageStream.newInputStream(0);
    else
      return null;
  },

  handleEvent : function(event)
  {
    switch(event.type) {
      case "DOMLinkAdded":
        this.onLinkAdded(event);
        break;
      case "DOMContentLoaded":
        this.onContentLoaded(event);
        break;
    }
  },

  onLinkAdded : function(event)
  {
    var link = event.originalTarget;
    if (link.rel.toLowerCase() == "icon") {
      var mimeType = link.type;
      var iconURISpec = event.originalTarget.baseURIObject.resolve(link.href);
      var mimeService = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService);
      var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
      var iconURI = ioService.newURI(iconURISpec, null, null);
      if (mimeType == "") {
        mimeType = mimeService.getTypeFromURI(iconURI);
      }
      this.loadIcon(mimeType, iconURISpec);
    }
  },

  onContentLoaded : function(event)
  {
    if (!this._mimeType)
    {
      // Didn't find a <link rel="icon"...> so try to guess where the favicon is
      this.loadIcon("image/vnd.microsoft.icon", event.originalTarget.baseURIObject.prePath + "/favicon.ico");
    }
  },

  loadIcon : function(mimeType, uriSpec)
  {
    this._mimeType = mimeType;
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var channel = ioService.newChannel(uriSpec, "", null);
    channel.asyncOpen(this, null);
  },

  onStartRequest : function(request, context)
  {
    this._storageStream = ImageUtils.createStorageStream();
    this._outputStream = ImageUtils.getBufferedOutputStream(this._storageStream);
  },

  onStopRequest : function(request, context, statusCode)
  {
    this._iframe.removeEventListener("DOMLinkAdded", this, false);
    this._iframe.removeEventListener("DOMContentLoaded", this, false);

    // Need to check if we've been redirected to an error page
    if (statusCode == Components.results.NS_OK &&
        request.QueryInterface(Ci.nsIChannel).contentType != "text/html") {
      this._outputStream.flush();
      this._haveIcon = true;
    }

    if (this._callback)
      this._callback();
  },

  onDataAvailable : function(request, context, inputStream, offset, count)
  {
    this._outputStream.writeFrom(inputStream, count);
  }
};
