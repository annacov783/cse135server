#!/usr/bin/env python3

import cgi
import os
from http import cookies
import uuid



SESSION_DIR = "/var/www/cse135w26.com/state-sessions"


# Get or create session ID
cookie = cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
if "session_id" in cookie:
    session_id = cookie["session_id"].value
else:
    session_id = str(uuid.uuid4())

form = cgi.FieldStorage()

# Save data if submitted
if "username" in form:
    with open(f"{SESSION_DIR}/{session_id}", "w") as f:
        f.write(form.getvalue("username"))

# Output HTTP headers
print("Content-Type: text/html")
# Set session cookie
print(f"Set-Cookie: session_id={session_id}; Path=/")
print()

# HTML Form
print("""
<html>
<head><title>State Input Page</title></head>
<body>
<h1>Sesssion Testing: Enter your name</h1>

<h1>Enter Data</h1>
<form method="POST" action="/cgi-bin/hw2/python/state-save-python.py">
  Name: <input type="text" name="username">
  <button type="submit">Save</button>
</form>

<p>
    <a href="/cgi-bin/hw2/python/state-save-python.py">View Saved Data</a>
</p>
<p>
    <a href="/cgi-bin/hw2/python/state-destroy-python.py">Clear Data</a>
</p>
</body>
</html>
""")
