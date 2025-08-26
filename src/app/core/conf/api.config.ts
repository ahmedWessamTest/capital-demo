export const API_CONFIG = {
    BASE_URL: 'https://digitalbondmena.com/insurance/api/',
    BASE_URL_IMAGE: 'https://digitalbondmena.com/insurance/',
  
    HOME: {
      GET: 'home',
    },
  
 
  
    CATEGORY: {
      GET_ALL: 'menu/category',
    },
  
    BLOG: {
      GET_ALL: 'blogs',
      GET_SINGLE: 'blogs/ar-blog-title',
    },
  
    STATIC_PAGES: {
      ABOUT_US: 'home/about-us',
      CONTACT_US: 'home/contact-us',
    },
  
    AUTH: {
      REGISTER: 'auth/signup',
      LOGIN: 'auth/signin',
      FORGET_PASSWORD: 'auth/resetUserCode',
      RESET_PASSWORD: 'auth/resetUserPassword',
    },
  

  
    USER_MANAGEMENT: {
      GET_USER_INFO: 'users',
      GET_USER_ORDERS: 'users/showOrders',
      /* Pending */
      GET_USER_LAST_ORDER: 'users/userneworders',
      GET_USER_ORDER: 'users/order',
      ADD_NEW_ADDRESS: 'users/addNewAddress',
      DEACTIVATE_USER: 'users/deactiveuser/',
      DELETE_USER: 'users/deleteuser/',
      LOCATION: 'menu/locations',
      UPDATE_USER_INFO: 'updateprofile',
      SHOW_ORDERS: 'users/showOrders',
    },
  
  
  };
  