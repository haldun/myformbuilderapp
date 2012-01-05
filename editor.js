var FormBuilderViewModel = function(data) {
  var self = this;

  // Constants
  this.FieldTypes = FormBuilderViewModel.FieldTypes;

  // Data
  this.form = new FormViewModel(data);
  this.selectedField = ko.observable(null);

  // Behaviour
  this.selectField = function(field) {
    self.selectedField(field);
  };

  this.duplicateField = function(field) {
    var field = self.form.duplicateField(field);
    if (field) {
      self.selectedField(field);
    }
  };

  this.addField = function(data, event) {
    var field = self.form.addField(data, event);
    if (field) {
      self.selectedField(field);
    }
  };

  this.removeField = function(field) {
    if (field === self.selectedField()) {
      self.selectedField(null);
    }
    self.form.removeField(field);
  };
};
FormBuilderViewModel.FieldTypes = [
  'text', 'money', 'radio', 'number', 'textarea', 'checkbox'];

var FormViewModel = function(data) {
  var self = this;
  var mapping = {
    'Fields': {
      create: function(options) {
        return new FieldViewModel(options.data);
      }
    }
  };
  ko.mapping.fromJS(data, mapping, this);

  // Behaviour
  this.duplicateField = function(field) {
    var newFieldData = ko.toJS(field),
        index = ko.utils.arrayIndexOf(self.Fields(), field),
        newField = new FieldViewModel(newFieldData);
    self.Fields.splice(index, 0, newField);
    return newField;
  };

  this.addField = function(data, event) {
    var type = $(event.target).data("type");
    if (type === undefined) {
      return false;
    }
    var newFieldData = {
      Typeof: type,
      Title: "Untitled",
      IsRequired: false,
      Instructions: "",
      Choices: [],
      IsRandomized: false
    };
    var newField = new FieldViewModel(newFieldData);
    self.Fields.push(newField);
    return newField;
  };

  this.removeField = function(field) {
    self.Fields.remove(field);
  };
};

var FieldViewModel = function(data) {
  var self = this;
  ko.mapping.fromJS(data, {}, this);

  // Data
  this.PreviewTemplateName = ko.computed(function(){
    return "tmp-field-preview-" + this.Typeof();
  }, this);

  this.SettingsTemplateName = ko.computed(function(){
    return "tmp-field-settings-" + this.Typeof();
  }, this);

  this.HasChoices = ko.computed(function() {
    return this.Choices && this.Choices().length !== 0;
  }, this);

  // Behaviour
  this.addChoice = function() {
    self.Choices.push(ko.mapping.fromJS({"Choice": ""}));
  };

  this.removeChoice = function(choice) {
    self.Choices.remove(choice);
  };
};

ko.bindingHandlers.sortableList = {
  init: function(element, valueAccessor) {
    var list = valueAccessor();
    $(element).sortable({
      start: function(event, ui) {
        $(this).data('old-index', ui.item.index());
      },

      update: function(event, ui) {
        var oldIndex = $(this).data('old-index'),
            newIndex = ui.item.index(),
            item = list()[oldIndex];
        // TODO Update array
      }
    });
  }
};
