!function () {

    var timer;
    var scale = 1;
    var width = 640;
    var minHeight = 1008;
    var maxHeight = 1136;
    var minHw = minHeight / width;
    var maxHw = maxHeight / width;
    var setHeight = false;
    var $win = $(window);
    var $head = $("head");
    var $meta = $head.find("[name=viewport]");
    var minH = $meta.attr("minHeight");
    var maxH = $meta.attr("maxHeight");
    var setLayout = function () {

        var winHw;
        var style = {};
        var styleStr = "";
        var content = {};
        var contentStr = "";
        var height = maxHeight;
        var $style = $("#style-all");
        var winWidth = window.screen.availWidth;
        var winHeight = window.screen.availHeight;
        var isMb = function () {
            return (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))
        }();

        if (!$meta.length) {

            $meta = $("<meta name=\"viewport\"/>");
            $head.append($meta);
        }

        if (isMb) {

            scale = (winWidth / width);

            if (setHeight) {

                winHw = winHeight / winWidth;

                if (winHw < minHw) {
                    height = minHeight;

                } else if (winHw > maxHw) {
                    height = maxHeight;

                } else {
                    height = winHeight / scale;
                }

                height = height.toFixed(2);
            }

            content["width"] = width;

        } else {
            scale = 1;
        }

        content["maximum-scale"] = content["minimum-scale"] = scale;
        content["user-scalable"] = "no";

        for (var o in content) {
            if (contentStr) contentStr += ",";
            contentStr += o + "=" + content[o];
        }

        $meta.attr("content", contentStr);

        if (setHeight) {

            style["height"] = height + "px";

            for (var o in style) {
                styleStr += o + ":" + style[o] + ";";
            }

            if (styleStr) {

                if (!$style.length) {

                    $style = $("<style/>");
                    $style.attr("id", "style-all")
                    $head.append($style);
                }

                styleStr = ".all{" + styleStr + "};";
                $style.html(styleStr);
            }
        }

    };

    if (minH || maxH) {

        if (minH) {
            minHeight = +minH;
        }

        if (maxH) {
            maxHeight = +maxH;
        }

        setHeight = true;
    }

    setLayout();

    $win.bind("resize", function () {
 
        if (timer) { return; }
        timer = 1;
        setTimeout(function () {
            setLayout();
            setTimeout(function () {
                timer = null;
            }, 10);
        }, 10);

    })


  
}();