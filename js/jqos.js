$(function() {

    function JQOSConsole() {

        this.userInputDenied = false;

        this.removeCurrentCaret = function(caret) {
            caret = caret || $('.console-caret');
            if (caret.hasClass('console-char')) {
                caret.removeClass('console-caret hi lo');
                caret.stopBlink();
            }
            else {
                caret.remove();
            }
        };

        this.insertCharactersBeforeCaret = function(characters) {
            $.each(characters, function(index, value) {
                $('<div class="console-char volatile">'+value+'</div>').insertBefore('.console-caret');
            });
        };

        this.keyPressed = function(code) {
            // Zeile zusammensetzen: Einzelnes Zeichen einfügen
            var character = String.fromCharCode(code);
            this.insertCharactersBeforeCaret(character);
        };

        this.isUserInputDenied = function() {
            return this.userInputDenied;
        };

        this.denyUserInput = function() {
            this.userInputDenied = true;
        };

        this.allowUserInput = function() {
            this.userInputDenied = false;
        };

        this.clear = function() {
            $('.console-feedback-line').remove();
            this.beginNewLine(false);
        };

        this.beginNewLine = function(isSystemFeedback) {
            // Volatile-Markierungen entfernen
            $('.console-char').removeClass('volatile');

            // Caret entfernen
            this.removeCurrentCaret();

            // Neue Zeile beginnen
            var cssclass = "console-feedback-line";
            if (isSystemFeedback) {
                cssclass = cssclass + " system-feedback";
            }

            // Element anhängen
            var newLine = $('<div class="'+cssclass+'"><div class="console-caret hi"></div></div>');

            // inject new line
            var existingLines = $('.console-feedback-line');
            if (existingLines.length > 0) {
                newLine.insertAfter(existingLines.last());
            }
            else {
                $('#console').append(newLine);
            }

            // make it blinky
            $('.console-caret').blink();
        };

        this.systemCommandFeedbackReceived = function(data) {
            // Systemfeedback ausgeben
            this.insertCharactersBeforeCaret(data.message);

            // Neue Zeile beginnen
            this.beginNewLine(false);

            // Benutzereingaben erlauben
            this.allowUserInput();
        };

        this.sendCommandToServer = function(commandBuffer) {

            // TODO: Doppelslashes vermeiden!
            var serverurl = window.location.pathname + '/server.php';
            console.log(serverurl);

            var obj = this;
            $.ajax({
                url: serverurl,
                type: 'GET',
                data: {"command": commandBuffer},
                dataType: 'json',
                beforeSend: function( xhr ) {
                    // xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
                },
                success: function( data, textStatus, jqXHR ) {
                    // data = jQuery.parseJSON(data);
                    obj.systemCommandFeedbackReceived(data);
                },
                error: function( jqXHR, textStatus, errorThrown ) {
                    obj.systemCommandFeedbackReceived("SYSTEM ERROR: " + textStatus);
                }
            });
        };

        this.getCurrentCommandBuffer = function() {
            var buffer = '';
            $('.volatile').each(function(index, value) {
                buffer = buffer + $(this).text();
            });
            return buffer;
        };

        this.handleInternalCommands = function(commandBuffer) {
            commandBuffer = commandBuffer.toLowerCase();
            switch(commandBuffer) {
                case "":
                    // prevent empty commands
                    break;

                case "clear":
                case "cls":
                case "clc":
                    console.log('clearing console');
                    this.clear();
                    break;
                default:
                    return true;
            }

            this.allowUserInput();
            return false;
        };

        this.returnPressed = function() {
            // TODO: Was passiert, wenn Newline nicht am Zeilenende ausgeführt wird?

            // Benutzereingaben verhindern
            this.denyUserInput();

            // Zeichen ermitteln
            var currentCommandBuffer = this.getCurrentCommandBuffer();

            // check for internal commands
            if (!this.handleInternalCommands(currentCommandBuffer)) {
                return;
            }

            // Neue Zeile im feedback-Modus erzeugen
            this.beginNewLine(true);

            // Befehl absenden
            this.sendCommandToServer(currentCommandBuffer);
        };

        this.deletePressed = function(direction) {
            var element;
            if (direction == 0) {
                element = $('.console-caret').prev();
                if (element.length > 0) element.remove();
            }
            else {
                element = $('.console-caret');
                if (element.hasClass('console-char')) {
                    // Caret nach rechts, dann aktuelles Zeichen löschen
                    $(document).trigger('console-cursor-right');
                    element.remove();
                }
            }
        };

        this.cursorLeft = function () {
            // Ermitteln, ob der Caret ein echtes Zeichen ist
            var caret = $('.console-caret');

            // Zeichen vor dem Caret ermitteln
            var prev = caret.prev();
            if (prev.length == 0) return;

            // Caret nach links verschieben
            prev.addClass('console-caret hi');
            prev.blink();

            // Caret ist auch ein character
            this.removeCurrentCaret(caret);
        };

        this.cursorRight = function() {
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
        };

        this.jumpPressed = function(direction) {
            var newTarget;
            if (direction == 0) {
                newTarget = $('.console-char.volatile').first();
                if (newTarget.length > 0) {

                    // Aktuellen Caret abwählen
                    this.removeCurrentCaret();

                    // Neues Ziel setzen
                    newTarget.addClass('console-caret hi');
                    newTarget.blink();
                }
            }
            else {
                newTarget = $('.console-char.volatile').last();
                if (newTarget.length > 0) {
                    // Aktuellen Caret abwählen
                    this.removeCurrentCaret();

                    next = $('<div></div>');
                    next.insertAfter(newTarget);
                    next.addClass('console-caret hi');
                    next.blink();
                }
            }
        }
    }

    var con = new JQOSConsole();

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
        if (!con.isUserInputDenied()) con.keyPressed(code);
    });

    // return pressed
    $(document).bind('console-return-pressed', function () {
        if (!con.isUserInputDenied()) con.returnPressed();
    });

    // delete pressed
    $(document).bind('console-delete-pressed', function(event, direction) {
        if (!con.isUserInputDenied()) con.deletePressed(direction);
    });

    // delete pressed
    $(document).bind('console-insert-pressed', function () {
        // alert("insert!");
    });

    // delete pressed
    $(document).bind('console-page-pressed', function (/*direction*/) {
        // alert(direction == 0 ? "page up!" : "page down!");
    });

    // delete pressed
    $(document).bind('console-jump-pressed', function(direction) {
        if (!con.isUserInputDenied()) con.jumpPressed(direction);
    });

    // cursor left pressed
    $(document).bind('console-cursor-left', function () {
        if (!con.isUserInputDenied()) con.cursorLeft();
    });

    // cursor right pressed
    $(document).bind('console-cursor-right', function () {
        if (!con.isUserInputDenied()) con.cursorRight();
    });

    // cursor up pressed
    $(document).bind('console-cursor-up', function () {
        // alert("go up!");
    });

    // cursor down pressed
    $(document).bind('console-cursor-down', function () {
        // alert("go down!");
    });

});

$.fn.blink = function(options) {
    var defaults = { delay:500 };
    var opts = $.extend(defaults, options);

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
        }, opts.delay);
        obj.data('blink-interval-id', intervalID);
    });
};

$.fn.stopBlink = function() {
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