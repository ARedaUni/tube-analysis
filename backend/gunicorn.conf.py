# Gunicorn configuration file
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"  # Change this to your desired host:port
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'  # You can also use 'gevent' or 'eventlet' for async workers
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'gunicorn_django'

# SSL (if needed)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Django WSGI application path
wsgi_app = 'config.wsgi:application'