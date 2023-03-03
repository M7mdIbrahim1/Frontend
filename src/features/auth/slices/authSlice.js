import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, roles: []/*, permissions: [] */},
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload
            console.log(action.payload)
            state.user = user
            state.token = token
            state.roles = getRoles(token)
            //state.permissions = getPermissions(token)
        },
        logOut: (state, action) => {
            state.user = null
            state.token = null
            state.roles = []
          //  state.permissions= []
        }
    },
})

const getRoles = (token) => {
    let jwtData = token.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData)

 let roles = []

 Object.keys(decodedJwtData).forEach( key => { 
  if(key.match(/.*role$/))
  { roles.push(decodedJwtData[key]) } 
}) 

return roles;


  
}

// const getPermissions = (token) => {
//     let jwtData = token.split('.')[1]
//     let decodedJwtJsonData = window.atob(jwtData)
//     let decodedJwtData = JSON.parse(decodedJwtJsonData)

//  let permissions = [] 



// Object.keys(decodedJwtData).forEach( key => { 
//     if(key.match(/.*permissions$/))
//     { permissions.push(decodedJwtData[key]) } 
//   }) 

//   return permissions;

  
// }

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectCurrentUserRoles = (state) => state.auth.roles[0] == 'User' ? ['User'] : state.auth.roles[0]
//export const selectCurrentUserPermissions = (state) => state.auth.permissions[0]