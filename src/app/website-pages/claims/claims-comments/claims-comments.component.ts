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
  ClaimComment,
  ClaimCommentsResponse,
  ClaimsService,
  CreateCommentPayload,
} from '@core/services/profile/user-claims.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Comment {
  id: number;
  sender: string;
  date: string;
  message: string;
  role: 'user' | 'admin';
  comment_file?: string | null;
  claim_number?: string;
}

@Component({
  selector: 'app-comments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './claims-comments.component.html',
  styleUrls: ['./claims-comments.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ClaimsCommentsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private claimsService = inject(ClaimsService);
  private fb = inject(FormBuilder);
  private languageService = inject(LanguageService);
  private authStorage = inject(AuthStorageService);
  private platformId = inject(PLATFORM_ID);
   translate = inject(TranslateService)
  

  @ViewChild('commentsContainer') commentsContainer!: ElementRef;

  claimId: number | null = null;
  claimType: 'medical' | 'motor' | 'building' | 'jop' | null = null;
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
    this.route.paramMap.subscribe((params) => {
      const id = params.get('claimId');
      const type = params.get('claimType') as
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
        this.claimId = +id;
        this.claimType = type;
        this.fetchComments();
      } else {
        this.error = this.translate.instant('pages.claims.comment.errors.invalid_claim_or_id');
        this.isLoading = false;
      }
    });
    this.currentLang$.subscribe((lang) => {
      this.isRTL = lang === 'ar';
    });
  }

  fetchComments() {
    if (!this.claimId || !this.claimType) return;

    this.claimsService
      .getClaimWithComments(this.claimId, this.claimType)
      .subscribe({
        next: (response: ClaimCommentsResponse) => {
          this.comments = response.claim.comments.map(
            (comment: ClaimComment) => ({
              id: comment.id,
              sender: comment.user_name,
              date: this.formatDate(comment.created_at), // Use created_at
              message: comment.comment,
              role: comment.user_role as 'user' | 'admin',
              comment_file: comment.comment_file,
              claim_number: comment.claim_number, // Add claim_number
            })
          );
          this.canComment =
            response.claim.status === 'pending' &&
            response.claim.comments.length > 0;
          console.log('claim comments', response.claim.comments);
          const latestAdminComment = response.claim.comments
            .filter((c) => c.user_role !== 'user')
            .sort(
              (a, b) =>
                new Date(b.created_at as string).getTime() -
                new Date(a.created_at as string).getTime()
            )[0];
          console.log('latestAdminComment', latestAdminComment);
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
          this.error = this.translate.instant('pages.claims.comment.errors.failed_to_load');
          this.isLoading = false;
          console.error('Error fetching comments:', err);
        },
      });
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      timeZone: 'Africa/Cairo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
    console.log('claimId', this.claimId);
    console.log('claimType', this.claimType);
    console.log('canComment', this.canComment);
    if (
      !this.canComment ||
      !this.commentForm.valid ||
      !this.receiver ||
      !this.claimId ||
      !this.claimType
    )
      return;

    this.isSubmitting = true;

    const userData = this.authStorage.getUserData();
    if (!userData) {
      this.error = this.translate.instant('pages.claims.comment.errors.user_not_auth');
      this.isSubmitting = false;
      return;
    }

    const payload: CreateCommentPayload = {
      user_id: userData.id,
      user_role: userData.role as 'user' | 'admin',
      user_name: userData.name,
      comment: this.commentForm.get('message')?.value.trim(),
      reciver_id: this.receiver.id,
      reciver_role: this.receiver.role,
      reciver_name: this.receiver.name,
      claim_id: this.claimId,
      claim_number: this.comments[0]?.claim_number || '', // Fallback to empty string
      claim_status: 'pending',
      comment_file:
        this.selectedFiles.length > 0 ? this.selectedFiles[0] : null,
    };

    const createCommentObservable =
      this.claimType === 'medical'
        ? this.claimsService.createMedicalClaimComment(this.claimId, payload)
        : this.claimType === 'motor'
        ? this.claimsService.createMotorClaimComment(this.claimId, payload)
        : this.claimType === 'jop'
        ? this.claimsService.createJopClaimComment(this.claimId, payload)
        : this.claimsService.createBuildingClaimComment(this.claimId, payload);

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
        this.error = this.translate.instant('pages.claims.comment.errors.failed_to_submit');
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
