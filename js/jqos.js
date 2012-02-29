$(function() {

    // Caret blinken lassen
    $('.console-caret').blink();

    // Keycode grabben
    $(document).keydown(function(event) {
        var code = (event.keyCode ? event.keyCode : event.which);
        var key = {left: 37, up: 38, right: 39, down: 40, enter: 13, backspace: 8, del: 46, ins: 45, home: 36, end: 35, pgup: 33, pgdn: 34 };

        // Spezialtasten auswerten
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

        // Sondertasten herausfiltern
        if (event.which == 0) return true;

        // Tastencode auswerten
        var code = (event.keyCode ? event.keyCode : event.which);
        if (code >= 32 && !event.ctrlKey) {
            $(document).trigger('console-key-pressed', code);
            return false;
        }
        return true;
    });

    // generic key pressed
    $(document).bind('console-key-pressed', function(event, code) {
        var character = String.fromCharCode(code);

        // Zeile zusammensetzen: Einzelnes Zeichen einfügen
        $('<div class="console-char volatile">'+character+'</div>').insertBefore('.console-caret');
    });

    // return pressed
    $(document).bind('console-return-pressed', function(event) {

        // TODO: Newline verhindern, wenn keine Eingabe?

        // Volatile-Markierung entfernen
        $('.console-char').removeClass('volatile');

        // Caret entfernen und neue Zeile einfügen
        $('.console-caret').remove();
        $('<div class="console-feedback-line"><div class="console-caret hi"></div></div>').insertAfter($('.console-feedback-line').last());
        $('.console-caret').blink();
    });

    // delete pressed
    $(document).bind('console-delete-pressed', function(event, direction) {
        if (direction == 0) {
            var element = $('.console-caret').prev();
            if (element.length > 0) element.remove();
        }
        else {
            var element = $('.console-caret');
            if (element.hasClass('console-char')) {
                // Caret nach rechts, dann aktuelles Zeichen löschen
                $(document).trigger('console-cursor-right');
                element.remove();
            }
        }
    });

    // delete pressed
    $(document).bind('console-insert-pressed', function(event) {
        // alert("insert!");
    });

    // delete pressed
    $(document).bind('console-page-pressed', function(event, direction) {
        // alert(direction == 0 ? "page up!" : "page down!");
    });

    function removeCurrentCaret(caret) {
        caret = caret || $('.console-caret');
        if (caret.hasClass('console-char')) {
            caret.removeClass('console-caret hi lo');
            caret.stopBlink();
        }
        else {
            caret.remove();
        }
    }

    // delete pressed
    $(document).bind('console-jump-pressed', function(event, direction) {
        if (direction == 0) {
            var newTarget = $('.console-char.volatile').first();
            if (newTarget.length > 0) {

                // Aktuellen Caret abwählen
                removeCurrentCaret();

                // Neues Ziel setzen
                newTarget.addClass('console-caret hi');
                newTarget.blink();
            }
        }
        else {
            var newTarget = $('.console-char.volatile').last();
            if (newTarget.length > 0) {
                // Aktuellen Caret abwählen
                removeCurrentCaret();

                next = $('<div></div>');
                next.insertAfter(newTarget);
                next.addClass('console-caret hi');
                next.blink();
            }
        }
    });

    // cursor left pressed
    $(document).bind('console-cursor-left', function(event) {
        // Ermitteln, ob der Caret ein echtes Zeichen ist
        var caret = $('.console-caret');

        // Zeichen vor dem Caret ermitteln
        var prev = caret.prev();
        if (prev.length == 0) return;

        // Caret nach links verschieben
        prev.addClass('console-caret hi');
        prev.blink();

        // Caret ist auch ein character
        removeCurrentCaret(caret);
    });

    // cursor right pressed
    $(document).bind('console-cursor-right', function(event) {
        // Caret beziehen
        var caret = $('.console-caret');

        // Prüfen, ob aktueller Caret ein echter Caret ist
        if (!caret.hasClass('console-char')) return;

        // Zeichen nach dem Caret ermitteln
        var next = caret.next();
        if (next.length == 0) {
            // Echten Caret erzeugen
            next = $('<div></div>');
            next.insertAfter(caret);
        }

        // Caret-Markierung hinzufügen
        next.addClass('console-caret hi');
        next.blink();

        // Alte Caret-Markierung entfernen
        caret.removeClass('console-caret hi lo');
        caret.stopBlink();
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
        var intervalID = setInterval(function()
        {
            if($(obj).hasClass("hi"))
            {
                $(obj).removeClass('hi').addClass('lo');
            }
            else
            {
                $(obj).removeClass('lo').addClass('hi');
            }
        }, options.delay);
        obj.data('blink-interval-id', intervalID);
    });
};

jQuery.fn.stopBlink = function()
{
    return this.each(function()
    {
        var $obj = $(this);
        var intervalID = $obj.data('blink-interval-id');
        if (intervalID) {
            clearInterval(intervalID);
            $obj.removeData('blink-interval-id');
        }
    });
};