import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { OtpTimeGuard } from './core/guards/otp.guard';
import { publicGuard } from './core/guards/public.guard';
import { HomeComponent } from './website-pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'en/home', pathMatch: 'full' },
  {
    path: ':lang',
    children: [
      {
        path: 'home',
        component: HomeComponent,
        data: {
          title: 'ROUTES.HOME.TITLE',
          description: 'ROUTES.HOME.DESCRIPTION',
        },
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./website-pages/auth/login/login.component').then(
            (c) => c.LoginComponent
          ),
        canActivate: [publicGuard],
        data: {
          title: 'ROUTES.LOGIN.TITLE',
          description: 'ROUTES.LOGIN.DESCRIPTION',
        },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./website-pages/auth/register/register.component').then(
            (c) => c.RegisterComponent
          ),
        canActivate: [publicGuard],
        data: {
          title: 'ROUTES.REGISTER.TITLE',
          description: 'ROUTES.REGISTER.DESCRIPTION',
        },
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import(
            './website-pages/auth/reset-password/reset-password.component'
          ).then((c) => c.ResetPasswordComponent),
        canActivate: [OtpTimeGuard],
        data: {
          title: 'ROUTES.RESET_PASSWORD.TITLE',
          description: 'ROUTES.RESET_PASSWORD.DESCRIPTION',
        },
      },
      {
        path: 'claims-info',
        loadComponent: () =>
          import('./website-pages/claims/claim-info/claim-info.component').then(
            (c) => c.ClaimInfoComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import(
            './website-pages/auth/forget-password/forget-password.component'
          ).then((c) => c.ForgetPasswordComponent),
        canActivate: [publicGuard],
        data: {
          title: 'ROUTES.FORGOT_PASSWORD.TITLE',
          description: 'ROUTES.FORGOT_PASSWORD.DESCRIPTION',
        },
      },
      {
        path: 'profile/edit-password',
        loadComponent: () =>
          import(
            './website-pages/auth/edit-password/edit-password.component'
          ).then((c) => c.EditPasswordPageComponent),
        canActivate: [authGuard],
        data: {
          title: 'ROUTES.EDIT_PASSWORD.TITLE',
          description: 'ROUTES.EDIT_PASSWORD.DESCRIPTION',
        },
      },
      {
        path: 'medical-insurance',
        loadComponent: () =>
          import(
            './website-pages/policies/medical-policy/medical-policy.component'
          ).then((c) => c.MedicalPolicyComponent),
        // data: {
        //   title: 'ROUTES.MEDICAL_INSURANCE.TITLE',
        //   description: 'ROUTES.MEDICAL_INSURANCE.DESCRIPTION'
        // },
      },
      {
        path: 'motor-insurance',
        loadComponent: () =>
          import(
            './website-pages/policies/motor-policy/motor-policy.component'
          ).then((c) => c.MotorPolicyComponent),
        // data: {
        //   title: 'ROUTES.MOTOR_INSURANCE.TITLE',
        //   description: 'ROUTES.MOTOR_INSURANCE.DESCRIPTION'
        // },
      },
      {
        path: 'claims',
        loadComponent: () =>
          import(
            './website-pages/profile/user-claims/user-claims.component'
          ).then((c) => c.UserClaimsComponent),
      },
      {
        path: 'claims/:claimId/:claimType/comments',
        loadComponent: () =>
          import(
            './website-pages/claims/claims-comments/claims-comments.component'
          ).then((c) => c.ClaimsCommentsComponent),
      },
      {
        path: 'building-insurance',
        loadComponent: () =>
          import(
            './website-pages/policies/building-policy/building-policy.component'
          ).then((c) => c.BuildingPolicyComponent),
        // data: {
        //   title: 'ROUTES.BUILDING_INSURANCE.TITLE',
        //   description: 'ROUTES.BUILDING_INSURANCE.DESCRIPTION'
        // },
      },
      {
        path: 'job-insurance',
        loadComponent: () =>
          import(
            './website-pages/policies/job-insurance/job-insurance.component'
          ).then((c) => c.JobInsuranceComponent),
        // data: {
        //   title: 'ROUTES.MEDICAL_INSURANCE.TITLE',
        //   description: 'ROUTES.MEDICAL_INSURANCE.DESCRIPTION'
        // },
      },

      // {
      //   path: 'job-insurance',
      //   loadComponent: () =>
      //     import(
      //       './website-pages/policies/medical-policy/medical-policy.component'
      //     ).then((c) => c.MedicalPolicyComponent),
      //   // data: {
      //   //   title: 'ROUTES.MEDICAL_INSURANCE.TITLE',
      //   //   description: 'ROUTES.MEDICAL_INSURANCE.DESCRIPTION'
      //   // },
      // },
      {
        path: 'profile',
        loadComponent: () =>
          import('./website-pages/profile/profile.component').then(
            (c) => c.ProfileComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'ROUTES.PROFILE.TITLE',
          description: 'ROUTES.PROFILE.DESCRIPTION',
        },
      },
      {
        path: 'contact',
        loadComponent: () =>
          import(
            './website-pages/contact/contact-page/contact-page.component'
          ).then((c) => c.ContactPageComponent),
        data: {
          title: 'ROUTES.CONTACT.TITLE',
          description: 'ROUTES.CONTACT.DESCRIPTION',
        },
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import(
            './website-pages/privacy-policy/privacy-policy.component'
          ).then((c) => c.PrivacyPolicyComponent),
        data: {
          title: 'ROUTES.PRIVACY_POLICY.TITLE',
          description: 'ROUTES.PRIVACY_POLICY.DESCRIPTION',
        },
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./website-pages/about/about/about.component').then(
            (c) => c.AboutComponent
          ),
        // data: {
        //   title: 'ROUTES.ABOUT.TITLE',
        //   description: 'ROUTES.ABOUT.DESCRIPTION'
        // },
      },
      {
        path: 'policies',
        loadComponent: () =>
          import(
            './website-pages/profile/user-policies/user-policies.component'
          ).then((c) => c.UserPoliciesComponent),
      },
      {
        path: 'policies/:policyId/:policyType',
        loadComponent: () =>
          import(
            './website-pages/claims/show-all-details/show-all-details.component'
          ).then((c) => c.ShowAllDetailsComponent),
      },
      {
        path: 'policies/:policyId/:policyType/comments',
        loadComponent: () =>
          import(
            './website-pages/comments/comments-page/comments-page.component'
          ).then((c) => c.CommentsPageComponent),
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import(
            './website-pages/blogs/blogs-details/blogs-details.component'
          ).then((c) => c.BlogPostComponent),
        data: {
          title: 'ROUTES.BLOG.TITLE',
          description: 'ROUTES.BLOG.DESCRIPTION',
        },
      },
      {
        path: 'english-blogs',
        loadComponent: () =>
          import(
            './website-pages/blogs/english-blogs/english-blogs.component'
          ).then((c) => c.EnglishBlogsComponent),
        data: {
          title: 'ROUTES.ENGLISH_BLOGS.TITLE',
          description: 'ROUTES.ENGLISH_BLOGS.DESCRIPTION',
        },
      },
      {
        path: 'arabic-blogs',
        loadComponent: () =>
          import(
            './website-pages/blogs/arabic-blogs/arabic-blogs.component'
          ).then((c) => c.ArabicBlogsComponent),
        data: {
          title: 'ROUTES.ARABIC_BLOGS.TITLE',
          description: 'ROUTES.ARABIC_BLOGS.DESCRIPTION',
        },
      },
      {
        path: 'logout',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
