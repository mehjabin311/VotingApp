import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getCandidateList, topThreeCandidates, addCandidate, deleteCandidate } from "../services/candidate"
import { toast } from "react-toastify"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { FaSignOutAlt, FaChartPie, FaList, FaUsers, FaPlus, FaTrash } from "react-icons/fa"
import { Modal, Button, Form } from "react-bootstrap"

ChartJS.register(ArcElement, Tooltip, Legend)

function AdminHome() {
  const [items, setItems] = useState([])
  const [topItems, setTopItems] = useState([])
  const [partyData, setPartyData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false) 
  const nav = useNavigate()

  const onLoadCandidateList = useCallback(async () => {
    const result = await getCandidateList()
    if (result.status === "success") {
      setItems(result.data)
      processPartyData(result.data)
    } else {
      toast.error(result.error)
    }
  }, [])

  const onLoadTopCandidateList = useCallback(async () => {
    const result = await topThreeCandidates()
    if (result.status === "success") {
      setTopItems(result.data)
    } else {
      toast.error(result.error)
    }
  }, [])

  const processPartyData = useCallback((candidates) => {
    const partyVotes = {}
    candidates.forEach((candidate) => {
      if (partyVotes[candidate.party]) {
        partyVotes[candidate.party] += candidate.votes
      } else {
        partyVotes[candidate.party] = candidate.votes
      }
    })
    setPartyData(partyVotes)
  }, [])

  const onLogout = useCallback(() => {
    setShowLogoutModal(true) 
  }, [])

  const handleAddCandidate = async (e) => {
    e.preventDefault()
    if (!newCandidate.name || !newCandidate.party) {
      toast.error("Please fill in all fields")
      return
    }
    const result = await addCandidate(newCandidate)
    if (result.status === "success") {
      toast.success("Candidate added successfully")
      setShowAddModal(false)
      setNewCandidate({ name: '', party: '' })
      onLoadCandidateList()
      onLoadTopCandidateList()
    } else {
      toast.error(result.error)
    }
  }

  const handleDeleteCandidate = async () => {
    if (candidateToDelete) {
      const result = await deleteCandidate(candidateToDelete.id)
      if (result.status === "success") {
        toast.success("Candidate deleted successfully")
        setShowDeleteModal(false)
        setCandidateToDelete(null)
        onLoadCandidateList()
        onLoadTopCandidateList()
      } else {
        toast.error(result.error)
      }
    }
  }

  useEffect(() => {
    onLoadCandidateList()
    onLoadTopCandidateList()
  }, [onLoadCandidateList, onLoadTopCandidateList])

  
  const chartData = {
    labels: Object.keys(partyData),
    datasets: [
      {
        data: Object.values(partyData),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1.5,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Partywise Vote Distribution",
      },
    },
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="btn btn-primary me-2" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" />
            Add Candidate
          </button>
          <button className="btn btn-danger" onClick={onLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="row mb-4">
        {/* Left Column for Tables */}
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-body">
              <h3 className="card-title mb-3">
                <FaList className="me-2" />
                Top-3 Candidates
              </h3>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Party</th>
                      <th>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.party}</td>
                        <td>{item.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* All Candidates Table */}
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title mb-3">
                <FaUsers className="me-2" />
                All Candidates
              </h3>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Party</th>
                      <th>Votes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.party}</td>
                        <td>{item.votes}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setCandidateToDelete(item)
                              setShowDeleteModal(true)
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column for Pie Chart */}
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title mb-3">
                <FaChartPie className="me-2" />
                Partywise Vote Analysis
              </h3>
              <div style={{ width: "100%", height: "300px", margin: "0 auto" }}>
                {Object.keys(partyData).length > 0 ? (
                  <Pie data={chartData} options={chartOptions} />
                ) : (
                  <p>No data available for the chart.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Candidate</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCandidate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter candidate name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Party</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter party name"
                value={newCandidate.party}
                onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Add Candidate
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the candidate: {candidateToDelete?.name}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCandidate}>
            Delete
          </Button>
        </Modal.Footer>
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
          <Button
            variant="danger"
            onClick={() => {
              sessionStorage.removeItem("name")
              sessionStorage.removeItem("token")
              sessionStorage.removeItem("uId")
              nav("/login")
              setShowLogoutModal(false) 
            }}
          >
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminHome
