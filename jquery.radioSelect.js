/**
 * jQuery radioSelect
 *
 * Version: 0.0.1
 * Requires jQuery 1.2.6+
 *
 * Copyright (c) 2009 Rudolf Schmidt
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Note: This plugin was heavily inspired by Cory S.N. LaViska and the jquery.multiSelect plugin
 * (visit http://abeautifulsite.net/notebook.php?article=62 for more information)
 *
 *
 * Usage: $('#element_id').radioSelect( options, callback )
 *
 * Options:  focusTimeout       - time until the expanded options disappear after losing focus;
 *                                false will define that there is no timeout at all and the box will not disappear
 *                                unless you click outside; default = 250
 *           matcherTimeout     - determines the delay the entered search terms are filtered on the last keyup
 **/
if( jQuery ) ( function($) {

  $.fn.extend({
    radioSelect: function( o, callback ) {
      // Default Options
      if( !o ) var o = {};
      if( o.focusTimeout == undefined ) o.focusTimeout = 250;
      if( o.matcherTimeout == undefined ) o.matcherTimeout = 250;

      // Initialize each radio select
      $(this).each( function() {
        var select = $(this);

        var html = '<input type="text" class="radioSelect" value="" style="cursor: default;" />';
        html += '<div class="radioSelectOptions" style="position: absolute; z-index: 99999; display: none;">';
        $(select).find('OPTION').each( function() {
          if( $(this).val() != '' ) {
            html += '<label><input type="radio" name="' + $(select).attr('name') + '" value="' + $(this).val() + '"';
            if( $(this).attr('selected') ) html += ' checked="checked"';
            html += ' />' + $(this).html() + '</label>';
          }
        });
        html += '</div>';

        // Insert
        $(select).after(html);

        // Events
        var currentRadioSelect = $(select).next('.radioSelect');
        currentRadioSelect.mouseover( function() {
          $(this).addClass('hover');
        }).mouseout( function() {
          $(this).removeClass('hover');
        }).click( function() {
          // Show on click if not already visible
          if( !$(this).hasClass('active') ) {
            $(this).radioSelectOptionsShow( o );
          }
          return false;
        }).focus( function() {
          $(this).addClass('focus'); // So it can be styled with CSS
        }).blur( function() {
          $(this).removeClass('focus'); // So it can be styled with CSS
        });

        // add the hover to the radioSelectOptions
        currentRadioSelect.next('.radioSelectOptions').mouseover( function() {
          $(this).addClass('hover');
        }).mouseout( function() {
          $(this).removeClass('hover');
        });

        // Handle Radiobuttons
        currentRadioSelect.next('.radioSelectOptions').find('INPUT').click( function() {
          var radioSelectOptions = $(this).parent().parent();
          radioSelectOptions.radioSelectUpdateSelected();
          radioSelectOptions.find('LABEL').removeClass('checked').find('INPUT:checked').parent().addClass('checked');
          radioSelectOptions.prev('.multiSelect').focus();

          if( callback ) callback( $(this) );
        });

        // Initial display
        currentRadioSelect.next('.radioSelectOptions').each( function() {
          $(this).radioSelectUpdateSelected();
          $(this).find('INPUT:checked').parent().addClass('checked');
        });

        // Handle hovers
        currentRadioSelect.next('.radioSelectOptions').find('LABEL').mouseover( function() {
          $(this).parent().find('LABEL').removeClass('hover');
          $(this).addClass('hover');
        }).mouseout( function() {
          $(this).parent().find('LABEL').removeClass('hover');
        });


        // Keyboard Stuff
        var timer = '';
        currentRadioSelect.keydown( function(e) {
          clearTimeout(timer);
        });
        currentRadioSelect.keyup( function(e) {
          radioSelectMatchKeywordsCurrent = currentRadioSelect;
          timer = setTimeout('jQuery(radioSelectMatchKeywordsCurrent).radioSelectMatchKeywords();', o.matcherTimeout);
        });

        // Eliminate the original form element
        $(select).remove();
      });

      // do the mousedown thing on the DOM
      $(document).unbind( "mousedown.radioSelect" ).bind( "mousedown.radioSelect", function() {
        if( !$('.radioSelect').hasClass( "hover" ) && !$('.radioSelect').next( ".radioSelectOptions" ).hasClass( "hover" ) ) {
          $('.radioSelect').radioSelectOptionsHide();
        }
      });
    },

    // Hide the dropdown
    radioSelectOptionsHide: function() {
      $(this).removeClass('active').next('.radioSelectOptions').hide();
    },

    // Show the dropdown
    radioSelectOptionsShow: function( o ) {
      // Hide any open option boxes
      $('.multiSelect').radioSelectOptionsHide();
      $(this).next('.radioSelectOptions').find('LABEL').removeClass('hover');
      $(this).addClass('active').next('.radioSelectOptions').show();

      // Position it
      var offset = $(this).position();
      $(this).next('.radioSelectOptions').css({
        top:  offset.top + $(this).outerHeight() + 'px',
        left: offset.left + 'px'
      });

      // Disappear on hover out
      radioSelectCurrent = $(this);
      var timer = '';
      $(this).next('.radioSelectOptions').hover( function() {
        clearTimeout(timer);
      }, function() {
        if( o.focusTimeout != false ) {
          timer = setTimeout('jQuery(radioSelectCurrent).radioSelectOptionsHide(); $(radioSelectCurrent).unbind("hover");', o.focusTimeout);
        }
      });

    },

    radioSelectUpdateSelected: function() {
      var selected = $(this).find("LABEL INPUT:checked:first");

      if( selected ) {
        $(this).prev('.radioSelect').val( selected.parent().text() );
      }
    },

    radioSelectMatchKeywords: function() {
      var values = $.trim( $(this).val() ).split(/\W/); // trim tailing and leading whitespace
      var radioSelectOptions = $(this).next('.radioSelectOptions');

      if ( values.length > 0 ) {
        radioSelectOptions.find( "LABEL" ).each( function() {
          var match = true, i = values.length, text = $(this).text();
          while (--i >= 0 && match) {
            if( !text.match( new RegExp(values[i], 'i') ) ) match = false;
          }

          if( match ) $(this).removeClass('nomatch'); else $(this).addClass('nomatch');
        });
        // uncheck checked radiobuttons if they are not in the match
        radioSelectOptions.find('LABEL.nomatch INPUT:checked').removeAttr('checked');
      } else {
        radioSelectOptions.find('LABEL').removeClass('nomatch');
      }
    }

  });

})(jQuery);