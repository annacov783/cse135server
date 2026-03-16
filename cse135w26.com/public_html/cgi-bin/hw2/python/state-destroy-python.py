#!/usr/bin/env python3

import cgitb, os
from http import cookies

cgitb.enable()

SESSION_DIR = "/var/www/cse135w26.com/state_sessions"

cookie = cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
if "session_id" in cookie:
    session_id = cookie["session_id"].value
    path = f"{SESSION_DIR}/{session_id}"
    if os.path.exists(path):
        os.remove(path)

print("Content-Type: text/html")
print("Set-Cookie: session_id=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT")
print()

print("""
<html>
<body>
<h1>State Cleared</h1>
<p><a href="/cgi-bin/hw2/python/state-python.py">Start Over</a></p>
</body>
</html>
""")

