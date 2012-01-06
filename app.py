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

import forms
import models

# Constants
APP_CONFIG_FILE = os.environ.get('APP_CONFIG_FILE', 'app_config.yml')

class Application(tornado.web.Application):
  def __init__(self):
    handlers = [
      (r'/', IndexHandler),
    ]
    settings = dict(
      debug=self.config['debug'],
      static_path=os.path.join(os.path.dirname(__file__), "static"),
      template_path=os.path.join(os.path.dirname(__file__), 'templates'),
      xsrf_cookies=True,
      cookie_secret=self.config['cookie_secret'],
    )
    tornado.web.Application.__init__(self, handlers, **settings)

  @property
  def config(self):
    if not hasattr(self, 'config'):
      f = file(APP_CONFIG_FILE, 'r')
      self._config = yaml.load(f)
      f.close()
    return self._config


class BaseHandler(tornado.web.RequestHandler):
  pass


class IndexHandler(BaseHandler):
  def get(self):
    self.write('Hellosssss tornado on app engine')


def main():
  tornado.options.parse_command_line()
  app = Application()
  http_server = tornado.httpserver.HTTPServer(app)
  http_server.bind(app.config['port'])
  http_server.start(app.config['debug'] and 1 or -1)
  tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
  main()
