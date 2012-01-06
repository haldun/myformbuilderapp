// Constants
var Tabs = {
  ADD_FIELD_TAB: 0,
  FIELD_SETTINGS_TAB: 1,
  FORM_SETTINGS_TAB: 2
};

var FieldTypes = [
  "text", "number", "textarea", "checkbox", "radio", "select", "section",
  "page", "shortname", "file", "address", "date", "email", "time", "phone",
  "url", "money", "likert"
];

// Root view model
var EditorViewModel = function(data) {
  var self = this;

  // Data
  this.Form = new FormViewModel(data);
  this.CurrentTab = ko.observable(Tabs.ADD_FIELD_TAB);
  this.SelectedField = ko.observable(null);

  // Helper data
  this.FormSettingsSelected = ko.computed(function(){
    this.CurrentTab() === Tabs.FORM_SETTINGS_TAB
  }, this);

  this.SelectedFieldIndex = ko.computed(function() {
    return self.Form.Fields.indexOf(self.SelectedField());
  }, this);

  // Behaviour
  this.showFormSettings = function() {
    self.CurrentTab(Tabs.FORM_SETTINGS_TAB);
  };

  this.selectField = function(field) {
    self.SelectedField(field);
    self.CurrentTab(Tabs.FIELD_SETTINGS_TAB);
  };

  this.selectFieldAtIndex = function(index) {
    if (index >= 0 && index < self.Form.Fields().length) {
      self.selectField(self.Form.Fields()[index]);
    }
  };

  // Duplicates the given field by delegating to FormViewModel
  this.duplicateField = function(field) {
    var field = self.Form.duplicateField(field);
    if (field) {
      self.SelectedField(field);
    }
  };

  // Adds a new field from given data. event is used to get the type of the
  // new field. Actually delegates to the FormViewModel
  this.addField = function(data, event) {
    var type = $(event.target).data("type");
    data.type = type;
    var field = self.Form.addField(data);

    // Scroll to the field
    // TODO This should not be here
    if (field) {
      $("html, body").animate({
        scrollTop: $(".field-wrapper:last").offset().top
      }, 1000);
    }
  };

  // Removes the given field. Actually delegates to the FormViewModel
  this.removeField = function(field) {
    if (field === self.SelectedField()) {
      self.SelectedField(null);
    }
    self.Form.removeField(field);
    if (!self.Form.HasFields() && self.CurrentTab() === Tabs.FIELD_SETTINGS_TAB) {
      self.CurrentTab(Tabs.ADD_FIELD_TAB);
    }
  };

  this.createFirstField = function() {
    var field = self.Form.addField({type: 'textarea'});
    field.Title("This is my first field, yeay!");
    self.selectField(field);
  };

  // Setup keyboard shortcuts
  $(document).bind('keydown', 'backspace', function(){
    var selectedField = self.SelectedField();
    if (selectedField !== null) {
      self.removeField(selectedField);
    }
  }).bind('keydown', 'j', function(){
    self.selectFieldAtIndex(self.SelectedFieldIndex() + 1);
  }).bind('keydown', 'k', function(){
    self.selectFieldAtIndex(self.SelectedFieldIndex() - 1);
  });
};

var getDefaultDataForType = function(type) {
  switch (type) {
  case 'text': return {};
  case 'number':
    return {
      Title: "Number"
    };
  case 'textarea': return {};
  case 'checkbox':
    return {
      Title: "Check all that apply",
      Choices: [
        {Choice: "First Choice"},
        {Choice: "Second Choice"},
        {Choice: "Third Choice"}
      ]
    };
  case 'radio':
    return {
      Title: "Select a Choice",
      Choices: [
        {Choice: "First Choice"},
        {Choice: "Second Choice"},
        {Choice: "Third Choice"}
      ]
    };
  case 'select':
    return {
      Title: "Select a Choice",
      Choices: [
        {Choice: "First Choice"},
        {Choice: "Second Choice"},
        {Choice: "Third Choice"}
      ]
    };
  case 'section':
    return {
      Title: "Section Break",
      Instructions: "A description of the section goes here."
    };
  case 'page': return {};
  case 'shortname':
    return {
      Title: "Name"
    };
  case 'file':
  case 'address':
  case "date":
  case "email":
  case "time":
  case "phone":
  case "url":
  case "money":
  case "likert":
  default: return {}
  }
};

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
    ko.mapping.fromJS(getDefaultDataForType(data.type), {}, newField);
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

// Custom ko bindings
ko.bindingHandlers.tab = {
  init: function(element, valueAccessor) {
    var currentTab = valueAccessor();
    $(element).find('a').click(function() {
      currentTab($(this).parent().index());
    });
  },

  update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
    var currentTab = valueAccessor()();
    $(element).find('li:nth(' + currentTab + ') a:first').trigger('click');
    // Dirty hack
    if (currentTab !== 1) {
      viewModel.SelectedField && viewModel.SelectedField(null);
    }
  }
};

(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  var data_key = "sortable_data";

  ko.bindingHandlers['sortableList'] = {
    init: function(element, valueAccessor) {
      $(element).mousedown(function() {
        // Keep track of the order of all child nodes (including text/comments)
        $(this).data("preSortChildren", ko.utils.makeArray(this.childNodes));
      });

      return $(element).sortable({
        update: function(event, ui) {
          // Figure out what data item was moved, from where, and to where
          var movedDataItem = $(ui.item).data(data_key);
          var possiblyObservableArray = valueAccessor();
          var array = ko.utils.unwrapObservable(possiblyObservableArray);
          var previousIndex = ko.utils.arrayIndexOf(array, movedDataItem);
          var newIndex = $(element).children().index(ui.item);

          // Restore the order of child nodes (including text/comments)
          this.innerHTML = "";
          $(this).append($(this).data("preSortChildren"));

          // Update the underlying collection to reflect the data item movement
          array.splice(previousIndex, 1);
          array.splice(newIndex, 0, movedDataItem);
          if (typeof possiblyObservableArray.valueHasMutated === 'function')
            possiblyObservableArray.valueHasMutated();
        }
      });
    }
  };

  ko.bindingHandlers['sortableItem'] = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      return $(element).data(data_key, ko.utils.unwrapObservable(valueAccessor()));
    }
  };
}).call(this);
