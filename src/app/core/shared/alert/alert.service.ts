import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, take } from 'rxjs';

export enum AlertType {
  NOTIFICATION = 'NOTIFICATION',
  CONFIRMATION = 'CONFIRMATION',
  OTP = 'OTP',
  CALL_REQUEST = 'CALL_REQUEST',
  GENERAL = 'GENERAL'
}

export interface AlertConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  imagePath?: string;
  secondaryImagePath?: string;
  alertType: AlertType;
  email?: string;
  translationKeys?: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    buttonLabel?: string;
  };
  messages?: string[];
  buttonLabel?: string;
  redirectRoute?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  onVerify?: (otp: string) => void;
  onResend?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private showAlertSubject = new BehaviorSubject<boolean>(false);
  private alertConfigSubject = new BehaviorSubject<AlertConfig | null>(null);
// Add these properties
private verificationResultSubject$ = new Subject<{success: boolean, errorMessage?: string}>();
public verificationResult$ = this.verificationResultSubject$.asObservable();

// Add this method
setVerificationResult(success: boolean, errorMessage?: string) {
  this.verificationResultSubject$.next({ success, errorMessage });
}
  showAlertSubject$ = this.showAlertSubject;
  showAlert$ = this.showAlertSubject.asObservable();
  alertConfig$ = this.alertConfigSubject.asObservable();

  showNotification(config: Omit<AlertConfig, 'alertType' | 'cancelText'>) {
    this.show({
      ...config,
      alertType: AlertType.NOTIFICATION,
      onCancel: config.onDismiss,
    });
  }

  showConfirmation(config: Omit<AlertConfig, 'alertType'>) {
    this.show({
      ...config,
      alertType: AlertType.CONFIRMATION,
    });
  }

  // showCallRequest(config: Omit<AlertConfig, 'alertType'>) {
  //   this.show({
  //     ...config,
  //     alertType: AlertType.CALL_REQUEST,
  //   });
  // }

  showCallRequest(config: Omit<AlertConfig, 'alertType'>) {
    this.show({
      ...config,
      alertType: AlertType.CALL_REQUEST,
      onDismiss: () => this.hide() // Add onDismiss to hide popup without redirect
    });
  }
  
  onButtonClick() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onDismiss) {
        config.onDismiss();
      } else {
        this.hide();
      }
    });
  }

  showGeneral(config: Omit<AlertConfig, 'alertType'>) {
    this.show({
      ...config,
      alertType: AlertType.GENERAL,
    });
  }

  show(config: AlertConfig) {
    this.alertConfigSubject.next(config);
    this.showAlertSubject.next(true);
  }

  hide() {
    this.showAlertSubject.next(false);
    this.alertConfigSubject.next(null);
  }

  showOtp(config: Omit<AlertConfig, 'alertType'>) {
    this.alertConfigSubject.next({ ...config, alertType: AlertType.OTP });
    this.showAlertSubject.next(true);
  }
}