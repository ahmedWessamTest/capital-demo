export interface JobInsuranceChoices {
  ploicy: Ploicy;
}

export interface Ploicy {
  id: number;
  category_id: number;
  en_title: string;
  ar_title: string;
  year_money: string;
  month_money: string;
  company_name: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  medicalchoices: any[];
}
