; (function (win) {
 
    var zwidth = 640;
    var zsize = 64;
    var tid;
    var dpr = 0;
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var isPc = function () {
        return !(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))
    }();
    var scale = isPc ? 1 : 0.5;
    var setMetaEl = function (scale) {
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    };

    function refreshRem() {

        var width = docEl.getBoundingClientRect().width;

        if (width / dpr > zwidth) {
            width = zwidth * dpr;
        }

        docEl.style.fontSize = width * zsize / zwidth + 'px';
    }

    if (!metaEl) {
        metaEl = doc.createElement('meta');
        setMetaEl(scale);

        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    if (metaEl) {

        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);

        if (match) {
            scale = parseFloat(match[1]);
        }

        dpr = parseInt(1 / scale);

        dpr = scale = isPc?  1 : 0.5;
        setMetaEl(scale);
    }




    docEl.setAttribute('data-dpr', dpr);

    win.addEventListener('resize', function () {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 1);
    }, false);

    win.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 1);
        }
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function (e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }

    refreshRem();


})(window);