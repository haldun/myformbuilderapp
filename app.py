import logging
import os

import yaml

import tornado.auth
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options
from tornado.web import url

import pymongo
import pymongo.objectid

import forms
# import models

# Constants
APP_CONFIG_FILE = os.environ.get('APP_CONFIG_FILE', 'app_config.yml')

class Application(tornado.web.Application):
  def __init__(self):
    handlers = [
      url(r'/', IndexHandler),
      url(r'/auth/google', GoogleAuthHandler),
      url(r'/logout', LogoutHandler, name='logout'),
      url(r'/home', HomeHandler, name='home'),
      url(r'/editor', EditorHandler, name='editor'),
    ]
    settings = dict(
      cookie_secret=self.config['cookie_secret'],
      debug=self.config['debug'],
      login_url="/auth/google",
      static_path=os.path.join(os.path.dirname(__file__), "static"),
      template_path=os.path.join(os.path.dirname(__file__), 'templates'),
      xsrf_cookies=True,
    )
    tornado.web.Application.__init__(self, handlers, **settings)
    self.connection = pymongo.Connection()
    self.db = self.connection[self.config['db']]

  @property
  def config(self):
    if not hasattr(self, 'config'):
      f = file(APP_CONFIG_FILE, 'r')
      self._config = yaml.load(f)
      f.close()
    return self._config


class BaseHandler(tornado.web.RequestHandler):
  def get_current_user(self):
    user_id = self.get_secure_cookie('user_id')
    if not user_id:
      return None
    return self.db.users.find_one({'_id': pymongo.objectid.ObjectId(user_id)})

  @property
  def db(self):
    return self.application.db


class IndexHandler(BaseHandler):
  def get(self):
    self.write('Hellosssss tornado on app engine')


class GoogleAuthHandler(BaseHandler, tornado.auth.GoogleMixin):
  @tornado.web.asynchronous
  def get(self):
    if self.get_argument('openid.mode', None):
      self.get_authenticated_user(self.async_callback(self._on_auth))
      return
    self.authenticate_redirect()

  def _on_auth(self, guser):
    if not guser:
      raise tornado.web.HTTPError(500, "Google auth failed")
    user = self.db.users.find_one({'email': guser['email']})
    if user is None:
      user = {
        'email': guser['email'],
        'name': guser['name'],
      }
      self.db.users.insert(user)
    self.set_secure_cookie('user_id', str(user['_id']))
    self.redirect(self.get_argument('next', self.reverse_url('home')))


class LogoutHandler(BaseHandler):
  def get(self):
    self.clear_cookie('user_id')
    self.redirect(self.reverse_url('index'))


class HomeHandler(BaseHandler):
  @tornado.web.authenticated
  def get(self):
    self.render('home.html',
                forms=self.db.forms.find({'user_id': self.current_user['_id']}))


class EditorHandler(BaseHandler):
  @tornado.web.authenticated
  def get(self):
    self.render('editor.html')


def main():
  tornado.options.parse_command_line()
  app = Application()
  http_server = tornado.httpserver.HTTPServer(app)
  http_server.bind(app.config['port'])
  http_server.start(app.config['debug'] and 1 or -1)
  tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
  main()
