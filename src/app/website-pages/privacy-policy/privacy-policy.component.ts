import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '@core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';

interface PrivacyPolicyResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    en_title: string;
    ar_title: string;
    en_description: string;
    ar_description: string;
    created_at: string;
    updated_at: string;
  };
}

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
  imports: [CommonModule, TranslateModule,SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
  privacyPolicy$: Observable<PrivacyPolicyResponse | null>;
  isArabic: boolean = false;
  content:string = ''
   en_content = `
    <p><strong>Effective Date:</strong> April 15, 2024</p>

    <h3>Introduction</h3>
    <p>
      This Privacy Policy describes how our team uses and protects your personal information 
      when you use Capital Insurance. We are committed to protecting your privacy and ensuring 
      that your personal information is handled responsibly and in accordance with applicable 
      data protection laws.
    </p>

    <h3>Information We Collect</h3>
    <ul>
      <li><strong>Full name:</strong> We collect your full name for identification and personalization purposes.</li>
      <li><strong>Email address:</strong> Used for account creation, password recovery, and to send you important updates.</li>
      <li><strong>Password:</strong> Stored securely to protect your account from unauthorized access.</li>
      <li><strong>Phone number:</strong> Required to contact you whenever you need.</li>
      <li><strong>Job title:</strong> Used to tailor content and recommendations.</li>
      <li><strong>Workplace:</strong> Used to tailor content and recommendations as well.</li>
    </ul>

    <h3>How We Use Your Information</h3>
    <ul>
      <li><strong>To provide and operate Capital Insurance:</strong> Create and manage your account, personalize your experience, and give you access to services.</li>
      <li><strong>To send important information:</strong> Updates, security alerts, and support messages.</li>
      <li><strong>To improve the service:</strong> Analyze usage trends, understand preferences, and enhance functionality.</li>
      <li><strong>To personalize your experience:</strong> Use job title and workplace to make content more relevant.</li>
    </ul>

    <h3>Sharing Your Information</h3>
    <p>
      We will not share your personal information with any third parties without your consent, 
      except in the following cases:
    </p>
    <ul>
      <li><strong>To comply with the law:</strong> If required by legal authorities.</li>
      <li><strong>To protect our rights:</strong> If necessary to prevent fraud, abuse, or protect others.</li>
    </ul>

    <h3>Data Security</h3>
    <p>
      We use industry-standard encryption to protect your data, but no system is 100% secure. 
      While we take reasonable measures, we cannot guarantee absolute security.
    </p>

    <h3>Your Choices</h3>
    <ul>
      <li><strong>Access your information:</strong> You can view and update your information anytime.</li>
      <li><strong>Delete your information:</strong> You can request account deletion by contacting 
      <a href="mailto:bonder@digitalbondmena.com">bonder@digitalbondmena.com</a>.</li>
      <li><strong>Account management:</strong> Delete or deactivate your account anytime from your profile.</li>
    </ul>

    <h3>Changes to this Policy</h3>
    <p>
      We may update this Privacy Policy from time to time. Updates will be posted on our website, 
      and we encourage you to review it regularly.
    </p>

    <h3>Contact Us</h3>
    <p>
      If you have any questions, please contact us at: 
      <a href="mailto:bonder@digitalbondmena.com">bonder@digitalbondmena.com</a>
    </p>
  `;
  ar_content = `
  <h2>المقدمة</h2>
<p>
  توضح سياسة الخصوصية هذه كيفية قيام فريقنا باستخدام وحماية معلوماتك الشخصية عند استخدامك Capital Insurance.
  نحن ملتزمون بحماية خصوصيتك وضمان التعامل مع معلوماتك الشخصية بمسؤولية ووفقًا لقوانين حماية البيانات المعمول بها.
</p>

<h2>المعلومات التي نجمعها</h2>
<p>عند التسجيل في Capital Insurance، نقوم بجمع المعلومات الشخصية التالية:</p>
<ul>
  <li><strong>الاسم الكامل:</strong> نستخدم اسمك الكامل للتعريف وتخصيص تجربتك.</li>
  <li><strong>البريد الإلكتروني:</strong> يُستخدم لإنشاء الحساب واسترجاع كلمة المرور وإرسال التحديثات والمعلومات المهمة.</li>
  <li><strong>كلمة المرور:</strong> نقوم بتخزينها بشكل آمن لحماية حسابك من الوصول غير المصرح به.</li>
  <li><strong>رقم الهاتف:</strong> مطلوب للتواصل معك عند الحاجة.</li>
  <li><strong>المسمى الوظيفي:</strong> نستخدمه لتخصيص المحتوى والتوصيات بما يناسبك.</li>
  <li><strong>مكان العمل:</strong> نستخدمه أيضًا لتخصيص المحتوى والتوصيات.</li>
</ul>

<h2>كيفية استخدام معلوماتك</h2>
<p>نستخدم معلوماتك الشخصية للأغراض التالية:</p>
<ul>
  <li><strong>تقديم وتشغيل Capital Insurance:</strong> لإنشاء حسابك وإدارته، وتخصيص تجربتك، ومنحك إمكانية الوصول إلى الميزات والخدمات.</li>
  <li><strong>إرسال المعلومات المهمة:</strong> قد نستخدم بريدك الإلكتروني لإرسال التحديثات والتنبيهات الأمنية ورسائل الدعم.</li>
  <li><strong>تحسين الخدمة:</strong> نستخدم معلوماتك لتحليل أنماط الاستخدام وفهم تفضيلات المستخدمين وتحسين الأداء العام.</li>
  <li><strong>تخصيص تجربتك:</strong> نستخدم المسمى الوظيفي ومكان العمل لجعل المحتوى أكثر ملاءمة لاحتياجاتك.</li>
</ul>

<h2>مشاركة معلوماتك</h2>
<p>
  لن نشارك معلوماتك الشخصية مع أي طرف ثالث دون موافقتك. ومع ذلك، قد تكون هناك ظروف تستدعي الإفصاح عن معلوماتك، مثل:
</p>
<ul>
  <li><strong>الامتثال للقانون:</strong> إذا طُلب منا ذلك بموجب القانون أو استجابة لطلب قانوني ساري.</li>
  <li><strong>حماية حقوقنا:</strong> إذا كان الإفصاح ضروريًا لحماية حقوقنا أو حقوق الآخرين، مثل حالات الاحتيال أو إساءة الاستخدام.</li>
</ul>

<h2>أمان البيانات</h2>
<p>
  نتخذ التدابير اللازمة لضمان حماية معلوماتك الشخصية. نستخدم تقنيات التشفير القياسية لحماية بياناتك من الوصول غير
  المصرح به أو الكشف أو التغيير أو الإتلاف. ومع ذلك، لا توجد وسيلة أمان مثالية، ولا يمكننا ضمان الحماية المطلقة
  لمعلوماتك.
</p>

<h2>اختياراتك</h2>
<p>لديك الخيارات التالية بخصوص معلوماتك الشخصية:</p>
<ul>
  <li><strong>الوصول إلى معلوماتك:</strong> يمكنك الوصول إلى معلوماتك الشخصية وتحديثها في أي وقت من خلال إعدادات الحساب.</li>
  <li><strong>حذف معلوماتك:</strong> يمكنك طلب حذف حسابك وجميع معلوماتك الشخصية في أي وقت عبر التواصل معنا على <a href="mailto:bonder@digitalbondmena.com">bonder@digitalbondmena.com</a>.</li>
  <li><strong>إدارة الحساب:</strong> يمكنك حذف حسابك نهائيًا أو تعطيله من خلال ملفك الشخصي.</li>
</ul>

<h2>التغييرات على هذه السياسة</h2>
<p>
  قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات من خلال نشر النسخة المحدثة على موقعنا الإلكتروني.
  ونشجعك على مراجعة هذه السياسة بانتظام لمعرفة أي تغييرات.
</p>

<h2>اتصل بنا</h2>
<p>
  إذا كان لديك أي استفسار بخصوص سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني:
  <a href="mailto:bonder@digitalbondmena.com">bonder@digitalbondmena.com</a>
</p>
`
  private destroy$ = new Subject<void>();
  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private cd: ChangeDetectorRef
  ) {
    this.privacyPolicy$ = this.http.get<PrivacyPolicyResponse>(`${API_CONFIG.BASE_URL}privacy-policy`);
    
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$
    .pipe(takeUntil(this.destroy$))
    .subscribe((language) => {
      console.log(language);
      this.isArabic = language === 'ar';
      this.content = this.isArabic ? this.ar_content : this.en_content;
      this.cd.markForCheck();
      this.privacyPolicy$ = this.http.get<PrivacyPolicyResponse>(
        `${API_CONFIG.BASE_URL}privacy-policy?lang=${language}`
      )
    });
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}