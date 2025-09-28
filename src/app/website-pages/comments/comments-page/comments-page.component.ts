import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { API_CONFIG } from '@core/conf/api.config';
import { AuthStorageService } from '@core/services/auth/auth-storage.service';
import { LanguageService } from '@core/services/language.service';
import {
  CreatePolicyCommentPayload,
  PoliciesService,
  PolicyComment,
  PolicyCommentsResponse,
} from '@core/services/profile/user-policies.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Comment {
  id: number;
  sender: string;
  date: string;
  message: string;
  role: 'user' | 'admin';
  fileUrl?: string | null;
}

@Component({
  selector: 'app-comments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './comments-page.component.html',
  styleUrls: ['./comments-page.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CommentsPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private policiesService = inject(PoliciesService);
  private fb = inject(FormBuilder);
  private languageService = inject(LanguageService);
  private authStorage = inject(AuthStorageService);
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

  @ViewChild('commentsContainer') commentsContainer!: ElementRef;

  policyId: number | null = null;
  policyType: 'medical' | 'motor' | 'building' | 'jop' | null = null;
  comments: Comment[] = [];
  commentForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  currentLang$ = this.languageService.currentLanguage$;
  isRTL = false;
  selectedFiles: File[] = [];
  filePreviewUrls: { [key: string]: string } = {};
  canComment = false;
  receiver: { id: number; role: string; name: string } | null = null;
  API_CONFIG = API_CONFIG;

  constructor() {
    this.commentForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    this.currentLang$.subscribe((lang) => {
      this.isRTL = lang === 'ar';
      console.log("direction:",this.isRTL);
      
      console.log('Current Language:', lang); // Debug: Log language changes
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('policyId');
      const type = params.get('policyType') as
        | 'medical'
        | 'motor'
        | 'building'
        | 'jop'
        | null;
      if (
        id &&
        type &&
        ['medical', 'motor', 'building', 'jop'].includes(type)
      ) {
        this.policyId = +id;
        this.policyType = type;
        this.fetchComments();
      } else {
        this.error = this.translate.instant(
          'pages.comments.errors.invalid_policy'
        );
        this.isLoading = false;
      }
    });
  }

  fetchComments() {
    if (!this.policyId || !this.policyType) return;

    this.policiesService
      .getPolicyWithComments(this.policyId, this.policyType)
      .subscribe({
        next: (response: PolicyCommentsResponse) => {
          this.comments = response.policy.comments.map(
            (comment: PolicyComment) => ({
              id: comment.id,
              sender: comment.user_name, // Assuming user_name is not translated
              date: this.formatDate(comment.comment_date),
              message: comment.comment, // Assuming comment is not translated
              role: comment.user_role as 'user' | 'admin',
              fileUrl: comment.comment_file,
            })
          );
          this.canComment =
            response.policy.active_status === 'pending' &&
            response.policy.comments.length > 0;
          console.log('canComment', response.policy.comments);
          const latestAdminComment = response.policy.comments
            .filter((c) => c.user_role !== 'user')
            .sort(
              (a, b) =>
                new Date(b.comment_date).getTime() -
                new Date(a.comment_date).getTime()
            )[0];
          if (latestAdminComment) {
            this.receiver = {
              id: latestAdminComment.user_id,
              role: latestAdminComment.user_role,
              name: latestAdminComment.user_name,
            };
          }
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (err) => {
          this.error = this.translate.instant(
            'pages.comments.errors.load_comments'
          );
          this.isLoading = false;
          console.error('Error fetching comments:', err);
        },
      });
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return (
      d.toLocaleString(
        this.languageService.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US',
        {
          timeZone: 'Africa/Cairo',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }
      ) || this.translate.instant('pages.comments.na')
    );
  }

  onFileSelect(event: Event) {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.selectedFiles.forEach((file) => {
        if (this.isImageFile(file)) {
          this.filePreviewUrls[file.name] = URL.createObjectURL(file);
        }
      });
    }
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFilePreview(file: File): string {
    return this.filePreviewUrls[file.name] || '';
  }

  triggerFileInput() {
    if (!isPlatformBrowser(this.platformId)) return;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  removeFile(index: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    const removedFile = this.selectedFiles[index];
    if (this.filePreviewUrls[removedFile.name]) {
      URL.revokeObjectURL(this.filePreviewUrls[removedFile.name]);
      delete this.filePreviewUrls[removedFile.name];
    }
    this.selectedFiles.splice(index, 1);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onSubmit() {
    console.log('comment', this.commentForm.valid);
    console.log('receiver', this.receiver);
    console.log('policyId', this.policyId);
    console.log('policyType', this.policyType);
    console.log('canComment', this.canComment);
    if (
      !this.canComment ||
      !this.commentForm.valid ||
      !this.receiver ||
      !this.policyId ||
      !this.policyType
    )
      return;
    console.log('valid comment');
    this.isSubmitting = true;

    const userData = this.authStorage.getUserData();
    if (!userData) {
      this.error = this.translate.instant(
        'pages.comments.errors.not_authenticated'
      );
      this.isSubmitting = false;
      return;
    }

    const payload: CreatePolicyCommentPayload = {
      user_id: userData.id,
      user_role: userData.role as 'user' | 'ad++2201222min',
      user_name: userData.name,
      comment: this.commentForm.get('message')?.value.trim(),
      reciver_id: this.receiver.id,
      reciver_role: this.receiver.role,
      reciver_name: this.receiver.name,
      request_id: this.policyId,
      request_status: 'pending',
      comment_file:
        this.selectedFiles.length > 0 ? this.selectedFiles[0] : null,
    };

    const createCommentObservable =
      this.policyType === 'medical'
        ? this.policiesService.createMedicalPolicyComment(
            this.policyId,
            payload
          )
        : this.policyType === 'motor'
        ? this.policiesService.createMotorPolicyComment(this.policyId, payload)
        : this.policyType === 'jop'
        ? this.policiesService.createJopPolicyComment(this.policyId, payload)
        : this.policiesService.createBuildingPolicyComment(
            this.policyId,
            payload
          );

    createCommentObservable.subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          this.commentForm.reset();
          Object.values(this.filePreviewUrls).forEach((url) =>
            URL.revokeObjectURL(url)
          );
          this.filePreviewUrls = {};
          this.selectedFiles = [];
          const fileInput = document.getElementById(
            'fileInput'
          ) as HTMLInputElement;
          if (fileInput) fileInput.value = '';

          this.isSubmitting = false;
          this.fetchComments();
        }
      },
      error: (err) => {
        this.error = this.translate.instant(
          'pages.comments.errors.submit_comment'
        );
        this.isSubmitting = false;
        console.error('Error submitting comment:', err);
      },
    });
  }

  scrollToBottom(): void {
    if (!isPlatformBrowser(this.platformId) || !this.commentsContainer) return;
    setTimeout(() => {
      this.commentsContainer.nativeElement.scrollTop =
        this.commentsContainer.nativeElement.scrollHeight;
    }, 0);
  }

  getAlignmentClasses(role: string): string {
    if (this.isRTL) {
      return role === 'user' ? '' : 'flex-row-reverse';
    }
    return role === 'user' ? 'flex-row-reverse' : '';
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    Object.values(this.filePreviewUrls).forEach((url) =>
      URL.revokeObjectURL(url)
    );
  }
}
