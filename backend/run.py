from app import create_app, db
from app.models import User, Appointment, Availability

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
<<<<<<< HEAD
    app.run(host='0.0.0.0', port=5001, debug=True)
=======
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)
>>>>>>> 4ebda91af98a70c687679e59ca0d831b3d78bc79
