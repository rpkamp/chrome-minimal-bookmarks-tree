// See https://github.com/mikewest/Instapaper-Chrome-Extension/blob/master/sendtoinstapaper.js#L240

function internationalize( str ) {
    return str.replace( /__MSG_([^_]+)__/g, function (_, key) {
        console.log("Translate "+key+": "+chrome.i18n.getMessage(key))
        return chrome.i18n.getMessage(key);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementsByTagName('body')[0].innerHTML = internationalize(document.getElementsByTagName('body')[0].innerHTML);
});
