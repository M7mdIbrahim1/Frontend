import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut } from '../../features/auth/slices/authSlice'
import { selectCurrentToken} from "../../features/auth/slices/authSlice"

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://3.75.83.162/api',
  // baseUrl: 'https://leveragefc-backend.onrender.com',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
       
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
            
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
   // const token = useSelector(selectCurrentToken);
    let result = await baseQuery(args, api, extraOptions)
    console.log("refresh")
    console.log(result)
    if (result?.error?.status === 401) {
        console.log('sending refresh token')
        // send refresh token to get new access token 
        const token = api.getState().auth.token
        const refreshResult = await baseQuery({url: '/refresh-token', method: 'POST', body:{AccessToken: token}}, api, extraOptions)
        console.log(refreshResult)
        if (refreshResult?.data) {
            const user = api.getState().auth.user
            // store the new token 
            api.dispatch(setCredentials({ ...refreshResult.data, user }))
            // retry the original query with new access token 
            result = await baseQuery(args, api, extraOptions)
        } else {
            console.log("logout")
            api.dispatch(logOut())
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({})
})