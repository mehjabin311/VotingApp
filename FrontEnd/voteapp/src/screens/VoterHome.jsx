import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaSignOutAlt, FaUserEdit, FaList, FaVoteYea, FaKey } from "react-icons/fa"
import { Modal, Button, Form } from "react-bootstrap"
import { getProfile, updateProfile, changePassword } from "../services/user"
import { toast } from "react-toastify"

function VoterHome() {
  const [voter, setVoter] = useState(null) // Store the initial voter data
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [updatedVoter, setUpdatedVoter] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Dob: "",
  })
  const [passwords, setPasswords] = useState({
    CurrentPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  })
  const nav = useNavigate()
  const fetchVoterInfo = async () => {
    const result = await getProfile()
    if (result.status === "success") {
      setVoter(result.data) // Store the original voter data
      setUpdatedVoter({
        FirstName: result.data.firstName,
        LastName: result.data.lastName,
        Email: result.data.email,
        Dob: result.data.dob,
      })
    } else {
      toast.error("Failed to fetch voter information")
      nav("/login")
    }
  }
  useEffect(() => {
    fetchVoterInfo()
  }, [nav])

  const onLogout = () => {
    sessionStorage.removeItem("name")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("uId")
    nav("/login")
  }

  const handleUpdateChange = (e) => {
    setUpdatedVoter({ ...updatedVoter, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await updateProfile(updatedVoter)
      if (result.status === "success") {
        await fetchVoterInfo();
        setShowUpdateModal(false)
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Error updating profile")
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.NewPassword !== passwords.ConfirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    try {
      const result = await changePassword(passwords.CurrentPassword, passwords.NewPassword)
      if (result.status === "success") {
        setShowPasswordModal(false)
        setPasswords({ CurrentPassword: "", NewPassword: "", ConfirmPassword: "" })
        toast.success("Password changed successfully")
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Error changing password")
    }
  }

  if (!voter) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h2 className="card-title mb-4">
                Welcome, {voter.firstName} {voter.lastName}
              </h2>
              {voter.status ? (
                <div>
                  <div className="display-1 text-success mb-4">
                    <FaVoteYea />
                  </div>
                  <p className="card-text mb-4 lead">You have already casted your vote!!</p>
                  <p className="card-text mb-4">Thank you for participating in the democratic process!</p>
                </div>
              ) : (
                <div>
                  <p className="card-text mb-4 lead">You haven't voted yet.</p>
                  <button
                    className="btn btn-primary btn-lg mb-3"
                    onClick={() => nav("/candidateList")}
                    disabled={voter.status}
                  >
                    <FaList className="me-2" />
                    View Candidates and Vote
                  </button>
                </div>
              )}
              <div className="mt-4">
                <button className="btn btn-secondary me-2" onClick={() => setShowUpdateModal(true)}>
                  <FaUserEdit className="me-2" />
                  Update Profile
                </button>
                <button className="btn btn-secondary me-2" onClick={() => setShowPasswordModal(true)}>
                  <FaKey className="me-2" />
                  Change Password
                </button>
                <button className="btn btn-danger" onClick={() => setShowLogoutModal(true)}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="FirstName"
                value={updatedVoter.FirstName} 
                onChange={handleUpdateChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="LastName"
                value={updatedVoter.LastName} 
                onChange={handleUpdateChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="Email"
                value={updatedVoter.Email} 
                onChange={handleUpdateChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="Dob"
                value={updatedVoter.Dob} 
                onChange={handleUpdateChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="CurrentPassword"
                value={passwords.CurrentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="NewPassword"
                value={passwords.NewPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="ConfirmPassword"
                value={passwords.ConfirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Change Password
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default VoterHome



