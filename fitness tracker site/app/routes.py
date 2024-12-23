from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, send_file, session, make_response
from . import mail
from flask_mail import Message
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash

# Create a Blueprint for the routes
bp = Blueprint('bp', __name__)

users = {} # Store user data in a dictionary

# Store goals for each user
user_goals = {}

# Dictionary to store user-specific activities
activities_data = {}

# Static pages
@bp.route('/')
def home():
    return render_template('home.html')

@bp.route('/activities')
def activities_page():  # Renamed route to avoid conflict
    email = request.cookies.get('email')
    if not email or email not in users:
        return redirect(url_for('bp.login'))
    user_activities = activities_data.get(email, [])
    return render_template('activities.html', activities=user_activities)

@bp.route('/save_progress', methods=['POST'])
def save_progress():
    email = request.cookies.get('email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    name = data.get('name')
    category = data.get('category')
    progress = data.get('progress')

    if email not in activities_data:
        activities_data[email] = []  # Initialize if not present

    user_activities = activities_data[email]
    existing_activity = next((activity for activity in user_activities if activity['name'] == name and activity['category'] == category), None)

    if existing_activity:
        existing_activity['progress'] = progress
    else:
        user_activities.append({'name': name, 'category': category, 'progress': progress})

    return jsonify({'message': 'Progress saved successfully!'})

@bp.route('/get_activities', methods=['GET'])
def get_activities():
    email = request.cookies.get('email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    # Retrieve the activities from the activities_data dictionary
    user_activities = activities_data.get(email, [])
    return jsonify(user_activities)


@bp.route('/add_activity', methods=['POST'])
def add_activity():
    email = request.cookies.get('email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    name = data.get('name')
    category = data.get('category')

    if not name or not category:
        return jsonify({'error': 'Invalid input'}), 400

    if email not in activities_data:
        activities_data[email] = []  # Initialize if not present

    activities_data[email].append({'name': name, 'category': category, 'progress': 0})
    return jsonify({'message': 'Activity added successfully!'})


@bp.route('/goals')
def goals():
    email = request.cookies.get('email')
    if not email or email not in users:
        return redirect(url_for('bp.login'))

    goals = user_goals.get(email, [])
    return render_template('goals.html', goals=goals)


@bp.route('/api/user_goals', methods=['GET', 'POST'])
def manage_goals():
    email = request.cookies.get('email')
    if not email or email not in users:
        return jsonify({"message": "User not logged in or data not found."}), 404

    if request.method == 'POST':
        goal_data = request.get_json()
        goal_title = goal_data.get('title')
        goal_description = goal_data.get('description')
        goal_deadline = goal_data.get('deadline')

        if email not in user_goals:
            user_goals[email] = []
        user_goals[email].append({
            "title": goal_title,
            "description": goal_description,
            "deadline": goal_deadline
        })
        return jsonify({"message": "Goal saved successfully.", "goals": user_goals[email]}), 201

    # Handle GET requests to fetch user goals
    return jsonify({"goals": user_goals.get(email, [])})

@bp.route('/progress')
def progress():
    return render_template('progress.html')

@bp.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        flash("Settings updated!", "success")
        return redirect(url_for('bp.settings'))
    return render_template('settings.html')

@bp.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        user_name = request.form.get('name')
        user_email = request.form.get('email')
        user_message = request.form.get('message')

        if not user_name or not user_email or not user_message:
            flash("All fields are required. Please fill out the form completely.", "error")
            return redirect(url_for('bp.contact'))

        msg = Message(
            subject=f"New Contact Form Submission from {user_name}",
            sender=user_email,
            recipients=['hamodyhelmy2020@gmail.com']
        )
        msg.body = f"""
        Name: {user_name}
        Email: {user_email}
        Message: {user_message}
        """

        try:
            mail.send(msg)
            flash("Message sent successfully! We will get back to you soon.", "success")
        except Exception as e:
            print(f"Error sending email: {e}")
            flash("Failed to send message. Please try again later.", "error")

        return redirect(url_for('bp.contact'))
    return render_template('contact.html')

# API for Progress Data
@bp.route('/api/chart_data', methods=['GET'])
def get_chart_data():
    period = request.args.get('period', 'weekly')  # Default to 'weekly' if no period is specified

    # Generate the data based on the period
    if period == 'weekly':
        data = {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "workouts": [3, 4, 2, 1, 3, 5, 4],
            "calories": [300, 400, 250, 200, 300, 450, 400]
        }
    elif period == 'monthly':
        data = {
            "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
            "workouts": [12, 14, 10, 15],
            "calories": [1200, 1400, 1000, 1500]
        }
    elif period == 'yearly':
        data = {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "workouts": [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
            "calories": [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500]
        }
    else:
        data = {
            "error": "Invalid period. Please use 'weekly', 'monthly', or 'yearly'."
        }

    return jsonify(data)

# Progress summary API
@bp.route('/api/progress_summary', methods=['GET'])
def get_progress_summary():
    period = request.args.get('period', 'weekly')

    # Dynamic progress summary based on the period
    if period == 'weekly':
        summary = {
            "total_workouts": 45,
            "total_calories": 12000,
            "goal_progress": 75
        }
    elif period == 'monthly':
        summary = {
            "total_workouts": 180,
            "total_calories": 48000,
            "goal_progress": 60
        }
    elif period == 'yearly':
        summary = {
            "total_workouts": 540,
            "total_calories": 144000,
            "goal_progress": 50
        }
    else:
        summary = {
            "error": "Invalid period. Please use 'weekly', 'monthly', or 'yearly'."
        }

    return jsonify(summary)

# Recent activities API
@bp.route('/api/recent_activities', methods=['GET'])
def get_recent_activities():
    period = request.args.get('period', 'weekly')
    
    # Filter activities based on the period
    if period == 'weekly':
        activities = [
            {"date": "2024-12-01", "type": "Running", "duration": "30 mins", "calories": 300},
            {"date": "2024-12-03", "type": "Cycling", "duration": "45 mins", "calories": 500},
            {"date": "2024-12-05", "type": "Yoga", "duration": "60 mins", "calories": 200}
        ]
    elif period == 'monthly':
        activities = [
            {"date": "2024-11-01", "type": "Running", "duration": "180 mins", "calories": 1300},
            {"date": "2024-11-07", "type": "Cycling", "duration": "250 mins", "calories": 1500},
            {"date": "2024-11-14", "type": "Yoga", "duration": "280 mins", "calories": 2000},
            {"date": "2024-11-21", "type": "Gym", "duration": "300 mins", "calories": 3000}
        ]
    elif period == 'yearly':
        activities = [
            {"date": "2024-10-01", "type": "Running", "duration": "2000 mins", "calories": 13000},
            {"date": "2024-11-01", "type": "Cycling", "duration": "2700 mins", "calories": 15000},
            {"date": "2024-12-01", "type": "Yoga", "duration": "5000 mins", "calories": 20000}
        ]
    else:
        activities = {"error": "Invalid period. Please use 'weekly', 'monthly', or 'yearly'."}
    
    return jsonify(activities)

@bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        # Render the signup page if accessed via GET
        return render_template('signup.html')

    # Handle POST request (form submission)
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    username = data.get('username')
    email = data.get('email')
    telephone = data.get('telephone')
    country = data.get('country')
    password = data.get('password')

    # Validate if email or username already exists
    if email in users or any(user['username'] == username for user in users.values()):
        # Pass a message back to the signup template
        return render_template('signup.html', message="Email or username already exists.")
    else:
        # Save the new user's data
        users[email] = {
            'username': username,
            'email': email,
            'telephone': telephone,
            'country': country,
            'password': password
        }
        # Redirect to login page on successful signup
        return render_template('login.html')


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    identifier = data.get('identifier')  # Can be username or email
    password = data.get('password')

    # Find user by username or email
    user = next((user for user in users.values() if user['email'] == identifier or user['username'] == identifier), None)

    if user and user['password'] == password:
        # Set both email and username cookies
        response = make_response(render_template('home.html'))
        response.set_cookie('email', user['email'])
        response.set_cookie('username', user['username'])
        return response
    else:
        return render_template('login.html', message="Invalid credentials. Please try again.")

@bp.route('/update-data', methods=['PUT'])
def update_data():
    email = request.cookies.get('email')
    username = request.cookies.get('username')
    
    # Check if either email or username exists in the cookies
    user = None
    if email in users:
        user = users[email]
    elif username:
        # Look up user by username if email is not found
        user = next((u for u in users.values() if u['username'] == username), None)

    if not user:
        return jsonify({"message": "User not logged in or data not found."}), 404

    # Get the updated data from the request
    data = request.get_json()
    new_email = data.get('new_email')
    new_password = data.get('new_password')
    new_username = data.get('new_username')

    # Update email, username, and/or password if provided
    if new_email:
        # Ensure the new email doesn't already exist
        if new_email in users:
            return jsonify({"message": "Email already exists."}), 400
        # Update the email in the users dictionary
        print(f"Updating email from {email} to {new_email}")
        
        # Remove the old email key and add the new email key
        user_data = users.pop(email)  # Remove old email entry
        user_data['email'] = new_email  # Set the new email in the user data
        users[new_email] = user_data  # Add new email entry
        
        email = new_email  # Update the reference to the new email

    if new_password:
        users[email]['password'] = new_password  # Update password for the current email

    if new_username:
        users[email]['username'] = new_username  # Update username for the current email

    # Set updated email and username in the cookie
    response = jsonify({"message": "User data updated successfully."})
    response.set_cookie('email', email, max_age=60*60*24*365, path='/')  # Set email cookie
    response.set_cookie('username', new_username or users[email]['username'], max_age=60*60*24*365, path='/')  # Set username cookie

    return response

@bp.route('/download-data', methods=['GET'])
def download_data():
    email = request.cookies.get('email')
    username = request.cookies.get('username')
    
    # If either email or username is present, use them to fetch user data
    user = None
    if email in users:
        user = users[email]
    elif username:
        user = next((u for u in users.values() if u['username'] == username), None)

    if user:
        return jsonify({
            "username": user['username'],
            "email": user['email'],
            "telephone": user['telephone'],
            "country": user['country']
        })
    else:
        return jsonify({"message": "User not logged in or data not found."}), 404

@bp.route('/delete-data', methods=['DELETE'])
def delete_data():
    email = request.cookies.get('email')
    username = request.cookies.get('username')
    
    # Check if either email or username exists in the cookies
    user = None
    if email in users:
        user = users[email]
    elif username:
        user = next((u for u in users.values() if u['username'] == username), None)

    if user:
        # If a user is found, delete their data and remove the cookie
        if email:
            del users[email]
        elif username:
            # Find the user by username and delete their data
            del users[next((k for k, v in users.items() if v['username'] == username), None)]

        response = jsonify({"message": "User data deleted successfully."})
        response.delete_cookie('email')
        response.delete_cookie('username')
        return response
    else:
        return jsonify({"message": "User not logged in or data not found."}), 404

