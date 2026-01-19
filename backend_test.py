import requests
import sys
import json
from datetime import datetime

class ComplaintManagementTester:
    def __init__(self, base_url="https://lab-assist-portal.preview.emergentagent.com"):
        self.base_url = base_url
        self.lab_admin_token = None
        self.icc_admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=default_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_detail = response.json()
                    details += f" - {error_detail}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return None

    def test_lab_admin_signup(self):
        """Test lab admin signup"""
        test_data = {
            "name": "Test Lab Admin",
            "email": f"labadmin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!"
        }
        
        response = self.run_test(
            "Lab Admin Signup",
            "POST",
            "auth/lab-admin/signup",
            200,
            data=test_data
        )
        
        if response and 'token' in response:
            self.lab_admin_token = response['token']
            return True
        return False

    def test_lab_admin_login(self):
        """Test lab admin login with existing credentials"""
        # First create an admin
        signup_data = {
            "name": "Login Test Lab Admin",
            "email": f"lablogin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!"
        }
        
        signup_response = self.run_test(
            "Lab Admin Signup for Login Test",
            "POST",
            "auth/lab-admin/signup",
            200,
            data=signup_data
        )
        
        if not signup_response:
            return False
        
        # Now test login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        
        response = self.run_test(
            "Lab Admin Login",
            "POST",
            "auth/lab-admin/login",
            200,
            data=login_data
        )
        
        return response is not None

    def test_icc_admin_signup(self):
        """Test ICC admin signup"""
        test_data = {
            "name": "Test ICC Admin",
            "email": f"iccadmin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!"
        }
        
        response = self.run_test(
            "ICC Admin Signup",
            "POST",
            "auth/icc-admin/signup",
            200,
            data=test_data
        )
        
        if response and 'token' in response:
            self.icc_admin_token = response['token']
            return True
        return False

    def test_icc_admin_login(self):
        """Test ICC admin login"""
        # First create an admin
        signup_data = {
            "name": "Login Test ICC Admin",
            "email": f"icclogin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!"
        }
        
        signup_response = self.run_test(
            "ICC Admin Signup for Login Test",
            "POST",
            "auth/icc-admin/signup",
            200,
            data=signup_data
        )
        
        if not signup_response:
            return False
        
        # Now test login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        
        response = self.run_test(
            "ICC Admin Login",
            "POST",
            "auth/icc-admin/login",
            200,
            data=login_data
        )
        
        return response is not None

    def test_lab_complaint_submission(self):
        """Test lab complaint submission"""
        complaint_data = {
            "name": "Test Student",
            "roll_number": "CS2021001",
            "stream": "Computer Science",
            "phone": "9876543210",
            "email": "student@test.com",
            "lab_number": "Lab 101",
            "complaint": "The computers in Lab 101 are not working properly. Multiple systems are showing blue screen errors.",
            "photo_base64": None
        }
        
        response = self.run_test(
            "Lab Complaint Submission",
            "POST",
            "lab-complaints",
            200,
            data=complaint_data
        )
        
        return response is not None

    def test_icc_complaint_submission(self):
        """Test ICC complaint submission"""
        complaint_data = {
            "name": "Test Student ICC",
            "roll_number": "CS2021002",
            "stream": "Computer Science",
            "phone": "9876543211",
            "email": "student2@test.com",
            "complaint": "I want to report an incident of harassment by a faculty member during class hours."
        }
        
        response = self.run_test(
            "ICC Complaint Submission",
            "POST",
            "icc-complaints",
            200,
            data=complaint_data
        )
        
        return response is not None

    def test_lab_complaints_fetch(self):
        """Test fetching lab complaints (requires auth)"""
        if not self.lab_admin_token:
            self.log_test("Lab Complaints Fetch", False, "No lab admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.lab_admin_token}'}
        response = self.run_test(
            "Lab Complaints Fetch",
            "GET",
            "lab-complaints",
            200,
            headers=headers
        )
        
        return response is not None

    def test_icc_complaints_fetch(self):
        """Test fetching ICC complaints (requires auth)"""
        if not self.icc_admin_token:
            self.log_test("ICC Complaints Fetch", False, "No ICC admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.icc_admin_token}'}
        response = self.run_test(
            "ICC Complaints Fetch",
            "GET",
            "icc-complaints",
            200,
            headers=headers
        )
        
        return response is not None

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Test without token
        response = self.run_test(
            "Unauthorized Lab Complaints Access",
            "GET",
            "lab-complaints",
            401
        )
        
        # Test with wrong token type (ICC token for Lab endpoint)
        if self.icc_admin_token:
            headers = {'Authorization': f'Bearer {self.icc_admin_token}'}
            response = self.run_test(
                "Wrong Token Type Access (ICC token for Lab)",
                "GET",
                "lab-complaints",
                403,
                headers=headers
            )

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        self.run_test(
            "Invalid Lab Admin Login",
            "POST",
            "auth/lab-admin/login",
            401,
            data=invalid_data
        )
        
        self.run_test(
            "Invalid ICC Admin Login",
            "POST",
            "auth/icc-admin/login",
            401,
            data=invalid_data
        )

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Complaint Management System API Tests")
        print("=" * 60)
        
        # Test admin authentication
        print("\n📋 Testing Admin Authentication...")
        self.test_lab_admin_signup()
        self.test_lab_admin_login()
        self.test_icc_admin_signup()
        self.test_icc_admin_login()
        
        # Test invalid credentials
        print("\n🔒 Testing Security...")
        self.test_invalid_credentials()
        self.test_unauthorized_access()
        
        # Test complaint submissions
        print("\n📝 Testing Complaint Submissions...")
        self.test_lab_complaint_submission()
        self.test_icc_complaint_submission()
        
        # Test complaint fetching
        print("\n📊 Testing Complaint Management...")
        self.test_lab_complaints_fetch()
        self.test_icc_complaints_fetch()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed. Check details above.")
            return 1

def main():
    tester = ComplaintManagementTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())