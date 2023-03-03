import React from 'react'
import Nav from './Nav'
import { logOut, selectCurrentUser } from '../features/auth/slices/authSlice'
import { useLogoutMutation } from '../features/auth/slices/authApiSlice'
import { useDispatch } from 'react-redux'

import { useSelector } from "react-redux"
import { Avatar } from 'antd';
import logo from '../assets/logo.png'





function Header({darkTheme, setDarkTheme}) {


  const user = useSelector(selectCurrentUser);

  const [logout, { isLoading }] = useLogoutMutation();

  const changeTheme  = async (e) => {
    e.preventDefault();
    setDarkTheme(!darkTheme)
  }

  const dispatch = useDispatch()

  const handleLogout = async (e) => {
    e.preventDefault()

    try {
        const userData = await logout().unwrap()
        dispatch(logOut())
        //navigate('/')
    } catch (err) {
        if (!err?.originalStatus) {
            // isLoading: true until timeout occurs
            console.log(err)
           // setErrMsg('No Server Response');
        } else if (err.originalStatus === 400) {
          console.log('Missing Username or Password');
           // setErrMsg('Missing Username or Password');
        } else if (err.originalStatus === 401) {
          console.log('Unauthorized');
           // setErrMsg('Unauthorized');
        } else {
          console.log('Logout Failed');
           // setErrMsg('Login Failed');
        }
        // errRef.current.focus();
    }
}
  return (
    <header>
  {/* <Nav/> */}
    <nav id="main-navbar"  className="navbar navbar-expand-lg navbar-light fixed-top  ">
              <div className="container-fluid">
            
              <div className="logo" ><img src={logo} alt="Logo" style={{marginLeft:2, marginTop:0,height: 35, width: 140}} /></div> 
               
              {/* <button className="navbar-toggler d-block" type="button" data-mdb-toggle="collapse" data-mdb-target="#sidebarMenu"
                  aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation" onClick={handleClick}>
                  <i className="fas fa-bars"></i>
                </button> */}

                {/* <form className="d-none d-md-flex input-group w-auto my-auto">
                  <input autoComplete="off" type="search" className="form-control rounded"
                    placeholder='Search for something'  />
                  <span className="input-group-text border-0"><i className="fas fa-search"></i></span>
                </form>  */}
               
                {/* <a className="navbar-brand" href="#">
                 
                    <img src={logo} alt="Logo" style={{ height: 35, width: 130}} />
                </a> */}

              


                <ul className="navbar-nav ms-auto d-flex flex-row">

                  <li className="nav-item dropdown">
                    <a className="nav-link me-3 me-lg-0 dropdown-toggle arrow" href="#" id="navbarDropdownMenuLink"
                      role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                      <i className="fas fa-bell"></i>
                      <span className="badge rounded-pill badge-notification bg-danger">1</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                      <li>
                        <a className="dropdown-item" href="#">Some news</a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">Another news</a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">Something else here</a>
                      </li>
                    </ul>
                  </li>

        
                  

          
                  <li className="nav-item dropdown">
                    <a className="nav-link me-3 me-lg-0 dropdown-toggle arrow" href="#" id="navbarDropdown"
                      role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                      <i className="flag-uk flag m-0"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                      <li>
                        <a className="dropdown-item" href="#"><i className="flag-uk flag"></i>English
                          <i className="fa fa-check text-success ms-2"></i></a>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <a className="dropdown-item" href="#"><i className="flag-egypt flag"></i>Arabic</a>
                      </li>
                    </ul>
                  </li> 

                  <li className="nav-item dropdown">
                    <a className="nav-link me-3 me-lg-0 dropdown-toggle arrow" href="#" id="navbarDropdown"
                      role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                      <i className="fas fa-palette"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                     
                      <li>
                      <a className="dropdown-item" href="#" onClick={changeTheme}>{!darkTheme?(<i className="fas fa-moon">dark</i>) : (<i className="fas fa-sun">light</i>)}</a>
                      </li>
                    </ul>
                  </li> 

                 
                 

           
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle arrow d-flex align-items-center" href="#"
                      id="navbarDropdownMenuLink" role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                       <Avatar src="https://joeschmoe.io/api/v1/random" size={25} />
                       {/* <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img (31).webp" className="rounded-circle"
                        height="22" alt="Avatar" loading="lazy" />  */}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                      <li>
                        <a className="dropdown-item" href="#">My profile</a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">Settings</a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/login" onClick={handleLogout}>Logout</a>
                      </li>
                    </ul>
                  </li>

                 
                </ul>
                 
              </div>
         
            </nav>
            
            </header>
            
          
            
  )
}

export default Header