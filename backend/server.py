import http.server
import socketserver
import json
import sqlite3
import time
import random
import hashlib
import os

def load_dotenv(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, val = line.split('=', 1)
            os.environ[key.strip()] = val.strip()

# Load env configurations relative to backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, '.env'))

PORT = int(os.environ.get('PORT', 8080))
DB_FILE = os.path.join(backend_dir, os.environ.get('DB_FILE', 'database.db'))

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            phone TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            user_id INTEGER PRIMARY KEY,
            code TEXT,
            expires_at INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            company TEXT,
            email TEXT,
            interest TEXT,
            message TEXT,
            submitted_at INTEGER
        )
    ''')
    conn.commit()
    conn.close()

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Resolve the frontend directory path which is sibling to backend
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        frontend_dir = os.path.join(root_dir, 'frontend')
        super().__init__(*args, directory=frontend_dir, **kwargs)

    def log_message(self, format, *args):
        super().log_message(format, *args)

    def do_POST(self):
        if self.path == '/api/signup':
            self.handle_signup()
        elif self.path == '/api/login-request':
            self.handle_login_request()
        elif self.path == '/api/login-verify':
            self.handle_login_verify()
        elif self.path == '/api/inquire':
            self.handle_inquire()
        else:
            self.send_json_response(404, {"success": False, "message": "Endpoint not found"})

    def read_post_json(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def handle_signup(self):
        try:
            data = self.read_post_json()
            name = data.get('name', '')
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            phone = data.get('phone', '')

            if not name or not email or not password:
                self.send_json_response(400, {"success": False, "message": "Missing required fields"})
                return

            pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            try:
                c.execute('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
                          (name, email, pw_hash, phone))
                conn.commit()
                self.send_json_response(200, {"success": True, "message": "Account created successfully"})
            except sqlite3.IntegrityError:
                self.send_json_response(400, {"success": False, "message": "Email is already registered"})
            finally:
                conn.close()
        except Exception as e:
            self.send_json_response(500, {"success": False, "message": str(e)})

    def handle_login_request(self):
        try:
            data = self.read_post_json()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')

            pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('SELECT id, name FROM users WHERE email = ? AND password = ?', (email, pw_hash))
            user = c.fetchone()

            if user:
                user_id, user_name = user
                otp_code = str(random.randint(100000, 999999))
                expires_at = int(time.time()) + 60

                c.execute('INSERT OR REPLACE INTO otps (user_id, code, expires_at) VALUES (?, ?, ?)',
                          (user_id, otp_code, expires_at))
                conn.commit()
                
                self.send_json_response(200, {
                    "success": True,
                    "userId": user_id,
                    "otp": otp_code,
                    "message": "OTP generated"
                })
            else:
                self.send_json_response(401, {"success": False, "message": "Invalid credentials"})
            
            conn.close()
        except Exception as e:
            self.send_json_response(500, {"success": False, "message": str(e)})

    def handle_login_verify(self):
        try:
            data = self.read_post_json()
            user_id = data.get('userId')
            code = data.get('code', '').strip()

            if not user_id or not code:
                self.send_json_response(400, {"success": False, "message": "Missing verification parameters"})
                return

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('SELECT code, expires_at FROM otps WHERE user_id = ?', (user_id,))
            record = c.fetchone()

            if record:
                saved_code, expires_at = record
                current_time = int(time.time())

                if current_time > expires_at:
                    c.execute('DELETE FROM otps WHERE user_id = ?', (user_id,))
                    conn.commit()
                    self.send_json_response(401, {"success": False, "message": "Verification code has expired."})
                elif saved_code != code:
                    self.send_json_response(401, {"success": False, "message": "Invalid verification code."})
                else:
                    c.execute('DELETE FROM otps WHERE user_id = ?', (user_id,))
                    c.execute('SELECT name, email, phone FROM users WHERE id = ?', (user_id,))
                    user_profile = c.fetchone()
                    conn.commit()

                    if user_profile:
                        name, email, phone = user_profile
                        self.send_json_response(200, {
                            "success": True,
                            "user": {
                                "name": name,
                                "email": email,
                                "phone": phone
                            }
                        })
                    else:
                        self.send_json_response(404, {"success": False, "message": "User not found"})
            else:
                self.send_json_response(401, {"success": False, "message": "No active verification request found."})
            
            conn.close()
        except Exception as e:
            self.send_json_response(500, {"success": False, "message": str(e)})

    def handle_inquire(self):
        try:
            data = self.read_post_json()
            name = data.get('name', '')
            company = data.get('company', '')
            email = data.get('email', '')
            interest = data.get('interest', '')
            message = data.get('message', '')

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('''
                INSERT INTO inquiries (name, company, email, interest, message, submitted_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (name, company, email, interest, message, int(time.time())))
            conn.commit()
            conn.close()

            self.send_json_response(200, {"success": True, "message": "Inquiry recorded successfully"})
        except Exception as e:
            self.send_json_response(500, {"success": False, "message": str(e)})

if __name__ == '__main__':
    init_db()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            httpd.server_close()
