/** Binding for inline validation - jQuery Validation Plugin
 *  http://bassistance.de/jquery-plugins/jquery-plugin-validation/
*/
ko.bindingHandlers.valueWithAutoValidation = {
  init: ko.bindingHandlers.value.init,
  update: function(element,valueAccessor,allBindingsAccessor) {
    ko.bindingHandlers.value.update.apply(this, arguments);
    $(element).valid();
    var form = $(element.form);
    form.trigger('invalid-form.validate',[form.data("validator")]);
  }
};

/** Binding for form validation - jQuery Validation Plugin
 *  http://bassistance.de/jquery-plugins/jquery-plugin-validation/
*/
ko.bindingHandlers.jqValidate = {
    init: function(element, valueAccessor) {
	    var options = valueAccessor();
	    $(element).validate(options);
    }
};

/** Binding for adding a mask to input fields - jQuery Masked Input Plugin
 *  http://digitalbush.com/projects/masked-input-plugin/
*/
ko.bindingHandlers.mask = {
  init: function(element, valueAccessor) {
	var options = valueAccessor();
	var mask = "";
	if(options === "date")
	    mask = "99/99/9999";
	else if(options === "time")
	    mask = "99:99";
	else if(options === "cpf")
	    mask = "999.999.999-99";
	else if(options === "phone")
	    mask = "(99) 9999-9999";
	else if(options === "cep")
	    mask = "99999-999";
	$(element).mask(mask);
  }
};

/** Binding to make content appear with 'fade' effect */
ko.bindingHandlers['fadeIn'] = {
    'update': function(element, valueAccessor) {
        var options = valueAccessor();
        if(options() === true)
          $(element).fadeIn('slow');
    }
};
/** Binding to make content disappear with 'fade' effect */
ko.bindingHandlers['fadeOut'] = {
    'update': function(element, valueAccessor) {
        var options = valueAccessor();
        if(options() === true)
          $(element).fadeOut('slow');
    }
};

/** Binding for stylized buttons - jQuery UI Button Widget
 *  http://jqueryui.com/demos/button/
*/
ko.bindingHandlers.jqButton = {
    init: function(element, valueAccessor) {
	    var options = valueAccessor();
	    $(element).button(options);
    }
};

/**
 * Binding for jQuery Datatables
 * http://datatables.net
*/
ko.bindingHandlers.dataTable = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    var defaults = {
        "aaData": options["data"](),
        "bJQueryUI": true,
        "bFilter": true,
        "bAutoWidth": false,
        "bLengthChange": false,
        "bRetrieve": true,
        "bSortClasses": false,
        "fnRowCallback": function(nRow, aData, iDisplayIndex) {
            $(nRow).mouseover(function(){
              $(nRow).attr("style","background-color:yellow !important;");
            });
            $(nRow).mouseout(function() {
              $(nRow).removeAttr("style");
            });
            if(typeof options["rowClick"] === "function") {
              $(nRow).unbind('click').click(function() {
                options["rowClick"](aData);
              });
            }
            return nRow;
        },
        "oLanguage": TABLE_LANGUAGE
    }
    var tableOptions = $.extend(defaults,options["options"]);
    options["object"]($(element).dataTable(tableOptions).css("width","99.5%"));
  },
  update: function(element,valueAccessor) {
    var options = valueAccessor();
    options["object"]().fnClearTable();
    options["object"]().fnAddData(options["data"](),true);
  }
};

/** Binding for stylized tabs - jQuery UI Tabs Widget
 *  http://jqueryui.com/demos/tabs/
*/
ko.bindingHandlers.jqTabs = {
    init: function(element, valueAccessor) {
	    var options = valueAccessor();
	    $(element).tabs(ko.utils.unwrapObservable(options));
    },
    update: function(element,valueAccessor) {
        var options = valueAccessor();
        $(element).tabs('option',ko.utils.unwrapObservable(options));
    }
};

/** Binding for strict MVVM use, associating an observable with the jQuery object of the element */
ko.bindingHandlers.jqElement = {
    init: function(element, valueAccessor) {
          var options = valueAccessor();
          options($(element));
    }
}

/** Binding for accordion widget - jQuery UI Accordion Widget
 *  http://jqueryui.com/demos/accordion/
*/
ko.bindingHandlers.jqAccordion = {
    init: function(element, valueAccessor) {
        var options = valueAccessor();
        var jqElement = $(element);
        jqElement.accordion(options);
        jqElement.bind("valueChanged",function(){
           ko.bindingHandlers.jqAccordion.update(element,valueAccessor);
        });
    },
    update: function(element,valueAccessor) {
        var options = valueAccessor();
        $(element).accordion('destroy').accordion(options);
    }
};

/** Binding for adding stylized and rich multiselect - jQuery UI MultiSelect Widget
 *  http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
*/
ko.bindingHandlers.jqMultiSelect = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var defaults = {
            click: function(event, ui) {
                var selected_options = $.map($(element).multiselect("getChecked"), function(a) {
                    return $(a).val()
                });
                allBindingsAccessor()['selectedOptions'](selected_options);
            }
        };
        var options = $.extend(defaults, valueAccessor());

        var selected = allBindingsAccessor()['selectedOptions']();
        var available = allBindingsAccessor()['options']();
        var optionsText = allBindingsAccessor()['optionsText'];
        var optionsValue = allBindingsAccessor()['optionsValue'];

        $.each(selected, function(index, el) {
            var option = $.grep(available, function(e, index) {
                return (typeof e[optionsValue] === 'function' ? e[optionsValue]() : e[optionsValue]) == el
            });
            var optionText = (option[0])[optionsText];
            $(element).append("<option value='" + el + "'>" + optionText + "</option>");
        });

        allBindingsAccessor()['options'].subscribe(function(value) {
            ko.bindingHandlers.jqMultiSelect.regenerateMultiselect(element, options, viewModel);
        });
        allBindingsAccessor()['selectedOptions'].subscribe(function(value) {
            ko.bindingHandlers.jqMultiSelect.regenerateMultiselect(element, options, viewModel);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, context) {
        ko.bindingHandlers.jqMultiSelect.regenerateMultiselect(element, null, context);
    },
    regenerateMultiselect: function(element, options, viewModel) {
        if ($(element).next().hasClass("ui-multiselect")) {
            setTimeout(function() {
                if ($(element).multiselect('option', 'filter') === true) {
                    return $(element).multiselect("refresh").multiselectfilter({
                        label: $(element).multiselect('option', 'filterLabel') || "Search: "
                    });
                } else {
                    return $(element).multiselect("refresh");
                }
            }, 0);
        } else {
            setTimeout(function() {
                if ($(element).multiselect('option', 'filter') === true) {
                    $(element).multiselect(options).multiselectfilter({
                        label: $(element).multiselect('option', 'filterLabel') || "Search: "
                    });
                } else {
                    $(element).multiselect(options);
                    $(element).multiselect('close');
                }
                if ($(element).multiselect('option', 'noChecks') === true) {
                    $(element).next().next().find(".ui-helper-reset:first").remove();
                }
            }, 0);
        }
    }
};

/** Binding for window dialogs - jQuery UI Dialog Widget
 *  http://jqueryui.com/demos/dialog/
*/
ko.bindingHandlers.jqDialog = {
    init: function(element, valueAccessor) {
        var defaults = {
            modal: true,
	        autoOpen: false,
	        closeOnEscape: false
	    }
	    var options = $.extend(defaults,valueAccessor());
	    $(element).dialog(options);
    }
};

