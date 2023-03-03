import { apiSlice } from "../../../app/api/apiSlice"

export const clientApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        unload: builder.mutation({
            query: fileModelView => ({
                url: '/Delete',
                method: 'POST',
                body:fileModelView
            })
        }),
        getClients: builder.mutation({
            query: clientSearchModelView => ({
                url: '/GetAllClients',
                method: 'POST',
                body:clientSearchModelView
            })
        }),
        getCompanies: builder.mutation({
            query: companySearchModelView => ({
                url: '/GetAllCompanies',
                method: 'POST',
                body:companySearchModelView
            })
        }),
        saveClient: builder.mutation({
            query: clientViewModel => ({
                url: '/AddClient',
                method: 'POST',
                body: clientViewModel 
            })
        }),
        updateClient: builder.mutation({
            query: clientViewModel => ({
                url: '/UpdateClient',
                method: 'POST',
                body: clientViewModel 
            })
        }),
        deleteClient: builder.mutation({
            query: clientViewModel => ({
                url: '/DeleteClient',
                method: 'POST',
                body: clientViewModel 
            })
        }),
    })
})

export const {
    useGetCompaniesMutation,
   useGetClientsMutation,
   useSaveClientMutation,
   useDeleteClientMutation,
   useUpdateClientMutation,
   useUnloadMutation,
} = clientApiSlice 