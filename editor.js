var FormBuilderViewModel = function(data) {
  var self = this;

  // Constants
  this.FieldTypes = FormBuilderViewModel.FieldTypes;

  // Data
  this.Form = new FormViewModel(data);
  this.CurrentTab = ko.observable(0);
  this.selectedField = ko.observable(null);

  // Behaviour
  this.selectField = function(field) {
    self.selectedField(field);
    self.CurrentTab(1);
  };

  this.duplicateField = function(field) {
    var field = self.Form.duplicateField(field);
    if (field) {
      self.selectedField(field);
    }
  };

  this.addField = function(data, event) {
    var type = $(event.target).data("type");
    data.type = type;
    var field = self.Form.addField(data);
  };

  this.removeField = function(field) {
    if (field === self.selectedField()) {
      self.selectedField(null);
    }
    self.Form.removeField(field);
  };

  this.createFirstField = function() {
    var field = self.Form.addField({type: 'textarea'});
    field.Title("This is my first field, yeay!");
    self.selectField(field);
  };
};
FormBuilderViewModel.FieldTypes = [
  "text", "number", "textarea", "checkbox", "radio", "select", "section",
  "page", "shortname", "file", "address", "date", "email", "time", "phone",
  "url", "money", "likert"];

var FormViewModel = function(data) {
  var self = this;
  var mapping = {
    'Fields': {
      create: function(options) {
        return new FieldViewModel(options.data || []);
      }
    }
  };
  this.Name = ko.observable("Untitled");
  this.Description = ko.observable("");
  this.Fields = ko.observableArray([]);
  ko.mapping.fromJS(data, mapping, this);

  this.HasFields = ko.computed(function(){
    return this.Fields().length !== 0;
  }, this);

  // Behaviour
  this.duplicateField = function(field) {
    var newFieldData = ko.toJS(field),
        index = ko.utils.arrayIndexOf(self.Fields(), field),
        newField = new FieldViewModel(newFieldData);
    self.Fields.splice(index, 0, newField);
    return newField;
  };

  this.addField = function(data) {
    if (data.type === undefined) {
      return false;
    }
    var newField = new FieldViewModel({Typeof: data.type});

    // TODO This code should not be here
    if ('checkbox' === data.type) {
      ko.mapping.fromJS({
        Title: "Check all that apply",
        Choices: [
          {Choice: "First Choice"},
          {Choice: "Second Choice"},
          {Choice: "Third Choice"}
        ]
      }, {}, newField);
    } else if ('number' === data.type) {
      ko.mapping.fromJS({
        Title: "Number"
      }, {}, newField);
    } else if ('radio' === data.type) {
      ko.mapping.fromJS({
        Title: "Select a Choice",
        Choices: [
          {Choice: "First Choice"},
          {Choice: "Second Choice"},
          {Choice: "Third Choice"}
        ]
      }, {}, newField);
    } else if ('section' === data.type) {
      ko.mapping.fromJS({
        Title: "Section Break",
        Instructions: "A description of the section goes here."
      }, {}, newField);
    } else if ('shortname' === data.type) {
      ko.mapping.fromJS({
        Title: "Name"
      }, {}, newField);
    } else if ('select' === data.type) {
      ko.mapping.fromJS({
        Title: "Select a Choice",
        Choices: [
          {Choice: "First Choice"},
          {Choice: "Second Choice"},
          {Choice: "Third Choice"}
        ]
      }, {}, newField);
    }

    self.Fields.push(newField);
    return newField;
  };

  this.removeField = function(field) {
    self.Fields.remove(field);
  };
};

var FieldViewModel = function(data) {
  var self = this;
  this.Typeof = ko.observable();
  this.Title = ko.observable("Untitled");
  this.IsRequired = ko.observable(false);
  this.Instructions = ko.observable("");
  this.Choices = ko.observableArray([]);
  this.IsRandomized = ko.observableArray(null);
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

ko.bindingHandlers.tab = {
  init: function(element, valueAccessor) {
    var currentTab = valueAccessor();
    $(element).find('a').click(function() {
      currentTab($(this).parent().index());
    });
  },

  update: function(element, valueAccessor) {
    var currentTab = valueAccessor()();
    $(element).find('li:nth(' + currentTab + ') a:first').trigger('click');
  }
};
