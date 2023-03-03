import { apiSlice } from "../../../app/api/apiSlice"

export const companyApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        unload: builder.mutation({
            query: fileModelView => ({
                url: '/Delete',
                method: 'POST',
                body:fileModelView
            })
        }),
        getCompanies: builder.mutation({
            query: companySearchModelView => ({
                url: '/Company/GetCompanies',
                method: 'POST',
                body:companySearchModelView
            })
        }),
        getAdminUsers: builder.mutation({
            query: () => ({
                url: '/get-admin-users',
                method: 'GET'
            })
        }),
        saveCompany: builder.mutation({
            query: companyViewModel => ({
                url: '/Company/AddCompany',
                method: 'POST',
                body: companyViewModel 
            })
        }),
        updateCompany: builder.mutation({
            query: companyViewModel => ({
                url: '/Company/UpdateCompany',
                method: 'POST',
                body: companyViewModel 
            })
        }),
        deleteCompany: builder.mutation({
            query: companyViewModel => ({
                url: '/Company/DeleteCompany',
                method: 'POST',
                body: companyViewModel 
            })
        }),
    })
})

export const {
   useGetAdminUsersMutation,
   useGetCompaniesMutation,
   useSaveCompanyMutation,
   useDeleteCompanyMutation,
   useUpdateCompanyMutation,
   useUnloadMutation
} = companyApiSlice 