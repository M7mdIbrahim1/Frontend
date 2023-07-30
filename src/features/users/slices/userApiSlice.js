import { apiSlice } from "../../../app/api/apiSlice"

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // getUsers: builder.query({
        //     query: () => '/get-all-users',
        //     keepUnusedDataFor: 5,
        // })
        getUsers: builder.mutation({
            query: userSearchModelView => ({
                url: '/get-all-users',
                method: 'POST',
                body: userSearchModelView 
            })
        }),
        assignCompanyToUsers: builder.mutation({
            query: userCompanyViewModel => ({
                url: '/assign-company-to-users',
                method: 'POST',
                body: userCompanyViewModel 
            })
        }),
        assignRolesToUsers: builder.mutation({
            query: userRolesViewModel => ({
                url: '/assign-roles',
                method: 'POST',
                body: userRolesViewModel 
            })
        }),
        getCompanies: builder.mutation({
            query: companySearchViewModel => ({
                url: '/GetAllCompanies',
                method: 'POST',
                body:companySearchViewModel
            })
        }),
        editUser: builder.mutation({
            query: userViewModel => ({
                url: '/EditUser',
                method: 'POST',
                body: userViewModel 
            })
        }),
        getRoles: builder.mutation({
            query: () => ({
                url: '/get-all-roles',
                method: 'GET'
            })
        }),
        importOpportunities: builder.mutation({
            query: opportunitiesModelView => ({
                url: '/ImportOpportunities',
                method: 'POST',
                body:opportunitiesModelView
            })
        }),
        importCompanies: builder.mutation({
            query: companiesModelView => ({
                url: '/Company/ImportCompanies',
                method: 'POST',
                body:companiesModelView
            })
        }),
        importProjects: builder.mutation({
            query: projectsModelView => ({
                url: '/ImportProjects',
                method: 'POST',
                body:projectsModelView
            })
        }),
        // ,builder.query({
        //     query: () => '/get-all-roles',
        //     keepUnusedDataFor: 5,
        // }),
    })
})

export const {
    useGetUsersMutation,
   useGetCompaniesMutation,
   useGetRolesMutation,
   useEditUserMutation,
   useAssignCompanyToUsersMutation,
   useAssignRolesToUsersMutation,
   useImportOpportunitiesMutation,
   useImportProjectsMutation,
   useImportCompaniesMutation
} = userApiSlice 