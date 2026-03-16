#!/usr/bin/env python3

import os


print("Content-Type: text/html")
print()  # Blank line separates headers from content

print("<html>")
print("<head><title>Environment Variables</title></head>")
print("<body>")
print("<h1>Environment Variables</h1>")
print("<table border='1'>")
print("<tr><th>Variable</th><th>Value</th></tr>")

#loop through environment variables
for key, value in os.environ.items():
    print(f"<tr><td>{key}</td><td>{value}</td></tr>")

print("</table>")
print("</body>")
print("</html>")
