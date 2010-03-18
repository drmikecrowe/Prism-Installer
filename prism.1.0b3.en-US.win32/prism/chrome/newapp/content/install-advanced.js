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
 *   Mark Finkle, <mark.finkle@gmail.com>, <mfinkle@mozilla.com>
 *
 * ***** END LICENSE BLOCK ***** */

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://prism/modules/WebAppInstall.jsm");

var InstallAdvanced = {
  init : function() {
    var menulist = document.getElementById("groups");

    var profiles = WebAppInstall.getProfileRoot();
    var entries = profiles.directoryEntries;
    while (entries.hasMoreElements()) {
      var entry = entries.getNext().QueryInterface(Ci.nsIFile);
      if (entry.isDirectory() && entry.leafName.toLowerCase() != "profiles") {
        menulist.appendItem(entry.leafName, entry.leafName);
      }
    }
  },

  accept : function() {
    if (window.arguments) {
      var group = null;
      var radiogroup = document.getElementById("grouping");
      if (radiogroup.selectedIndex == 0) {
        group = document.getElementById("group").value;
      }
      else {
        group = document.getElementById("groups").selectedItem.value;
      }

      var bundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
      bundle = bundle.createBundle("chrome://@PACKAGE@/locale/install-advanced.properties");

      // Trim leading / trailing spaces
      group = group.replace(/^\s+/, "").replace(/\s+$/, "");
      if (group.length == 0) {
        alert(bundle.GetStringFromName("group.missing"));
        return false;
      }

      // Check for invalid characters (mainly Windows)
      if (/([\\*:?<>|\/\"])/.test(group)) {
        alert(bundle.GetStringFromName("group.invalid"));
        return false;
      }

      window.arguments[0].group = group;
    }

    return true;
  }
};
