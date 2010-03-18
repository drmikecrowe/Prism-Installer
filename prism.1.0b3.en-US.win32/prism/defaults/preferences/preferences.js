//@line 2 "z:\Development\moz1.9.2\src\prism\defaults\preferences\preferences.js"

pref("toolkit.defaultChromeURI", "chrome://webrunner/content/webrunner.xul");  // - main xul window
pref("browser.chromeURL", "chrome://webrunner/content/webrunner.xul");         // - allow popup windows to open
pref("toolkit.singletonWindowType", "navigator:browser");

pref("general.useragent.extra.prism", "Prism/1.0b3");

/* prefwindow prefs (see: MDC - Preferences System and bug 350528) */
pref("browser.preferences.animateFadeIn", "false");
pref("browser.preferences.instantApply", "false");

/* debugging prefs */
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", false);
pref("nglayout.debug.disable_xul_fastload", false);

/* default security dialogs like firefox */
pref("security.warn_entering_secure.show_once", false);
pref("security.warn_leaving_secure.show_once", false);
pref("security.warn_submit_insecure.show_once", false);

/* disable warnings when opening external links */
pref("network.protocol-handler.warn-external.http", false);
pref("network.protocol-handler.warn-external.https", false);
pref("network.protocol-handler.warn-external.ftp", false);

/* download manager */
pref("browser.download.useDownloadDir", true);
pref("browser.download.folderList", 0);
pref("browser.download.manager.showAlertOnComplete", true);
pref("browser.download.manager.showAlertInterval", 2000);
pref("browser.download.manager.retention", 2);
pref("browser.download.manager.showWhenStarting", true);
pref("browser.download.manager.useWindow", true);
pref("browser.download.manager.closeWhenDone", true);
pref("browser.download.manager.openDelay", 0);
pref("browser.download.manager.focusWhenStarting", false);
pref("browser.download.manager.flashCount", 2);
pref("browser.download.manager.displayedHistoryDays", 7);

/* download alerts */
pref("alerts.slideIncrement", 1);
pref("alerts.slideIncrementTime", 10);
pref("alerts.totalOpenTime", 6000);
pref("alerts.height", 50);

/* password manager */
pref("signon.rememberSignons", true);
pref("signon.expireMasterPassword", false);
pref("signon.SignonFileName", "signons.txt");

/* autocomplete */
pref("browser.formfill.enable", true);

/* spellcheck */
pref("layout.spellcheckDefault", 1);

/* extension manager and xpinstall */
pref("xpinstall.dialog.confirm", "chrome://mozapps/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?type=themes");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?type=extensions");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager-themes");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager-extensions");
pref("extensions.update.enabled", true);
pref("extensions.update.interval", 86400);
pref("extensions.dss.enabled", false);
pref("extensions.dss.switchPending", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);

/* NB these point at AMO */
pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");

/* findbar support */
pref("accessibility.typeaheadfind", true);
pref("accessibility.typeaheadfind.timeout", 5000);
pref("accessibility.typeaheadfind.flashBar", 1);
pref("accessibility.typeaheadfind.linksonly", false);
pref("accessibility.typeaheadfind.casesensitive", 0);

/* enable xul error pages */
pref("browser.xul.error_pages.enabled", true);

/* application update prefs */
pref("app.update.channel", "default");
pref("app.update.enabled", true);
pref("app.update.auto", true); // auto download updates
pref("app.update.mode", 1); // prompt for incompatible add-ons
pref("app.update.url", "http://justdiscourse.com/aus/1/%PRODUCT%/%VERSION%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/update.xml");
pref("app.update.url.manual", "http://browsing.justdiscourse.com");
pref("app.update.url.details", "");
pref("app.update.interval", 86400); // check once a day
pref("app.update.nagTimer.download", 86400);
pref("app.update.nagTimer.restart", 600);
pref("app.update.timer", 60000); // 1 minute
pref("app.update.showInstalledUI", false); // broken?
pref("app.update.log.Checker", true);
pref("app.update.log.UpdateService", true);

/* SSL error page behaviour */
pref("browser.ssl_override_behavior", 2);
pref("browser.xul.error_pages.expert_bad_cert", false);
