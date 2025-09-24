export const API_CONFIG = {
    BASE_URL: 'https://digitalbondmena.com/insurance/api/',
    BASE_URL_IMAGE: 'https://digitalbondmena.com/insurance/',
    firebaseConfig : {
  apiKey: "AIzaSyDF96TX2OIZWUVdTSSLfHPu0i3kcQd1Ihg",
  authDomain: "capital-insurance-8134f.firebaseapp.com",
  projectId: "capital-insurance-8134f",
  storageBucket: "capital-insurance-8134f.firebasestorage.app",
  messagingSenderId: "777493807523",
  appId: "1:777493807523:web:c94ea5be218a0fc5d2da16",
  measurementId: "G-HPXEWYSW8Z"
},
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
      UPDATE_USER_DATA:'auth/update-data',
      REGISTER: 'auth/signup',
      LOGIN: 'auth/signin',
      SET_PASS:"auth/create-password",
      LOGIN_GOOGLE: 'auth/signinGoogle',
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
  