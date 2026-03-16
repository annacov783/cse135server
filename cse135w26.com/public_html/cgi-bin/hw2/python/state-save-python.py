#!/usr/bin/env python3

import cgitb, os
from http import cookies

cgitb.enable()

SESSION_DIR = "/var/www/cse135w26.com/state-sessions"

cookie = cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
session_id = cookie["session_id"].value if "session_id" in cookie else None

username = None
if session_id:
    path = f"{SESSION_DIR}/{session_id}"
    if os.path.exists(path):
        with open(path) as f:
            username = f.read()

print("Content-Type: text/html")
print()

print("<html><body>")
print("<h1>Saved Data</h1>")

if username:
    print(f"<p>Name: <b>{username}</b></p>")
else:
    print("<p>No data saved yet.</p>")

print('<p><a href="/cgi-bin/hw2/python/state-python.py">Enter Data</a></p>')
print('<p><a href="/cgi-bin/hw2/python/state-destroy-python.py">Clear Data</a></p>')
print("</body></html>")
