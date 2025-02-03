import axios from "axios";

export async function getCandidateList() {
  try {
    const url = "http://localhost:5001/Candidate/getCandidateList";
    const token = sessionStorage.getItem("token");
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`, // Correct header format
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (ex) {
    return { status: "error", error: ex };
  }
}

export async function addCandidate(candidate) {
  try {
    const url = "http://localhost:5001/Candidate/addCandidate";
    const token = sessionStorage.getItem("token");
    const response = await axios.post(url, candidate, {
      headers: {
        Authorization: `Bearer ${token}`, // Correct header format
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (e) {
    return { status: "error", error: e };
  }
}

export async function deleteCandidate(id) {
  try {
    const url = `http://localhost:5001/Candidate/deleteCandidate/${id}`;
    const token = sessionStorage.getItem("token");
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`, // Correct header format
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (e) {
    return { status: "error", error: e };
  }
}

export async function casteVote(id) {
  try {
    const url = `http://localhost:5001/Candidate/update-vote/${id}`;
    const token = sessionStorage.getItem("token");
    const response = await axios.patch(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Correct header format
          'Content-Type': 'application/json'
        }
      }
    );
    return { status: "success", data: response.data };
  } catch (e) {
    return { status: "error", error: e };
  }
}

export async function topThreeCandidates() {
  try {
    const url = "http://localhost:5001/Candidate/top-three";
    const token = sessionStorage.getItem("token");
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`, // Correct header format
        'Content-Type': 'application/json'
      }
    });
    return { status: "success", data: response.data };
  } catch (ex) {
    return { status: "error", error: ex };
  }
}
