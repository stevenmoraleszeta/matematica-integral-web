// Note: Authentication requirement removed - project is now publicly accessible
// This project was paused over a year ago by the client academy due to resource issues
// and we have full permission to show or distribute it.

const RequireAuth = ({ children }) => {
    // Allow access without authentication - project is publicly accessible
    return children;
};

export default RequireAuth;
