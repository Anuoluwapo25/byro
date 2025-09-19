#!/bin/bash
apt-get update
apt-get install -y python3-pip git nginx supervisor

# For Python projects
pip3 install gunicorn


# Clone your repository
cd /var/www
git clone https://github.com/yourusername/your-project-name.git app
cd app

# Install dependencies and start app
pip3 install -r requirements.txt
# OR for Node.js: npm install

# Configure and start application
# Python: gunicorn --bind 0.0.0.0:8000 wsgi:application
# Node.js: pm2 start app.js