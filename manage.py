import os
import subprocess
import time

def run_command(command, cwd=None, shell=True):
    """Runs a command in a separate process."""
    process = subprocess.Popen(command, cwd=cwd, shell=shell)
    return process

def main():
    root_dir = os.path.abspath(".")

    # Step 1: Activate virtual environment and run app.py separately
    venv_activate = os.path.join(root_dir, "CognitLaw", ".venv", "Scripts", "activate")
    app_script = os.path.join(root_dir, "CognitLaw", "app.py")

    print("Starting Python backend...")
    backend_process = run_command(f'cmd /c "call {venv_activate} && python {app_script}"', cwd=os.path.join(root_dir, "CognitLaw"))

    time.sleep(5)  # Wait for backend to initialize

    # Step 2: Start Website Client separately
    client_dir = os.path.join(root_dir, "Website", "Client")
    print("Starting Website Client...")
    client_process = run_command("cmd /c start npm run dev", cwd=client_dir)

    time.sleep(5)  # Wait for client to initialize

    # Step 3: Start Website Server separately
    server_dir = os.path.join(root_dir, "Website", "Server")
    print("Starting Website Server...")
    server_process = run_command("cmd /c start npm run dev", cwd=server_dir)

    # Print message indicating all processes have started
    print("All services started successfully. Backend, Client, and Server are running in separate processes.")

if __name__ == "__main__":
    main()
