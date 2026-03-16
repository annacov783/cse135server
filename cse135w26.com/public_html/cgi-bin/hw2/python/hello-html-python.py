#!/usr/bin/env python3

import cgi
import os
from datetime import datetime

#get date and time variable
now = datetime.now()  
current_time = now.strftime("%Y-%m-%d %H:%M:%S")  

#user ip variable
user_ip = os.environ.get('REMOTE_ADDR', 'Unknown')

print("Content-Type: text/html\n")
print()
print("<html>")
print("<head>")
print("<title>Python CGI Hello World</title>")
print("</head>")
print("<body>")
print("<h1 align=center>Hello World!</h1>")
print("<p>This program was generated with Python programming language.</p>")

print("<p>This program was generated at: {} </p>".format(current_time))

print("<p>Your current IP adress is: {} </p>".format(user_ip))
print("</body>")
print("</html>")
