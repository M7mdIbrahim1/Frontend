import { useLocation, Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectCurrentToken, selectCurrentUserRoles /*, selectCurrentUserPermissions */} from "../slices/authSlice"


const RequireAuth = ({ allowedRoles /*, allowedPermissions*/ }) => {
    const token = useSelector(selectCurrentToken)
    const location = useLocation()

    const roles = useSelector(selectCurrentUserRoles);
    //const permissions = useSelector(selectCurrentUserPermissions);
  
  

    return (
            roles?.find(role => allowedRoles?.includes(role)) //|| permissions?.find(permission => allowedPermissions?.includes(permission))
            ? <Outlet />
            : token
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    )
}
export default RequireAuth