/*global log,_gaq,console*/

window.log = function f(){
  log.history = log.history || [];
  log.history.push(arguments);
  if(this.console) {
    var args = arguments, newarr;
    try {
      args.callee = f.caller;
    } catch(e) {}
    newarr = [].slice.call(args);

    if (typeof console.log === 'object') {
      log.apply.call(console.log, console, newarr);
    } else {
      console.log.apply(console, newarr);
    }
  }
};

/**
 * Track an event:
 *  @category: button or pageChange
 *  @label: what type of link was clicked?
 *  @value: which button was clicked? i.e. registerForm button
 **/
function trackEvent(category, label, value) {
  try {
    log("track: category:" + category + " - label: " + label + " - value: " + value);
    if(label !== undefined && value !== undefined) {
      _gaq.push(['_trackEvent', category, label, value]);
    } else if(label !== undefined) {
      _gaq.push(['_trackEvent', category, label]);
    } else {
      _gaq.push(['_trackEvent', category]);
    }
  } catch(err) {
    log("couldn't track event: " + category + " " + label + " " + value);
  }
}

/**
 * Tracks all outbound links
 */
(function ($) {
  $(document).ready(function() {

    // Accepts a string; returns the string with regex metacharacters escaped. The returned string
    // can safely be used at any point within a regex to match the provided literal string. Escaped
    // characters are [ ] { } ( ) * + ? - . , \ ^ $ # and whitespace. The character | is excluded
    // in this function as it's used to separate the domains names.
    RegExp.escapeDomains = function(text) {
      return (text) ? text.replace(/[-[\]{}()*+?.,\\^$#\s]/g, "\\$&") : '';
    };

    // Attach onclick event to document only and catch clicks on all elements.
    $(document.body).click(function(event) {
      // Catch the closest surrounding link of a clicked element.
      $(event.target).closest("a,area").each(function() {
        var _gaq = window._gaq || [];

        var ga = {
          "trackOutbound": true,
          "trackMailto": true,
          "trackDownload": true,
          "trackOutboundAsPageview": false,
          "trackDownloadExtensions": "7z|aac|arc|arj|asf|asx|avi|bin|csv|doc|exe|flv|gif|gz|gzip|hqx|jar|jpe?g|js|mp(2|3|4|e?g)|mov(ie)?|msi|msp|pdf|phps|png|ppt|qtm?|ra(m|r)?|sea|sit|tar|tgz|torrent|txt|wav|wma|wmv|wpd|xls|xml|z|zip"
        };

        // Expression to check for absolute internal links.
        var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
        // Expression to check for download links.
        var isDownload = new RegExp("\\.(" + ga.trackDownloadExtensions + ")$", "i");
        // Expression to check for the sites cross domains.
        var isCrossDomain = new RegExp("^(https?|ftp|news|nntp|telnet|irc|ssh|sftp|webcal):\/\/.*(" + RegExp.escapeDomains(ga.trackCrossDomains) + ")", "i");

        // Is the clicked URL internal?
        if (isInternal.test(this.href)) {
          // Is download tracking activated and the file extension configured for download tracking?
          if (ga.trackDownload && isDownload.test(this.href)) {
            // Download link clicked.
            var extension = isDownload.exec(this.href);
            _gaq.push(["_trackEvent", "Downloads", extension[1].toUpperCase(), this.href.replace(isInternal, '')]);
          }
        }
        else {
          if (ga.trackMailto && $(this).is("a[href^=mailto:],area[href^=mailto:]")) {
            // Mailto link clicked.
            _gaq.push(["_trackEvent", "Mails", "Click", this.href.substring(7)]);
          }
          else if (ga.trackOutbound && this.href) {
            if (ga.trackDomainMode === 2 && isCrossDomain.test(this.href)) {
              // Top-level cross domain clicked. document.location is handled by _link internally.
              _gaq.push(["_link", this.href]);
            }
            else if (ga.trackOutboundAsPageview) {
              // Track all external links as page views after URL cleanup.
              // Currently required, if click should be tracked as goal.
              _gaq.push(["_trackPageview", '/outbound/' + this.href.replace(/^(https?|ftp|news|nntp|telnet|irc|ssh|sftp|webcal):\/\//i, '').split('/').join('--')]);
            }
            else {
              // External link clicked.
              _gaq.push(["_trackEvent", "Outbound links", "Click", this.href]);
            }
          }
        }
      });
    });
  });
})(jQuery);

/**
 * Track errors globally: it enables global error catching and sends them to Google Analytics.
 **/
window.onerror = function(message, file, line) {
  trackEvent('Errors', 'Site', '[' + file + ' (L ' + line + ')] ' + message);
};
