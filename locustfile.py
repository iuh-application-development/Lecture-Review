from locust import HttpUser, task, between
import random
import string

def random_email():
    return ''.join(random.choices(string.ascii_lowercase, k=6)) + "@test.com"

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.email = random_email()
        self.password = "test123"
        self.note_ids = []
        self.register_and_login()

    def register_and_login(self):
    # Đăng ký
        response = self.client.post(
            "/register",
            json={
                "email": self.email,
                "password": self.password,
                "first_name": "Locust",
                "last_name": "User",
                "gender": "Other"
            },
            headers={"Content-Type": "application/json"}
        )
        try:
            if response.status_code == 200 and response.json().get("success"):
                print(f"Registered {self.email}")
        except Exception as e:
            print(f"Failed to register {self.email}: {e}")
            print("Response text:", response.text[:200])

        # Đăng nhập
        response = self.client.post(
            "/login",
            json={
                "email": self.email,
                "password": self.password
            },
            headers={"Content-Type": "application/json"}
        )
        try:
            if response.status_code == 200 and response.json().get("success"):
                print(f"Logged in {self.email}")
                self.client.cookies.update(response.cookies)
            else:
                print(f"Login failed for {self.email}: {response.text}")
        except Exception as e:
            print(f"Login error for {self.email}: {e}")
            print("Response text:", response.text[:200])


    @task(3)
    def create_note(self):

        payload = {
            "title": f"Note from Locust {random.randint(1, 1000)}",
            "content": {
                "blocks": [
                    {"type": "paragraph", "data": {"text": "Load testing content"}}
                ]
            },
            "color": random.choice(["note-blue", "note-green", "note-purple", "note-yellow"]),
            "tags": ["locust", "test"],
            "is_public": random.choice([True, False]),

        }

        with self.client.post(
            "/api/notes/create",
            json=payload,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                try:
                    json_resp = response.json()
                    note_id = json_resp.get("note_id")
                    if note_id:
                        self.note_ids.append(note_id)
                        response.success()
                        print(f"Created note {note_id} by {self.email}")
                    else:
                        response.failure(f"No note_id in response: {response.text}")
                except Exception as e:
                    response.failure(f"JSON decode failed: {e}")
            else:
                response.failure(f"Failed to create note: status {response.status_code} - {response.text}")


    @task(2)
    def get_notes(self):
        self.client.get("/api/notes", headers={"Content-Type": "application/json"})

    @task(2)
    def get_public_notes(self):
        self.client.get("/api/public-notes", headers={"Content-Type": "application/json"})

    @task(1)
    def view_dashboard(self):
        self.client.get("/dashboard", headers={"Content-Type": "application/json"})

    @task(1)
    def view_note_detail(self):
        if self.note_ids:
            note_id = random.choice(self.note_ids)
            self.client.get(f"/api/notes/{note_id}", headers={"Content-Type": "application/json"})

    @task(1)
    def share_note(self):
        if self.note_ids:
            note_id = random.choice(self.note_ids)
            recipient_email = random.choice([
                f"user{i}@example.com" for i in range(1, 6)
                if f"user{i}@example.com" != self.email
            ])
            self.client.post(
                "/api/share-note",
                json={
                    "note_id": note_id,
                    "recipient_email": recipient_email,
                    "message": "Check this out!",
                    "can_edit": random.choice([True, False]),
                    "is_public": random.choice([True, False])
                },
                headers={"Content-Type": "application/json"}
            )

    @task(1)
    def clone_note(self):
        if self.note_ids:
            note_id = random.choice(self.note_ids)
            self.client.post(f"/api/notes/{note_id}/clone", headers={"Content-Type": "application/json"})
