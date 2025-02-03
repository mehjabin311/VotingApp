import { useState } from "react"
import { toast } from "react-toastify"
import { login } from "../services/user"
import { Link, useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaUserTag } from "react-icons/fa"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const nav = useNavigate()

  const onLogin = async (e) => {
    e.preventDefault()
    if (email.length === 0) {
      toast.warning("Please enter email address.")
    } else if (password.length === 0) {
      toast.warning("Please enter password.")
    } else {
      setIsLoading(true)
      const result = await login(email, password)
      console.log("Login API Response:", result)

      setIsLoading(false)
      if (result["status"] === "success") {
        const data = result["output"]
        const token = data["token"]
        const user = data["result"]
        const name = user["firstName"]
        const UID = user["id"]
        sessionStorage["token"] = token
        sessionStorage["name"] = name
        sessionStorage["uId"] = UID
        sessionStorage["role"] = user["role"]

        toast.success(`Welcome, ${name}`)
        if (user.role === "admin") {
          nav("/adminHome")
        } 
        else {
          nav("/voterHome")
        }
      } else {
        toast.error(result["error"])
      }
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Login</h2>
              <form onSubmit={onLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <FaUser className="me-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <FaLock className="me-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

