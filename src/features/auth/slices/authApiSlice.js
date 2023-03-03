import { apiSlice } from "../../../app/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/login',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        register: builder.mutation({
            query: userDetails => ({
                url: '/register',
                method: 'POST',
                body: { ...userDetails }
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: `/revoke`,
                method: 'POST',
                body: {} 
            })
        }),
        checkAuth: builder.mutation({
            query: () => ({
                url: '/check-auth',
                method: 'POST',
                body: {}
            })
        }),
    })
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useCheckAuthMutation
} = authApiSlice