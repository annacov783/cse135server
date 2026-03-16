#!/usr/bin/env python3

import cgi
import os
import json
from datetime import datetime

#get current date/time
now = datetime.now()
current_time = now.strftime("%Y-%m-%d %H:%M:%S")

#user IP
user_ip = os.environ.get('REMOTE_ADDR', 'Unknown')

language = "Python"

#JSON data
data = {
    "language": language,
    "generated_at": current_time,
    "user_ip": user_ip,
    "message": "Hello World!"
}

print("Content-Type: application/json\n")

#print string
print(json.dumps(data))
