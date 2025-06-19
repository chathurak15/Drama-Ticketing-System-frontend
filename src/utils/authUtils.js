
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    return user;
  },

  // Get current user data
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get current user role
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  // Check if user has specific role
  hasRole: (requiredRole) => {
    const userRole = authUtils.getUserRole();
    return userRole?.toLowerCase() === requiredRole.toLowerCase();
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = authUtils.getUserRole();
    return roles.some(role => role.toLowerCase() === userRole?.toLowerCase());
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  },

  // Get dashboard route for current user
  getDashboardRoute: (userRole = null) => {
    const role = userRole || authUtils.getUserRole();
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin-dashboard';
      case 'theater manager':
      case 'theater_manager':
      case 'theatermanager':
        return '/theater-manager-dashboard';
      case 'organizer':
        return '/organizer-dashboard';
      case 'user':
      default:
        return '/user-dashboard';
    }
  },

  // Redirect to appropriate dashboard
  redirectToDashboard: (userRole = null) => {
    const route = authUtils.getDashboardRoute(userRole);
    window.location.href = route;
  }
};