export interface JobInsurancePolicy {
  category: JopCategory;
  types: any;
}

export interface JopCategory {
  id: number;
  en_title: string;
  ar_title: string;
  en_slug: string;
  ar_slug: string;
  en_small_description: string;
  ar_small_description: string;
  en_main_description: string;
  ar_main_description: string;
  network_link: string;
  counter_number: number;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_description: string;
  ar_meta_description: string;
  ar_first_script: string;
  en_first_script: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  jopinsurances: JopInsurance[];
}
export interface JopInsurance {
  id: number;
  category_id: number;
  jop_insurance_id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  active_status: number;
  year_money: string;
  month_money: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  jopchoices: JopChoice[];
}

export interface JopChoice {
  id: number;
  jop_insurance_id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  active_status: number;
}
