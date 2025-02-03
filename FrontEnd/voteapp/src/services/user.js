import axios from "axios"

export async function register(FirstName,LastName,Email,Password,Dob) {
  try {
    const url = "http://localhost:5001/User/register"
    const body = {
      FirstName,
      LastName,
      Email,
      Password,
      Dob,
      Status : 0,
      Role: "voter",
    }
    const response = await axios.post(url, body)
    return {status: 'success', data: response.data}
  } catch (ex) {
    return { status: "error", error: ex.message }
  }
}

export async function login(Email, Password) {
  try {
    const url = "http://localhost:5001/User/login"
    const body = {
      Email,
      Password,
    }

    const response = await axios.post(url, body)
    return {status: 'success', output: response.data}
  } catch (ex) {
    return { status: "error", error: ex.message }
  }
}

export async function updateStatus(uid) {
  try {
    const url = "http://localhost:5001/User/update-status/" + uid
    const token = sessionStorage.getItem("token")
    const response = await axios.patch(url, {}, { headers: { token: token } })
    return {status: 'success', data: response.data}
  } catch (e) {
    return { status: "error", error: e.message }
  }
}

export async function getProfile() {
  try {
    const url = "http://localhost:5001/User/info";
    const token = sessionStorage.getItem("token");
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (e) {
    return { status: "error", error: e.message };
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const url = "http://localhost:5001/User/change-password";
    const token = sessionStorage.getItem("token");
    const body = {
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
    };
    const response = await axios.put(url, body, {
      headers: {
        Authorization: `Bearer ${token}`, // Correct header format
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (e) {
    return { status: "error", error: e.message };
  }
}


export async function updateProfile(profileData) {
  try {
    const url = "http://localhost:5001/User/update-profile";
    const token = sessionStorage.getItem("token");
    const response = await axios.put(url, profileData, {
      headers: {
        Authorization: `Bearer ${token}`, // Correct header format
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (e) {
    return { status: "error", error: e.message };
  }
}