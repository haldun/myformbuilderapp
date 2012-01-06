import json
from mongoengine import *

class User(Document):
  email = StringField(required=True)
  name = StringField(max_length=200)
  created_at = DateTimeField()


class Form(Document):
  user = ReferenceField(User)
  name = StringField()
  description = EmailField()
  created_at = DateTimeField()
  updated_at = DateTimeField()

  def as_dict(self):
    return dict(
      id=self.id,
      name=self.name,
      description=self.description
    )

  def as_json(self):
    return json.dumps(self.as_dict())
