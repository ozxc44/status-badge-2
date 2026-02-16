#!/usr/bin/env python3
"""
Deploy Cloudflare Worker using direct API.
Bypasses wrangler CLI Node.js version requirement.

Usage:
    python3 deploy_worker.py <worker_name> <script_path> [account_id]
"""
import os
import sys
import base64
import requests
from pathlib import Path

def get_credentials():
    """Get Cloudflare credentials from various sources"""
    # Try environment variables first
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")

    # Try wrangler config file
    if not api_token or not account_id:
        home = Path.home()
        for config_file in [
            home / ".config" / "wrangler" / "config.json",
            home / ".wrangler" / "config.json",
        ]:
            if config_file.exists():
                import json
                with open(config_file) as f:
                    config = json.load(f)
                    api_token = api_token or config.get("api_token")
                    account_id = account_id or config.get("default_account") or config.get("account_id")
                break

    return api_token, account_id

def get_worker_script(script_path):
    """Read and return the worker script content"""
    script_path = Path(script_path)

    if script_path.is_file() and script_path.suffix == '.js':
        with open(script_path) as f:
            return f.read()

    # If directory, look for index.js or main entry point
    if script_path.is_dir():
        # Check wrangler.toml for main entry
        toml_path = script_path.parent / "wrangler.toml"
        main_file = "src/index.js"  # default

        if toml_path.exists():
            with open(toml_path) as f:
                for line in f:
                    if line.strip().startswith("main ="):
                        main_file = line.split("=")[1].strip().strip('"')
                        break

        full_path = script_path / main_file
        if full_path.exists():
            with open(full_path) as f:
                return f.read()

    raise FileNotFoundError(f"Could not find worker script at {script_path}")

def deploy_worker(worker_name, script_content, account_id, api_token):
    """Deploy worker to Cloudflare"""

    # First, check if worker exists
    list_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/javascript",
    }

    response = requests.get(list_url, headers={"Authorization": f"Bearer {api_token}"})
    worker_exists = False

    if response.status_code == 200:
        workers = response.json().get("result", [])
        worker_exists = any(w.get("id") == worker_name for w in workers)

    # Upload worker script
    upload_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{worker_name}"

    response = requests.put(upload_url, headers=headers, data=script_content)

    if response.status_code in (200, 201):
        print(f"Worker script uploaded successfully!")

        # Get worker URL
        subdomain = response.json().get("result", {}).get("subdomain")
        if subdomain:
            worker_url = f"https://{worker_name}.{subdomain}.workers.dev"
            print(f"Worker URL: {worker_url}")
            return worker_url
    else:
        print(f"Upload failed: {response.status_code}")
        print(response.text)
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 deploy_worker.py <worker_name> [script_path] [account_id]")
        print("\nIf script_path is not provided, will look for src/index.js")
        sys.exit(1)

    worker_name = sys.argv[1]
    script_path = sys.argv[2] if len(sys.argv) > 2 else Path.cwd() / "src"
    account_id = sys.argv[3] if len(sys.argv) > 3 else None

    api_token, default_account_id = get_credentials()

    if not api_token:
        print("Error: Could not find CLOUDFLARE_API_TOKEN")
        print("Set it as environment variable or in wrangler config")
        sys.exit(1)

    if not account_id:
        account_id = default_account_id

    if not account_id:
        print("Error: Could not find CLOUDFLARE_ACCOUNT_ID")
        print("Set it as environment variable or in wrangler config")
        sys.exit(1)

    try:
        script_content = get_worker_script(script_path)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    print(f"Deploying worker: {worker_name}")
    print(f"Script path: {script_path}")
    print(f"Account ID: {account_id}")

    result = deploy_worker(worker_name, script_content, account_id, api_token)

    if result:
        print(f"\nDeployed at: {result}")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
