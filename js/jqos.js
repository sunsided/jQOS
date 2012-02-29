$(function() {

    // Caret blinken lassen
    $('#console-input-caret').blink();

    // Keycode grabben
    $(document).keydown(function(event) {
        var code = (event.keyCode ? event.keyCode : event.which);
        var key = {left: 37, up: 38, right: 39, down: 40, enter: 13, backspace: 8, del: 46, ins: 45, home: 36, end: 35, pgup: 33, pgdn: 34 };

        switch(code) {
            case key.left:
                $(document).trigger('console-cursor-left');
                return false;
            case key.right:
                $(document).trigger('console-cursor-right');
                return false;
            case key.up:
                $(document).trigger('console-cursor-up');
                return false;
            case key.down:
                $(document).trigger('console-cursor-down');
                return false;
            case key.enter:
                $(document).trigger('console-return-pressed');
                return false;
            case key.backspace:
                $(document).trigger('console-delete-pressed', 0);
                return false;
            case key.del:
                $(document).trigger('console-delete-pressed', 1);
                return false;
            case key.ins:
                $(document).trigger('console-insert-pressed');
                return false;
            case key.home:
                $(document).trigger('console-jump-pressed', 0);
                return false;
            case key.end:
                $(document).trigger('console-jump-pressed', 1);
                return false;
            case key.pgup:
                $(document).trigger('console-page-pressed', 0);
                return false;
            case key.pgdn:
                $(document).trigger('console-page-pressed', 1);
                return false;
        }
        return true;
    });

    // Keycode grabben
    $(document).keypress(function(event) {
        if (event.isDefaultPrevented()) {
            return false;
        }

        var code = (event.keyCode ? event.keyCode : event.which);
        if (code >= 32 && code < 127) { // sanity check
            $(document).trigger('console-key-pressed', code);
            return false;
        }
    });

    /*
    $('#console-input').keypress(function(event) {
        // Text beziehen
        var line = $('#console-input').val();

        if ( event.which == 13 ) {
            event.preventDefault();

            // Text einfügen
            $('<div>'+line+'</div>').insertBefore('#console-input-feedback');

            // Eingabe leeren
            $('#console-input').val('');
        }
    });*/

    // generic key pressed
    $(document).bind('console-key-pressed', function(event, code) {
        $('#console-input').val(code + " " + String.fromCharCode(code));
    });

    // return pressed
    $(document).bind('console-return-pressed', function(event) {
        alert("return!");
    });

    // delete pressed
    $(document).bind('console-delete-pressed', function(event, direction) {
        alert(direction == 0 ? "backspace!" : "delete!");
    });

    // delete pressed
    $(document).bind('console-insert-pressed', function(event) {
        alert("insert!");
    });

    // delete pressed
    $(document).bind('console-page-pressed', function(event, direction) {
        alert(direction == 0 ? "page up!" : "page down!");
    });

    // delete pressed
    $(document).bind('console-jump-pressed', function(event, direction) {
        alert(direction == 0 ? "home!" : "end!");
    });

    // cursor left pressed
    $(document).bind('console-cursor-left', function(event) {
        alert("go left!");
    });

    // cursor right pressed
    $(document).bind('console-cursor-right', function(event) {
        alert("go right!");
    });

    // cursor up pressed
    $(document).bind('console-cursor-up', function(event) {
        alert("go up!");
    });

    // cursor down pressed
    $(document).bind('console-cursor-down', function(event) {
        alert("go down!");
    });

});

jQuery.fn.blink = function(options)
{
    var defaults = { delay:500 };
    var options = $.extend(defaults, options);

    return this.each(function()
    {
        var obj = $(this);
        setInterval(function()
        {
            if($(obj).css("visibility") == "visible")
            {
                $(obj).css('visibility','hidden');
            }
            else
            {
                $(obj).css('visibility','visible');
            }
        }, options.delay);
    });
};