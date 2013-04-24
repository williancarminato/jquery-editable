/*
 *  Project: Asynchronous Load Content
 *  Description: This plugin loads content on page inicialization
 *  Author: Willian Carminato <williancarminato@gmail.com>
 *  License: MIT
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "editable",
        defaults = {
            'modalId':       'myModal',
            'formUri':       '/form/form.html',
            'buttonProtype': '<a role="button" class="btn">Edit</a>',
            'sendData':      'options',
            'onSucess':    function (element, response){
                               element.html(response.content);
                           },
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).
            var plugin = this;
            var options = this.options;
            this.modal = $('#'+options.modalId);

            $('.editable').each(function(){
                var dataAttr = 'data-' + options.sendData;
                var $button = $(options.buttonProtype).addClass('btn-j-editable').attr('data-toggle', 'modal');
                var $element = $(this);

                $button.attr(dataAttr, JSON.stringify($element.data(options.sendData)));
                $button.attr('data-target', '#'+options.modalId);

                $element.removeAttr(dataAttr);
                $element.prepend($button);

                $button.click(function(event){
                    event.preventDefault();
                    plugin.applyButtonClickAction($(this), $element, options);
                });
            });


            var $modal = this.modal;
            //Making modal button submit form and hide modal
            $modal.children('.modal-footer').find('button[type="submit"]').click(function(event){
                event.preventDefault();
                $modal.find('form').submit();
                $modal.modal('hide');
            });

        },

        /*
         * This funcion make the button click call the 'formUri' and put the html in the specified modal
         */
        applyButtonClickAction: function( button, element, options ) {
            var plugin = this;
            var $modal = this.modal;
            var $element = element;
            var $button = button;

            //Comment
            $.ajax({
                url: options.formUri,
                type: 'get',
                cache: false,
                data: $button.data(options.sendData),
                dataType: 'html',
                success: function (response) {
                            $modal.find('.modal-body').html(response);
                            $modal.find('form').on('submit', function(){
                                plugin.modalFormSubmit($(this), $element, $button, options);
                                return false;
                            });
                         },
            });
        },


        /*
         * This funcion make the ajax form submision and put the html content in the editable element
         */
        modalFormSubmit: function(form, element, button, options) {
            var plugin = this;
            var $element = element;
            var $form = form;
            var $button = button;

            //The ajax form submit
            $.ajax({
                url: $form.attr('action'),
                type: 'post',
                data: $form.serialize(),
                dataType: 'json',
                success: function (response) {
                            var $btnClone = $button.clone();
                            $btnClone.click(function(event){
                                event.preventDefault();
                                plugin.applyButtonClickAction($(this), $element, options);
                            });

                            $element.empty().html(response.html).prepend($btnClone);
                        },
            });
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );
