#!/usr/bin/env python3

import os
import cgi
import json
from datetime import datetime
import socket


# Get request method
method = os.environ.get("REQUEST_METHOD", "GET")

# Determine content type
content_type = os.environ.get("CONTENT_TYPE", "")


# Prepare data dictionary
data = {}

# Handle JSON payload first
if content_type.startswith("application/json"):
    try:
        length = int(os.environ.get("CONTENT_LENGTH", 0))
        if length > 0:
            raw = os.sys.stdin.read(length)
            data = json.loads(raw) if raw else {}
        else:
            data = {}
    except Exception as e:
        data = {"error": str(e)}
else:
    # Only now parse form fields
    form = cgi.FieldStorage()
    for key in form.keys():
        data[key] = form.getvalue(key)


# Gather environment info
hostname = socket.gethostname()
user_agent = os.environ.get("HTTP_USER_AGENT", "Unknown")
ip_address = os.environ.get("REMOTE_ADDR", "Unknown")
current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Output HTML
print("Content-Type: text/html")
print()
print("<html>")
print("<head><title>Echo Output</title></head>")
print("<body>")
print("<h1>Echo Endpoint Response</h1>")

print("<h2>Request Info</h2>")
print("<ul>")
print(f"<li>Method: {method}</li>")
print(f"<li>Hostname: {hostname}</li>")
print(f"<li>IP Address: {ip_address}</li>")
print(f"<li>User Agent: {user_agent}</li>")
print(f"<li>Time: {current_time}</li>")
print(f"<li>Content-Type: {content_type}</li>")
print("</ul>")

print("<h2>Data Received</h2>")
print("<pre>")
print(json.dumps(data, indent=4))
print("</pre>")

print("</body>")
print("</html>")


