# Sensible defaults; tune for your CPU
bind = "0.0.0.0:8000"
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"
wsgi_app = "app.main:app"
timeout = 90
graceful_timeout = 30
keepalive = 5
