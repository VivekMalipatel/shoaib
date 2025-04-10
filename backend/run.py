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
    port = 5001
    app.run(host='0.0.0.0', port=port, debug=True)
