import base64 from 'base64-js';

const API_KEY = '6a474c9cf37f86c';
const API_SECRET = '550a817c8dd79ab';
const BASE_URL = 'http://127.0.0.1:8000/api/method/docgenie.utils.api_testing';

const getHeaders = () => {
  const credentials = `${API_KEY}:${API_SECRET}`;
  const encodedCredentials = btoa(credentials);
  
  return {
    'Authorization': `Basic ${encodedCredentials}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const fetchWithConfig = async (url: string, params?: any) => {
  const requestUrl = new URL(url);
  
  // Add any params to the URL if provided
  if (params) {
    Object.keys(params).forEach(key => {
      requestUrl.searchParams.append(key, params[key]);
    });
  }
  
  const response = await fetch(requestUrl.toString(), {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.message || [];
};

// POST request helper function
const postWithConfig = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.message || [];
};

export interface Department {
  dept_id: string;
  dept_name: string;
}

export interface Center {
  center_id: string;
  center_name: string;
}

export interface Doctor {
  doctor_id: string;
  doctor_name: string;
  dept_id: string;
  dept_name: string;
  center_id: string;
  center_name: string;
}

export interface AvailableSlots {
  return_code: string;
  error_text: string;
  avaiable_slots?: string[];
}

export interface AppointmentResponse {
  return_code: string;
  error_text: string;
  appointment_id?: string;
}

export const api = {
  getDepartments: async (): Promise<Department[]> => {
    return fetchWithConfig(`${BASE_URL}.get_unique_departments`);
  },

  getCenters: async (): Promise<Center[]> => {
    return fetchWithConfig(`${BASE_URL}.get_unique_centers`);
  },

  getDoctors: async (): Promise<Doctor[]> => {
    return fetchWithConfig(`${BASE_URL}.get_unique_doctor`);
  },

  getDoctorsByDepartment: async (deptId: string): Promise<Doctor[]> => {
    return fetchWithConfig(`${BASE_URL}.get_doctors_department`, { dept_id: deptId });
  },
  
  // Check available slots for a doctor
  checkAvailableSlots: async (doctorId: string): Promise<AvailableSlots> => {
    return fetchWithConfig(`${BASE_URL}.check_available_slots`, { doctor_id: doctorId });
  },
  
  // Save a new appointment
  saveAppointment: async (doctorId: string, appointmentSlot: string, centerId: string): Promise<AppointmentResponse> => {
    const params = {
      doctor_id: doctorId,
      appointment_slot: appointmentSlot,
      center_id: centerId
    };
    
    return postWithConfig(`${BASE_URL}.save_appointment`, params);
  },
  
  // Format ISO date string for appointment slot (helper method)
  formatAppointmentDateTime: (date: Date, timeStr: string): string => {
    // Format date to YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Parse time from "10:30 AM" format to 24-hour format
    let hours = parseInt(timeStr.split(':')[0]);
    const minutes = timeStr.split(':')[1].split(' ')[0];
    const period = timeStr.split(' ')[1];
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Format time as HH:MM:00
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    
    // Combine into ISO format
    return `${formattedDate}T${formattedTime}Z`;
  }
};


// python file from frappe

// import frappe
// import json
// import requests
// import time
// from requests.exceptions import RequestException, ConnectionError, Timeout, HTTPError
// from wn_customizations.tasks.insta_pt_visits import InstaAPI

// frappe.utils.logger.set_log_level("INFO")
// logger = frappe.logger("api_testing_insta", allow_site=True, file_count=20)

// BASE_URL = "https://api.instahealthsolutions.com/swasthhyderabad/api"
// MASTER_DATA_URL = f"{BASE_URL}/masterdata.json"
// AVAILALE_SLOTS_URL = f"{BASE_URL}/scheduler/availableslots.json"
// SAVE_APPOITMENT_URL = f"{BASE_URL}/scheduler/save.json"
// EDIT_APPOITMENT_URL = f"{BASE_URL}/scheduler/edit.json"

// # --- Token Management ---
// def get_request_handler_key_from_secret():
//     secret_doc = frappe.get_doc("Secrets", "Insta")
//     return secret_doc.host

// def update_request_handler_key_in_secret(new_key):
//     secret_doc = frappe.get_doc("Secrets", "Insta")
//     secret_doc.host = new_key
//     secret_doc.save(ignore_permissions=True)
//     frappe.db.commit()
//     logger.info(f"Updated new request handler key in Secret: {new_key}")

// def get_new_request_handler_key():
//     try:
//         insta_api = InstaAPI()
//         new_key = insta_api.request_handler
//         logger.info(f"Successfully generated new request handler key")
//         return new_key
//     except Exception as e:
//         logger.error(f"Error generating new request handler key: {str(e)}")
//         raise

// def check_connectivity(host="api.instahealthsolutions.com"):
//     """Check if the API host is reachable"""
//     try:
//         # Simple connectivity check
//         response = requests.head(f"https://{host}", timeout=5)
//         return True
//     except:
//         logger.error(f"Host {host} is not reachable")
//         return False

// def make_request_with_retries(url, params, max_retries=3, backoff_factor=1.5):
//     """Make API request with proper error handling and retries"""
//     def do_request(handler_key):
//         headers = {
//             "Content-Type": "application/json",
//             "request_handler_key": handler_key
//         }
//         logger.info(f"Making API request to {url} with params {params}")
//         response = requests.get(url, headers=headers, params=params)
//         logger.info(f"Request Status: {response.status_code}")
//         return response

//     # Check connectivity before proceeding
//     if not check_connectivity():
//         logger.error(f"Network connectivity issue detected. API host unreachable.")
//         return {"status": "error", "message": "Network connectivity issue. Cannot reach API host."}

//     retry_count = 0
//     current_key = get_request_handler_key_from_secret()
    
//     while retry_count < max_retries:
//         try:
//             response = do_request(current_key)
            
//             # Try to parse JSON response
//             try:
//                 parsed = response.json()
//             except Exception as e:
//                 logger.warning(f"Failed to parse response JSON: {str(e)}")
//                 parsed = {}
            
//             # Check for auth failure (token expired)
//             if response.status_code == 400 and parsed.get("return_code") == "1001":
//                 logger.warning("Request token invalid. Refreshing key and retrying...")
//                 new_key = get_new_request_handler_key()
//                 update_request_handler_key_in_secret(new_key)
//                 current_key = new_key
//                 # Don't increment retry_count for auth failures
//                 continue
                
//             # Handle other error responses
//             if response.status_code >= 400:
//                 logger.error(f"API error: Status {response.status_code}, Response: {response.text}")
//                 retry_count += 1
//                 wait_time = backoff_factor * (2 ** retry_count)
//                 logger.info(f"Retrying in {wait_time} seconds...")
//                 time.sleep(wait_time)
//                 continue
                
//             # Successful response
//             return response
                
//         except (ConnectionError, Timeout) as e:
//             logger.error(f"Network error on try {retry_count + 1}: {str(e)}")
//             # For connection errors, we might need a new handler key
//             if retry_count == 1:  # On second try, refresh the handler key
//                 try:
//                     logger.info("Connection error occurred, trying to refresh handler key")
//                     new_key = get_new_request_handler_key()
//                     update_request_handler_key_in_secret(new_key)
//                     current_key = new_key
//                 except Exception as refresh_error:
//                     logger.error(f"Failed to refresh handler key: {str(refresh_error)}")
            
//             retry_count += 1
//             if retry_count < max_retries:
//                 wait_time = backoff_factor * (2 ** retry_count)
//                 logger.info(f"Retrying in {wait_time} seconds...")
//                 time.sleep(wait_time)
//             else:
//                 logger.error(f"Max retries exceeded for {url}")
//                 return {"status": "error", "message": f"Failed after {max_retries} retries: {str(e)}"}
                
//         except Exception as e:
//             logger.error(f"Unexpected error: {str(e)}")
//             return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    
//     return {"status": "error", "message": f"Failed after {max_retries} retries"}

// # --- Master Data Fetch ---
// def get_master_data():
//     logger.info("Started function get_master_data")
//     params = {"status": "all"}
//     try:
//         logger.info(f"Making API call for Master Data")
//         response = make_request_with_retries(MASTER_DATA_URL, params)
        
//         # Handle case where response is already a dict (error case)
//         if isinstance(response, dict):
//             logger.error(f"Failed to get master data: {response.get('message')}")
//             return {"status": "error", "message": response.get('message'), 
//                     "hospital_departments": [], "hospital_center_master": [], "hospital_doctors": []}
            
//         try:
//             response_data = response.json()
//             logger.info(f"Master data API call successful")
//             return response_data
//         except Exception as e:
//             logger.error(f"Error parsing master data response: {str(e)}")
//             return {"status": "error", "message": "Failed to parse response", 
//                     "hospital_departments": [], "hospital_center_master": [], "hospital_doctors": []}
            
//     except Exception as e:
//         logger.error("Error in Master Data API Call: " + str(e))
//         return {"status": "error", "message": "Master Data Retrieval Failed",
//                 "hospital_departments": [], "hospital_center_master": [], "hospital_doctors": []}

// # --- 1. Get Unique Departments ---
// @frappe.whitelist()
// def get_unique_departments():
//     data = get_master_data()
//     departments = data.get("hospital_departments", [])
    
//     unique = [
//         {"dept_id": dept["dept_id"], "dept_name": dept["dept_name"]}
//         for dept in departments if dept.get("status") == "A"
//     ]
//     logger.info(f"Unique Departments: {unique}")
//     return unique

// # --- 2. Get Unique Centers ---
// @frappe.whitelist()
// def get_unique_centers():
//     data = get_master_data()
//     centers = data.get("hospital_center_master", [])
    
//     unique = [
//         {"center_id": center["center_id"], "center_name": center["center_name"]}
//         for center in centers if center.get("status") == "A"
//     ]
//     logger.info(f"Unique Centers: {unique}")
//     return unique

// # --- 3. Get Doctors by Center and Department ---
// @frappe.whitelist()
// def get_doctors_department(dept_id):
//     data = get_master_data()
//     doctors = data.get("hospital_doctors", [])
//     filtered = [
//         {
//             "doctor_id": doc["doctor_id"],
//             "doctor_name": doc["doctor_name"],
//             "dept_id": doc["dept_id"],
//             "center_id": doc["center_id"],
//             "specialization": doc["specialization"]
//         }
//         for doc in doctors
//         if doc.get("dept_id") == dept_id and doc.get("doctor_status") == "A"
//     ]
    
//     return filtered

// # --- 4. Get Doctor Details ---
// @frappe.whitelist()
// def get_unique_doctor():
//     data = get_master_data()
//     doctors = data.get("hospital_doctors", [])
//     departments = data.get("hospital_departments", [])
//     centers = data.get("hospital_center_master", [])
    
//     # Build lookup dictionaries for department and center names
//     dept_map = {d["dept_id"]: d["dept_name"] for d in departments}
//     center_map = {c["center_id"]: c["center_name"] for c in centers}
    
//     unique = [
//         {
//             "doctor_id": doc["doctor_id"],
//             "doctor_name": doc["doctor_name"],
//             "dept_id": doc["dept_id"],
//             "dept_name": dept_map.get(doc["dept_id"], "Unknown"),
//             "center_id": doc["center_id"],
//             "center_name": center_map.get(doc["center_id"], "Unknown")
//         }
//         for doc in doctors
//         if doc.get("doctor_status") == "A"
//     ]
//     logger.info(f"Unique Doctors with Dept and Center Info: {unique}")
//     return unique

// @frappe.whitelist()
// def check_available_slots(doctor_id):
//     params = {
//         "resource_id": doctor_id
//     }
//     response = make_request_with_retries(AVAILALE_SLOTS_URL, params)
    
//     # Handle case where response is already a dict (error case)
//     if isinstance(response, dict):
//         return {"return_code": "1", "error_text": response.get('message', "Error fetching slots"), "avaiable_slots": []}
        
//     response_data = response.json()
//     logger.info(f"Available Slots Response: {response_data}")
    
//     # Transform the data structure to match what the frontend expects
//     transformed_data = {
//         "return_code": "0",
//         "error_text": "",
//         "avaiable_slots": [slot["timeslot"] for slot in response_data.get("slots", [])]
//     }
    
//     return transformed_data

// @frappe.whitelist()
// def save_appoitment(doctor_id, appointment_slot, center_id, test=None):
//     params = {
//         "category": "DOC",
//         "primary_resource_id": doctor_id,
//         "appointment_slot": appointment_slot,
//         "center_id": center_id
//     }
//     response = make_request_with_retries(SAVE_APPOITMENT_URL, params)
    
//     # Handle case where response is already a dict (error case)
//     if isinstance(response, dict):
//         return {"return_code": "1", "error_text": response.get('message', "Error saving appointment")}
        
//     response_data = response.json()
//     logger.info(f"Save Appointment Response: {response_data}")
//     return response_data

