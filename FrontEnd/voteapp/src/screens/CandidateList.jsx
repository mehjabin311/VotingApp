import { useEffect, useState } from "react"
import { casteVote, getCandidateList } from "../services/candidate"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { updateStatus } from "../services/user"
import { FaVoteYea, FaUserTie } from "react-icons/fa"

function CandidateList() {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const nav = useNavigate()

  const onLoadCandidateList = async () => {
    const result = await getCandidateList()
    if (result.status === "success") {
      setItems(result.data)
    } else {
      toast.error(result.error)
    }
  }

  const statusUpdate = async (userId) => {
    const result = await updateStatus(userId)
    if (result.status === "success") {
      toast.success("Status updated successfully.")
    } else {
      toast.error(result.error)
    }
  }

  const onVoteCast = async () => {
    if (selectedCandidate) {
      const result = await casteVote(selectedCandidate.id)
      if (result.status === "success") {
        const userId = sessionStorage.getItem("uId")
        if (userId) {
          await statusUpdate(userId)
          toast.success("Vote cast successfully!")
          nav("/voterHome")
        } else {
          toast.error("User ID not found in session storage.")
        }
      } else {
        toast.error(result.error)
      }
    }
    setShowModal(false)
  }

  const handleVoteClick = (candidate) => {
    setSelectedCandidate(candidate)
    setShowModal(true)
  }

  useEffect(() => {
    onLoadCandidateList()
  }, []) //Fixed useEffect dependency

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Candidate List</h2>
      <div className="row">
        {items.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card shadow h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  <FaUserTie className="me-2" />
                  {item.name}
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">{item.party}</h6>
                {/* <p className="card-text flex-grow-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet.
                </p> */}
                <button className="btn btn-primary mt-auto" onClick={() => handleVoteClick(item)}>
                  <FaVoteYea className="me-2" />
                  Vote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Your Vote</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to vote for {selectedCandidate?.name} from {selectedCandidate?.party}?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={onVoteCast}>
                  Confirm Vote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateList

