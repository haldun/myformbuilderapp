(function($, undefined){
  $.widget("fb.editor", {
    // Default options
    options: {
      form: {}
    },

    // Set up the widget
    _create: function() {
      console.log("_create");
      var self = this;

      this.form = this.options.form;
      this.element.addClass("fb-editor ui-widget");

      // Create ui

      // Layout elements
      this.container = $("<div>").addClass("container row");
      this.sidebar = this._createSidebar();
      this.content = $("<div>").addClass("content span8");

      this.container.append(this.sidebar, this.content);

      // Content element's contents
      this.header = this._createHeader();
      this.formFields = this._createFormFields();
      this.content.append(this.header, this.formFields);

      // Append all of them to the element
      this.element.append(this.container);

      this.refresh();
    },

    _createSidebar: function() {
      var sidebar = $("<div>").addClass("sidebar span7"),

      // Create tab headers
        addFieldHeader = $("<li>").append($('<a>').attr('href', '#tab-1').text("Add a Field")),
        fieldSettingsHeader = $("<li>").append($('<a>').attr('href', '#tab-2').text("Field Settings")),
        formSettingsHeader = $("<li>").append($('<a>').attr('href', '#tab-3').text("Form Settings")),

      // Create tab contents
        addFieldTab = $("<div>").attr('id', 'tab-1').text("add field"),
        fieldSettingsTab = $("<div>").attr('id', 'tab-2').text("field settings"),
        formSettingsTab = $("<div>").attr('id', 'tab-3').text("form settings"),

        headersList = $("<ul>").append(addFieldHeader, fieldSettingsHeader, formSettingsHeader);

      // Create tab contents
      return sidebar.append(headersList, addFieldTab, fieldSettingsTab, formSettingsTab).tabs();
    },

    _createHeader: function() {
      var form = this.form;
      return $("<div>").addClass("header")
                .append($("<h2>").addClass("form-name").text(form.name))
                .append($("<div>").addClass("form-description").text(form.description));
    },

    _createFormFields: function() {
      var form = this.form,
          list = $("<ul>").addClass("form-fields");

      $.each(form.fields, function(index, field) {
        var item = $("<li>").addClass("form-field"),
            label = $("<label>").attr("for", "form-field-" + index).text(field.title),
            input = $("<input>").attr("id", "form-field-" + index);
        item.append(label, input).appendTo(list);
      });

      return list;
    },

    _createContainer: function() {
      var container = $("<div>").addClass("container");
          sidebar = $("<div>").addClass("sidebar"),
          content = $("<div>").addClass("content");

      return container.append(sidebar, content);
    },

    _createFormHeader: function() {
      var form = this.form,
          container = $("<div>").addClass('form-header'),
          name = $('<h1>').addClass('form-name').text(form.name),
          description = $('<p>').addClass('form-description')
                                .text(form.description);
      return container.append(name, description);
    },

    _init: function() {
      console.log("_init");
    },

    refresh: function() {
      // console.log(this.options.form)
    },

    _setOption: function(key, value) {

      $.Widget.prototype._setOption.apply(this, arguments);
      // in 1.9
      // this._super('_setOption', key, value);
    },

    destroy: function() {
      // In jQuery UI 1.8, you must invoke the destroy method from the base widget
      $.Widget.prototype.destroy.call( this );
      // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
    }
  });
})(jQuery);
