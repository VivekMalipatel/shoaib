import os
import sys

# Manually read the .env file
if os.path.exists('.env'):
    env_vars = {}
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key] = value

from app import create_app, db
from app.models import User, Appointment, Availability
from config import Config

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Appointment': Appointment,
        'Availability': Availability
    }

if __name__ == '__main__':
    # Use port 5001 instead of 5000 to avoid conflict with AirPlay on macOS
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
