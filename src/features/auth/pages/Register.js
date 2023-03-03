import React from 'react'
import logo from '../../../assets/logo.png'

import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from "react-redux"
import { selectCurrentToken } from "../slices/authSlice"

import { useDispatch } from 'react-redux'
import { setCredentials } from '../slices/authSlice'
import { useRegisterMutation,useLoginMutation } from '../slices/authApiSlice'

const Register = () => {
 

  const emailRef = useRef()
  const errRef = useRef()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [rePwd, setRePwd] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const navigate = useNavigate()

  const token = useSelector(selectCurrentToken)

  const [register, { isLoading }] = useRegisterMutation()
  const [login] = useLoginMutation()
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
  }, [email, pwd,rePwd,lastName,firstName])

  const validate = () => {
    
    let isValid = true;

    if (pwd !== "undefined") {
          
      var pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
      if (!pattern.test(pwd)) {
        isValid = false;
        setErrMsg("Password is not strong enough. Password must be 8 charahters long or more with at least one upper case letter and one special character"); 
      }
    }
    
    if (typeof pwd !== "undefined" && rePwd !== "undefined") {
        
      if (pwd != rePwd) {
        isValid = false;
        setErrMsg("Passwords don't match."); 
      }
    } 

    return isValid;
}

  const handleSubmit = async (e) => {
  e.preventDefault()

  if(validate()){
  try {
      const regData = await register({ Username:`${firstName}.${lastName}`, Email:email, Password:pwd }).unwrap()

      if (regData){
      const userData = await login({ Email:email, Password:pwd }).unwrap()
      dispatch(setCredentials({ ...userData, email }))
     // console.log(userData)
      }
      
      
      setEmail('')
      setPwd('')
      setRePwd('')
      setLastName('')
      setFirstName('')
      navigate('/')
  } catch (err) {
      if (!err?.originalStatus) {
          // isLoading: true until timeout occurs
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
}

  const handleEmailInput = (e) => setEmail(e.target.value)

  const handlePwdInput = (e) => setPwd(e.target.value)

  const handleRePwdInput = (e) => setRePwd(e.target.value)

  const handleFirstNameInput = (e) => setFirstName(e.target.value)

  const handleLastNameInput = (e) => setLastName(e.target.value)

const content = isLoading ? <h1>Loading...</h1> : (
  
  <div className="auth-wrapper">
     <div className="auth-inner">
<section>
  <h3> <img src={logo} alt="Logo" style={{ height: 60, width: 160}} /></h3>
<form onSubmit={handleSubmit}>

    <div className="mb-3">
      <label>First name</label>
      <input
        type="text"
        className="form-control"
        placeholder="First name"
        id="firstName"
        value={firstName}
        onChange={handleFirstNameInput}
        autoComplete="off"
        required
      />
    </div>
    <div className="mb-3">
      <label>Last name</label>
      <input type="text" 
      className="form-control" 
      placeholder="Last name" 
      id="lastName"
        value={lastName}
        onChange={handleLastNameInput}
        autoComplete="off"
        required
      />
    </div>
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
        className="form-control"
        placeholder="Enter password"
        id="password"
        value={pwd}
        onChange={handlePwdInput}
        autoComplete="off"
        required
      />
    </div>
    <div className="mb-3">
      <label>Repassword</label>
      <input
        type="password"
        className="form-control"
        placeholder="Re-enter password"
        id="rePassword"
        value={rePwd}
        onChange={handleRePwdInput}
        autoComplete="off"
        required

      />
    </div>
    <p style={{color:'red'}} ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
    <div className="d-grid">
      <button type="submit" className="btn btn-primary">
        Sign Up
      </button>
    </div>
    <p className="forgot-password text-right">
      Already registered <a href="/login">Sign in?</a>
    </p>
    </form>
  </section>
  </div></div>
)

  return  content
}

export default Register