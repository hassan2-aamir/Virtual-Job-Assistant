from app import create_app  # Import the create_app function from the app module

# Initialize the Flask app using the factory function
app = create_app()

# Run the app if this is the main file being executed
if __name__ == '__main__':
    app.run(debug=True)
