import os
import urllib.request
import json
import base64
import ssl

import sys

OWNER = os.environ.get("GITHUB_OWNER", "tech-prashanth")
REPO = os.environ.get("GITHUB_REPO", "aircraft-sale")
BRANCH = os.environ.get("GITHUB_BRANCH", "main")

def make_request(url, method, headers, data=None):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode('utf-8')
        
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            err_body = json.loads(e.read().decode('utf-8'))
            return e.code, err_body
        except Exception:
            return e.code, {"message": str(e)}
    except Exception as e:
        return 500, {"message": str(e)}

def get_file_sha(path, headers):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}?ref={BRANCH}"
    status, res = make_request(url, "GET", headers)
    if status == 200:
        return res.get('sha')
    return None

def upload_file(local_path, repo_path, headers):
    with open(local_path, 'rb') as f:
        content = base64.b64encode(f.read()).decode('utf-8')
        
    sha = get_file_sha(repo_path, headers)
    
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{repo_path}"
    payload = {
        "message": f"Upload {repo_path} via API",
        "content": content,
        "branch": BRANCH
    }
    if sha:
        payload["sha"] = sha
        
    status, res = make_request(url, "PUT", headers, payload)
    if status in (200, 201):
        print(f"[OK] Uploaded {repo_path}")
    else:
        print(f"[FAILED] Failed to upload {repo_path}: {res.get('message')}")

def get_all_files(dir_path):
    file_list = []
    for root, dirs, files in os.walk(dir_path):
        if '.git' in root or 'node_modules' in root or '__pycache__' in root or '.gemini' in root or '.system_generated' in root:
            continue
        for file in files:
            if file == 'database.db' or file.endswith('.pyc') or file == '.DS_Store' or (file.startswith('.env') and not file.endswith('.example')) or file.startswith('google-services'):
                continue
            full_path = os.path.join(root, file)
            file_list.append(full_path)
    return file_list

def main():
    print("==================================================")
    print("  GITHUB UPLOADER PORTAL (WITHOUT LOCAL GIT)")
    print("==================================================")
    
    token = os.environ.get("GITHUB_TOKEN", "")
    if len(sys.argv) > 1 and sys.argv[1]:
        token = sys.argv[1]
    if not token:
        token = input("Please enter your GitHub Personal Access Token (PAT): ").strip()
    if not token:
        print("Error: Personal Access Token is required.")
        return
        
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-Uploader"
    }
    
    url = f"https://api.github.com/repos/{OWNER}/{REPO}"
    status, res = make_request(url, "GET", headers)
    if status != 200:
        print(f"Error accessing repository {OWNER}/{REPO}: {res.get('message')}")
        print("Please verify the repo name and ensure your PAT has 'repo' scopes enabled.")
        return
        
    print(f"Connection verified to {OWNER}/{REPO} on branch '{BRANCH}'.")
    
    files_to_upload = []
    
    for folder in ['frontend', 'backend']:
        if os.path.exists(folder):
            files_to_upload.extend(get_all_files(folder))
            
    for file in ['.gitignore', 'README.md', 'vercel.json', 'push_to_github.py']:
        if os.path.exists(file):
            files_to_upload.append(file)
            
    if not files_to_upload:
        print("No files found to upload.")
        return
        
    print(f"Found {len(files_to_upload)} files to push. Uploading...")
    for local_file in files_to_upload:
        repo_file_path = local_file.replace(os.sep, '/')
        if repo_file_path.startswith('./'):
            repo_file_path = repo_file_path[2:]
        upload_file(local_file, repo_file_path, headers)
        
    print("Uploading complete!")

if __name__ == '__main__':
    main()
