
import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'


import { useDispatch } from 'react-redux'
import { setCredentials } from '../slices/authSlice'
import { useLoginMutation } from '../slices/authApiSlice'

import { useSelector } from "react-redux"
import { selectCurrentToken } from "../slices/authSlice"

import logo from '../../../assets/logo.png'

const Login = () => {
 

    const emailRef = useRef()
    const errRef = useRef()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const navigate = useNavigate()

    const token = useSelector(selectCurrentToken)

    const [login, { isLoading }] = useLoginMutation()
    const dispatch = useDispatch()

    useEffect(() => {
      if(token){
        navigate('/')
      }else{
      emailRef.current.focus()
      }
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [email, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const userData = await login({ Email:email, Password:pwd }).unwrap()
            dispatch(setCredentials({ ...userData, email }))
            setEmail('')
            setPwd('')
            navigate('/')
        } catch (err) {
            if (!err?.originalStatus) {
                // isLoading: true until timeout occurs
                console.log(err)
                setErrMsg('No Server Response');
            } else if (err.originalStatus === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.originalStatus === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    const handleEmailInput = (e) => setEmail(e.target.value)

    const handlePwdInput = (e) => setPwd(e.target.value)

    const content = isLoading ? <h1>Loading...</h1> : (
   
      <div className="auth-wrapper">
         <div className="auth-inner">
      <section>
        <h3> <img src={logo} alt="Logo" style={{ height: 60, width: 150}} /></h3>
      <form onSubmit={handleSubmit}>
      
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            id="email"
            ref={emailRef}
            value={email}
            onChange={handleEmailInput}
            autoComplete="off"
            required
            className="form-control"
            placeholder="Enter email"
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
             type="password"
             id="password"
             onChange={handlePwdInput}
             value={pwd}
             required
             className="form-control"
             placeholder="Enter password"
          />
        </div>
        <div className="mb-3">
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customCheck1"
            />
            <label className="custom-control-label" htmlFor="customCheck1">
              Remember me
            </label>
          </div>
        </div>
        <p style={{color:'red'}} ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
        <p className="forgot-password text-right">
          Don't have an account <a href="/Register">Sign up?</a>
        </p>
      </form>
  </section>
  </div></div>
    )

    return content
}
export default Login