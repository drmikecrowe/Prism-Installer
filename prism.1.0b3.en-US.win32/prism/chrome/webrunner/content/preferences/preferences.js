const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://prism/modules/WebAppProperties.jsm");

var WebRunnerPrefs =
{
  init : function() {
    var prefXUL = WebAppProperties.getAppRoot();
    prefXUL.append("preferences");
    prefXUL.append("prefs.xul");

    if (prefXUL.exists()) {
      var prefProperties = WebAppProperties.getAppRoot();
      prefProperties.append("preferences");
      prefProperties.append("prefs.properties");
      
      var label;
      if (prefProperties.exists()) {
        var bundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
        bundle = bundle.createBundle("resource://webapp/preferences/prefs.properties");
        label = bundle.GetStringFromName("pane.label");
      }
      else {
        label = WebAppProperties.name;
      }
    
      var prefPane = document.createElement("prefpane");
      prefPane.id = "paneWebApp";
      prefPane.setAttribute("label", label);
      prefPane.src = "resource://webapp/preferences/prefs.xul";
      prefPane.image = "resource://webapp/preferences/prefs.png";
      
      var prefWindow = document.getElementById("BrowserPreferences");

      prefWindow.insertBefore(prefPane, prefWindow.firstChild);
      var radio = document.createElement("radio");
      radio.setAttribute("pane", prefPane.id);
      radio.setAttribute("label", prefPane.label);
      // Expose preference group choice to accessibility APIs as an unchecked list item
      // The parent group is exposed to accessibility APIs as a list
      radio.setAttribute("src", prefPane.image);
      radio.style.listStyleImage = prefPane.style.listStyleImage;
      var selector = document.getAnonymousElementByAttribute(prefWindow, "anonid", "selector");
      selector.insertBefore(radio, selector.firstChild);

      if ("arguments" in window && window.arguments[0] && document.getElementById(window.arguments[0]) && document.getElementById(window.arguments[0]).nodeName == "prefpane") {
        prefWindow.showPane(document.getElementById(window.arguments[0]));
      }
      else
      {
        prefWindow.showPane(prefPane);
      }
    }
  }
};
