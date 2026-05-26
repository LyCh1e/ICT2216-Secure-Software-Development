#!/usr/bin/env python3
"""Launch the TrialGuard stack and open the browser."""

import shutil
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser

URL = "https://localhost"
WAIT_SECONDS = 120
POLL_INTERVAL = 2


def check_prerequisites():
    missing = []
    if not shutil.which("docker"):
        missing.append("docker (Docker Desktop not found or not in PATH)")
    if missing:
        print("ERROR: Missing prerequisites:")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)

    result = subprocess.run(
        ["docker", "info"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("ERROR: Docker daemon is not running.")
        print("  Start Docker Desktop and try again.")
        sys.exit(1)

    if not shutil.which("docker"):
        print("ERROR: 'docker compose' plugin not available.")
        sys.exit(1)


def docker_compose(args):
    try:
        return subprocess.run(["docker", "compose"] + args)
    except FileNotFoundError:
        print("ERROR: 'docker' command not found. Is Docker Desktop installed?")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nInterrupted.")
        sys.exit(130)


def stack_ready():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        urllib.request.urlopen(URL, timeout=3, context=ctx)
        return True
    except (urllib.error.URLError, OSError):
        return False


def check_unhealthy_containers():
    result = subprocess.run(
        ["docker", "compose", "ps", "--format", "{{.Name}}\t{{.Status}}"],
        capture_output=True,
        text=True,
    )
    unhealthy = [
        line for line in result.stdout.splitlines()
        if "unhealthy" in line.lower() or "exited" in line.lower()
    ]
    return unhealthy


def purge_frontend_volume():
    """Delete the frontend_dist volume so the new build always gets served."""
    vol = "ict2216-secure-software-development_frontend_dist"

    # Stop containers that hold the volume before removing it
    subprocess.run(["docker", "compose", "stop", "nginx", "frontend-build"],
                   capture_output=True)

    # Remove any stopped containers still referencing the volume
    result = subprocess.run(
        ["docker", "ps", "-a", "--filter", f"volume={vol}", "--format", "{{{{.ID}}}}"],
        capture_output=True, text=True,
    )
    for cid in result.stdout.split():
        subprocess.run(["docker", "rm", cid.strip()], capture_output=True)

    # Remove the volume itself (ignore error if it doesn't exist yet)
    subprocess.run(["docker", "volume", "rm", vol], capture_output=True)


def main():
    check_prerequisites()

    print("Purging stale frontend volume to pick up UI changes...")
    purge_frontend_volume()

    print("Building and starting TrialGuard stack...")
    result = docker_compose(["up", "-d", "--build"])
    if result.returncode != 0:
        print("\nERROR: 'docker compose up' failed (exit code %d)." % result.returncode)
        print("  Run 'docker compose logs' for details.")
        sys.exit(result.returncode)

    print(f"Waiting for {URL} (up to {WAIT_SECONDS}s)", end="", flush=True)
    deadline = time.time() + WAIT_SECONDS
    while time.time() < deadline:
        if stack_ready():
            break
        print(".", end="", flush=True)
        time.sleep(POLL_INTERVAL)
    else:
        print("\n\nERROR: Timed out waiting for the stack to become ready.")
        unhealthy = check_unhealthy_containers()
        if unhealthy:
            print("  The following containers may have failed:")
            for c in unhealthy:
                print(f"    {c}")
        print("  Run 'docker compose logs' to diagnose.")
        sys.exit(1)

    print(f"\nStack is up — opening {URL}")
    try:
        webbrowser.open(URL)
    except Exception as e:
        print(f"  (Could not open browser automatically: {e})")
        print(f"  Open manually: {URL}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nAborted.")
        sys.exit(130)
