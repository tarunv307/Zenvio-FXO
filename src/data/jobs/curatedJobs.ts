import { GovtJob } from '../../types/jobs';

export const CURATED_GOVT_JOBS: GovtJob[] = [
  // ─── 1. UPSC Civil Services Examination (CSE) ──────────────────────────────
  {
    id: 'upsc-cse-2026',
    slug: 'upsc-civil-services-examination-2026',
    title: 'Civil Services Examination (IAS, IPS, IFS)',
    organization: 'Union Public Service Commission',
    shortOrg: 'UPSC',
    department: 'Department of Personnel and Training (DoPT)',
    category: 'upsc',
    qualification: "Bachelor's Degree in any discipline from a recognized University",
    vacancies: 1056,
    location: 'All India',
    startDate: '2026-11-01',
    lastDate: '2026-12-05',
    officialNotificationUrl: 'https://upsc.gov.in/examinations/active-exams',
    officialApplyUrl: 'https://upsconline.nic.in',
    sourceUrl: 'https://upsc.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'The Union Public Service Commission conducts the prestigious Civil Services Examination annually to recruit officers for the Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), and other Central Group A and Group B civil services.',
    officialSummary:
      'Notification No. 05/2026-CSP: Candidates must apply online only via upsc.gov.in. The examination will consist of two successive stages: Preliminary (Objective Type) and Main Examination (Written and Interview) for the selection of candidates to the various services and posts.',
    eligibilityCriteria: {
      education: [
        'A candidate must hold a graduate degree of any of Universities incorporated by an Act of the Central or State Legislature in India or other educational institutions established by an Act of Parliament.',
        'Candidates appearing in the qualifying degree exam may also apply provisionally.',
      ],
      ageLimit: {
        min: 21,
        max: 32,
        description: 'Candidate must have attained 21 years and must not have exceeded 32 years of age as on 1st August of the examination year.',
        relaxationRules: 'SC/ST: up to 5 years; OBC (NCL): up to 3 years; PwBD: up to 10 years.',
      },
      nationality: 'Citizen of India (for IAS/IPS); Citizen of India, subject of Nepal/Bhutan for other services.',
    },
    vacancyBreakdown: [
      { postName: 'Indian Administrative Service (IAS)', vacancies: 180 },
      { postName: 'Indian Police Service (IPS)', vacancies: 200 },
      { postName: 'Indian Foreign Service (IFS)', vacancies: 55 },
      { postName: 'Central Group A Services (IRS, IAAS, etc.)', vacancies: 480 },
      { postName: 'Central Group B Services (DANICS, DANIPS, etc.)', vacancies: 141 },
    ],
    applicationFee: {
      generalOBC: '₹100',
      scStFemale: 'Exempted (Nil)',
      paymentMode: 'Online via SBI Net Banking, Visa/Mastercard/RuPay Credit/Debit Card or UPI.',
      note: 'Female candidates and SC/ST/PwBD candidates are exempted from payment of fee.',
    },
    importantDates: {
      notificationDate: '2026-11-01',
      startDate: '2026-11-01',
      lastDate: '2026-12-05',
      feePaymentLastDate: '2026-12-05',
      examDate: '2027-05-25',
      admitCardDate: '3 weeks before exam',
    },
    selectionProcess: [
      'Preliminary Examination (Objective Type: General Studies Paper I & CSAT Paper II)',
      'Main Written Examination (9 descriptive papers)',
      'Personality Test / Interview conducted at UPSC Dholpur House, New Delhi',
      'Final Merit List based on Marks in Mains (1750) + Interview (275)',
    ],
    salary: {
      payScale: 'Level 10 (₹56,100 to ₹1,77,500) under 7th Central Pay Commission',
      gradePay: '₹5,400 (pre-revised)',
      inHandEstimate: '₹85,000 – ₹1,10,000/month (including DA, HRA, and allowances)',
      officialDetails:
        'Basic pay starts at ₹56,100 at Junior Time Scale (Level 10) progressing up to Cabinet Secretary grade (Level 18: ₹2,50,000 fixed).',
    },
    featured: true,
  },

  // ─── 2. SSC Combined Graduate Level (CGL) 2026 ─────────────────────────────
  {
    id: 'ssc-cgl-2026',
    slug: 'ssc-combined-graduate-level-cgl-2026',
    title: 'Combined Graduate Level Examination (SSC CGL)',
    organization: 'Staff Selection Commission',
    shortOrg: 'SSC',
    department: 'Various Ministries, Departments, and Attached Offices of Govt of India',
    category: 'ssc',
    qualification: "Bachelor's Degree from a recognized University or equivalent",
    vacancies: 17727,
    location: 'All India',
    startDate: '2026-10-25',
    lastDate: '2026-11-30',
    officialNotificationUrl: 'https://ssc.gov.in/api/announcements',
    officialApplyUrl: 'https://ssc.gov.in',
    sourceUrl: 'https://ssc.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'SSC CGL is one of the most widely anticipated national recruitment drives for Group B and Group C posts in central ministries, departments, CBI, Intelligence Bureau, Income Tax, and Central Excise.',
    officialSummary:
      'F. No. HQ-PPI03/11/2026-PP_1: Staff Selection Commission invites online applications for competitive computer-based examinations to fill various non-technical Group B and Group C posts in the Ministries and Departments of the Government of India.',
    eligibilityCriteria: {
      education: [
        "Bachelor's Degree from a recognized University or equivalent.",
        'For Assistant Audit Officer/Assistant Accounts Officer: Chartered Accountant / Cost Management Accountant / Company Secretary / Master in Commerce is desirable.',
        'For Junior Statistical Officer (JSO): Bachelor’s Degree with at least 60% in Mathematics at 12th standard, or Bachelor’s Degree with Statistics as one of the subjects.',
      ],
      ageLimit: {
        min: 18,
        max: 32,
        description: 'Varies by post code; generally 18 to 30 years or 18 to 32 years as on cut-off date.',
        relaxationRules: 'OBC: 3 years, SC/ST: 5 years, PwBD: 10 years, Ex-Servicemen: 3 years deduction.',
      },
      nationality: 'Citizen of India or subject of Nepal/Bhutan.',
    },
    vacancyBreakdown: [
      { postName: 'Inspector (Central Excise / GST)', vacancies: 2850 },
      { postName: 'Assistant Section Officer (CSS / MEA)', vacancies: 1980 },
      { postName: 'Tax Assistant (CBDT / CBIC)', vacancies: 3420 },
      { postName: 'Sub-Inspector (CBI / NIA)', vacancies: 340 },
      { postName: 'Auditor & Accountant (CAG / CGA)', vacancies: 2150 },
      { postName: 'Other Group B & C Vacancies', vacancies: 6987 },
    ],
    applicationFee: {
      generalOBC: '₹100',
      scStFemale: 'Nil (Exempted)',
      paymentMode: 'BHIM UPI, Net Banking, or Visa/Mastercard/Maestro/RuPay Credit or Debit cards.',
    },
    importantDates: {
      notificationDate: '2026-10-25',
      startDate: '2026-10-25',
      lastDate: '2026-11-30',
      feePaymentLastDate: '2026-12-01',
      examDate: 'Tier-1: February 2027',
      admitCardDate: '7 days before exam',
    },
    selectionProcess: [
      'Tier-I: Computer Based Examination (Qualifying)',
      'Tier-II: Computer Based Examination (Paper I: Mathematical Abilities, Reasoning, English, General Awareness + Computer Knowledge Test + Data Entry Speed Test)',
      'Document Verification conducted by Indenting Departments',
    ],
    salary: {
      payScale: 'Pay Level 4 (₹25,500 - ₹81,100) to Pay Level 8 (₹47,600 - ₹1,51,100)',
      officialDetails:
        'Pay Level 7/8 posts like ASO and Inspectors start at basic ₹44,900/₹47,600 with gross monthly salary ranging from ₹65,000 to ₹85,000 depending on city classification (X, Y, Z).',
    },
    featured: true,
  },

  // ─── 3. Railway Recruitment Board (RRB) Technician & ALP ──────────────────
  {
    id: 'rrb-technician-alp-2026',
    slug: 'rrb-technician-assistant-loco-pilot-2026',
    title: 'Assistant Loco Pilot (ALP) & Technicians Recruitment',
    organization: 'Railway Recruitment Boards (RRBs)',
    shortOrg: 'RRB',
    department: 'Ministry of Railways, Government of India',
    category: 'railway',
    qualification: 'Matriculation / 10th Pass plus ITI from recognized institutions of NCVT/SCVT, or Diploma in Engineering',
    vacancies: 18799,
    location: 'Across Railway Zones (All India)',
    startDate: '2026-10-20',
    lastDate: '2026-11-28',
    officialNotificationUrl: 'https://www.rrbcdg.gov.in',
    officialApplyUrl: 'https://www.rrbapply.gov.in',
    sourceUrl: 'https://indianrailways.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'Railway Recruitment Boards invite applications from eligible technical candidates for the recruitment of Assistant Loco Pilot (ALP) and Technicians across 21 regional RRBs.',
    officialSummary:
      'CEN No. 01/2026: Centralized Employment Notice for recruitment of Assistant Loco Pilot and Technical Grade III posts in Indian Railways.',
    eligibilityCriteria: {
      education: [
        'Matriculation / SSLC plus ITI in specified trades (Fitter, Electrician, Instrument Mechanic, Millwright, Radio/TV, Electronics, etc.) from recognized NCVT/SCVT institutions, OR',
        '3-year Diploma in Mechanical / Electrical / Electronics / Automobile Engineering from recognized polytechnic institute.',
      ],
      ageLimit: {
        min: 18,
        max: 30,
        description: 'Age calculated as on 1st July of the application year.',
        relaxationRules: 'OBC: 3 years; SC/ST: 5 years; Ex-servicemen: service period + 3 years.',
      },
    },
    vacancyBreakdown: [
      { postName: 'Assistant Loco Pilot (ALP)', vacancies: 12500 },
      { postName: 'Technician Grade III (Mechanical / Electrical)', vacancies: 6299 },
    ],
    applicationFee: {
      generalOBC: '₹500 (₹400 refunded upon attending CBT-1)',
      scStFemale: '₹250 (Full fee refunded upon attending CBT-1)',
      paymentMode: 'Online Net Banking / Cards / UPI.',
      note: 'Candidates who appear for 1st Stage Computer Based Test are eligible for partial or full refund.',
    },
    importantDates: {
      startDate: '2026-10-20',
      lastDate: '2026-11-28',
      examDate: 'CBT 1: January 2027',
      admitCardDate: '4 days prior to exam city slip',
    },
    selectionProcess: [
      'First Stage Computer Based Test (CBT-1)',
      'Second Stage Computer Based Test (CBT-2: Part A & Part B trade syllabus)',
      'Computer Based Aptitude Test (CBAT) for ALP posts only',
      'Document Verification and Medical Examination',
    ],
    salary: {
      payScale: 'Level 2 in 7th CPC Pay Matrix (Basic ₹19,900)',
      inHandEstimate: '₹35,000 – ₹45,000/month (including Running Allowances for Loco Pilots)',
      officialDetails:
        'Starting basic pay is ₹19,900 plus Dearness Allowance, HRA, Transport Allowance, and Running Kilometre Allowance as per Railway Services Rules.',
    },
    featured: true,
  },

  // ─── 4. Tamil Nadu Public Service Commission (TNPSC Group 4) ───────────────
  {
    id: 'tnpsc-group-4-2026',
    slug: 'tnpsc-combined-civil-services-group-4-2026',
    title: 'TNPSC Combined Civil Services Examination - IV (Group 4 & VAO)',
    organization: 'Tamil Nadu Public Service Commission',
    shortOrg: 'TNPSC',
    department: 'Government of Tamil Nadu',
    category: 'tamil-nadu',
    qualification: 'Must have passed S.S.L.C. (10th Standard) Public Examination with eligibility for admission to Higher Secondary Courses',
    vacancies: 8932,
    location: 'Tamil Nadu',
    startDate: '2026-10-15',
    lastDate: '2026-11-20',
    officialNotificationUrl: 'https://www.tnpsc.gov.in/english/notifications.aspx',
    officialApplyUrl: 'https://apply.tnpscexams.in',
    sourceUrl: 'https://www.tnpsc.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'TNPSC Group 4 is the largest state government recruitment examination in Tamil Nadu, recruiting Village Administrative Officers (VAO), Junior Assistants, Typists, Steno-Typists, and Bill Collectors directly into government offices.',
    officialSummary:
      'Notification No. 04/2026: Tamil Nadu Public Service Commission invites applications through online mode for direct recruitment to the posts included in Combined Civil Services Examination-IV (Group-IV Services).',
    eligibilityCriteria: {
      education: [
        'Must possess minimum general educational qualification viz., must have passed S.S.L.C Public Examination or its equivalent.',
        'Must possess adequate knowledge in Tamil.',
        'For Typist / Steno-Typist: Must have passed the Government Technical Examination in Typewriting (Tamil & English Higher or combination).',
      ],
      ageLimit: {
        min: 21,
        max: 42,
        description: 'For VAO: 21 to 32 years (General), up to 42 years for BC/MBC/SC/ST. For Junior Assistant: 18 to 32 years (General), up to 37 years for BC/MBC, up to 42 years for SC/ST.',
        relaxationRules: 'Destitute Widows and Persons with Benchmark Disabilities enjoy further concessions.',
      },
    },
    vacancyBreakdown: [
      { postName: 'Village Administrative Officer (VAO)', vacancies: 425 },
      { postName: 'Junior Assistant (Non-Security & Security)', vacancies: 4500 },
      { postName: 'Typist', vacancies: 2800 },
      { postName: 'Steno-Typist (Grade III)', vacancies: 950 },
      { postName: 'Bill Collector (Grade I)', vacancies: 257 },
    ],
    applicationFee: {
      generalOBC: '₹100 (Exam Fee) + ₹150 (One Time Registration valid for 5 years)',
      scStFemale: 'Exempted for SC/ST/Destitute Widows, Concessions for BC/MBC',
      paymentMode: 'Net banking, credit card, debit card via State Bank of India e-pay.',
    },
    importantDates: {
      startDate: '2026-10-15',
      lastDate: '2026-11-20',
      examDate: '2027-02-15 (Single Paper - 3 hours)',
      admitCardDate: '10 days before the examination',
    },
    selectionProcess: [
      'Single Stage Written Examination (Objective Type: 200 Questions / 300 Marks)',
      'Part A: Tamil Eligibility cum Scoring Test (100 questions / 150 marks)',
      'Part B: General Studies (75 questions) + Aptitude and Mental Ability Test (25 questions)',
      'Certificate Verification & Counseling for Department / Post Allocation',
    ],
    salary: {
      payScale: 'Level 8 & 10 (₹19,500 - ₹71,900) in Tamil Nadu Revised Pay Rules',
      inHandEstimate: '₹24,000 – ₹31,000/month',
      officialDetails:
        'Junior Assistant & VAO receive Level 8 pay (minimum ₹19,500 basic) + current DA + HRA (Grade I/II/III based on posting location in Tamil Nadu).',
    },
    featured: true,
  },

  // ─── 5. State Bank of India (SBI) Probationary Officer (PO) ────────────────
  {
    id: 'sbi-po-2026',
    slug: 'sbi-probationary-officer-po-recruitment-2026',
    title: 'SBI Probationary Officer (PO) Recruitment',
    organization: 'State Bank of India',
    shortOrg: 'SBI',
    department: 'Central Recruitment & Promotion Department (CRPD)',
    category: 'banking',
    qualification: 'Graduation in any discipline from a recognized University or any equivalent qualification recognized by the Central Government',
    vacancies: 2000,
    location: 'All India',
    startDate: '2026-11-05',
    lastDate: '2026-12-10',
    officialNotificationUrl: 'https://bank.sbi/careers',
    officialApplyUrl: 'https://ibpsonline.ibps.in/sbiposnov26/',
    sourceUrl: 'https://sbi.co.in/web/careers',
    lastVerifiedDate: '2026-11-14',
    overview:
      "State Bank of India invites online applications for appointment as Probationary Officers (PO). The role offers rapid career progression, comprehensive banking leadership training, and premier compensation in India's largest public sector bank.",
    officialSummary:
      'Advertisement No. CRPD/PO/2026-27/18: Applications are invited from eligible Indian Citizens for appointment as Probationary Officers (POs) in State Bank of India. Selected candidates may be posted anywhere in India.',
    eligibilityCriteria: {
      education: [
        'Graduation in any discipline from a recognized University or any equivalent qualification.',
        'Those in the final year/semester of graduation may also apply provisionally.',
      ],
      ageLimit: {
        min: 21,
        max: 30,
        description: 'Candidate must have been born not later than 01.04.2005 and not earlier than 02.04.1996.',
        relaxationRules: 'SC/ST: 5 years, OBC: 3 years, PwBD: 10 to 15 years.',
      },
    },
    applicationFee: {
      generalOBC: '₹750 (Application fee and intimation charges)',
      scStFemale: 'Nil (SC/ST/PwBD candidates are exempted from application fee)',
      paymentMode: 'Debit Cards (RuPay/Visa/MasterCard/Maestro), Credit Cards, Internet Banking.',
    },
    importantDates: {
      startDate: '2026-11-05',
      lastDate: '2026-12-10',
      examDate: 'Preliminary: January 2027 | Main: March 2027',
      admitCardDate: '2 weeks before Preliminary examination',
    },
    selectionProcess: [
      'Phase-I: Preliminary Examination (Online 100 Marks: English, Quantitative Aptitude, Reasoning)',
      'Phase-II: Main Examination (Objective 200 Marks + Descriptive Test 50 Marks)',
      'Phase-III: Psychometric Evaluation, Group Discussion (20 marks) & Interview (30 marks)',
    ],
    salary: {
      payScale: 'Basic pay ₹41,960 with 4 advance increments in the scale of ₹36000-1490/7-46430-1740/2-49910-1990/7-63840',
      inHandEstimate: '₹65,000 – ₹78,000/month + Leased accommodation benefits',
      officialDetails:
        'The total compensation per annum will be a minimum of ₹13.00 Lakhs and a maximum of ₹18.00 Lakhs depending on place of posting and other factors.',
    },
    featured: true,
  },

  // ─── 6. Indian Air Force AFCAT 01/2027 (Defence) ───────────────────────────
  {
    id: 'iaf-afcat-2027',
    slug: 'indian-air-force-afcat-entry-2027',
    title: 'Air Force Common Admission Test (AFCAT - Flying & Ground Duty)',
    organization: 'Indian Air Force (IAF)',
    shortOrg: 'Indian Air Force',
    department: 'Directorate of Personnel Officers (DPO)',
    category: 'defence',
    qualification: 'Graduate with minimum 60% marks and 10+2 with 50% marks in Math & Physics; or B.E./B.Tech Degree',
    vacancies: 317,
    location: 'Air Force Stations (Pan India)',
    startDate: '2026-11-10',
    lastDate: '2026-12-15',
    officialNotificationUrl: 'https://afcat.cdac.in/AFCAT/',
    officialApplyUrl: 'https://afcat.cdac.in',
    sourceUrl: 'https://careerindianairforce.cdac.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'Indian Air Force invites commissioned officer applications for Flying Branch and Ground Duty (Technical and Non-Technical) Branches through AFCAT.',
    officialSummary:
      'Air Force Common Admission Test (AFCAT - 01/2027) for grant of Short Service Commission (SSC) in Flying and Ground Duty Branches.',
    eligibilityCriteria: {
      education: [
        'Flying Branch: 10+2 with 50% in Maths and Physics, plus Graduate (3 years) with min 60% or B.E./B.Tech (4 years) with min 60%.',
        'Ground Duty (Technical): 10+2 with 50% in Maths & Physics, plus 4 years Engineering degree.',
        'Ground Duty (Non-Technical): Graduate in any discipline with min 60% marks.',
      ],
      ageLimit: {
        min: 20,
        max: 26,
        description: 'Flying: 20 to 24 years; Ground Duty: 20 to 26 years.',
      },
    },
    applicationFee: {
      generalOBC: '₹550 + GST (Online examination fee)',
      scStFemale: '₹550 + GST (Universal registration charge for AFCAT)',
      paymentMode: 'Payment gateway through Credit Card, Debit Card, Net Banking.',
    },
    importantDates: {
      startDate: '2026-11-10',
      lastDate: '2026-12-15',
      examDate: 'February 2027 (Online Computer Test across designated centres)',
      admitCardDate: 'Last week of January 2027',
    },
    selectionProcess: [
      'Online AFCAT Exam (General Awareness, Verbal Ability, Numerical Ability, Reasoning)',
      'Air Force Selection Board (AFSB) 5-day interview: Stage 1 (Screening) & Stage 2 (Psychological tests, Group Tests, Interview)',
      'Computerised Pilot Selection System (CPSS) for Flying branch',
      'Medical Examination at Designated Air Force Medical Establishments',
    ],
    salary: {
      payScale: 'Level 10 (₹56,100 - ₹1,77,500) with Military Service Pay (MSP) of ₹15,500/month',
      inHandEstimate: '₹95,000 – ₹1,20,000/month (Flying allowances extra)',
      officialDetails:
        'Commissioned Officers are placed in Pay Level 10 of the Defence Pay Matrix. Stipend during training is ₹56,100/month at Air Force Academy, Dundigal.',
    },
    featured: true,
  },

  // ─── 7. Central Government: Intelligence Bureau ACIO Grade-II ──────────────
  {
    id: 'ib-acio-grade-2-2026',
    slug: 'intelligence-bureau-acio-grade-ii-executive-2026',
    title: 'Assistant Central Intelligence Officer (ACIO Grade-II / Executive)',
    organization: 'Intelligence Bureau (Ministry of Home Affairs)',
    shortOrg: 'IB (MHA)',
    department: 'Ministry of Home Affairs, Government of India',
    category: 'central-government',
    qualification: 'Graduation or equivalent from a recognized University, with basic computer proficiency',
    vacancies: 995,
    location: 'All India (Liable to be posted anywhere in the country)',
    startDate: '2026-10-18',
    lastDate: '2026-11-19',
    officialNotificationUrl: 'https://www.mha.gov.in',
    officialApplyUrl: 'https://cdn.digialm.com/EForms/configuredHtml/1258/86290/Index.html',
    sourceUrl: 'https://www.mha.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'Intelligence Bureau invites applications for Assistant Central Intelligence Officer Grade-II/Executive. This is a premier intelligence gathering and national security career under the Ministry of Home Affairs.',
    officialSummary:
      'Online applications are invited from Indian nationals for direct recruitment to the post of ACIO-II/Exe in Intelligence Bureau, Ministry of Home Affairs, Government of India.',
    eligibilityCriteria: {
      education: ['Graduation or equivalent from a recognized University.', 'Knowledge of Computers is desirable.'],
      ageLimit: {
        min: 18,
        max: 27,
        description: 'Candidate must be between 18 and 27 years as on closing date.',
        relaxationRules: 'Upper age limit relaxable by 5 years for SC/ST, 3 years for OBC.',
      },
    },
    applicationFee: {
      generalOBC: '₹450 (Recruitment processing charges ₹350 + Examination fee ₹100)',
      scStFemale: '₹350 (Exempted from Exam fee of ₹100, pays processing charges)',
      paymentMode: 'Online through State Bank of India Multi Option Payment System (MOPS).',
    },
    importantDates: {
      startDate: '2026-10-18',
      lastDate: '2026-11-19',
      examDate: 'Tier-I: January 2027',
      admitCardDate: '10 days before written exam',
    },
    selectionProcess: [
      'Tier-I Exam (100 Marks: Current Affairs, General Studies, Numerical Aptitude, Reasoning, English)',
      'Tier-II Descriptive Exam (50 Marks: Essay, English Comprehension & Precis Writing)',
      'Tier-III / Interview (100 Marks) & Character / Antecedents Verification',
    ],
    salary: {
      payScale: 'Level 7 (₹44,900 - ₹1,42,400) in the Pay Matrix plus Special Security Allowance of 20% of basic pay',
      inHandEstimate: '₹72,000 – ₹84,000/month',
      officialDetails:
        'Officers receive 20% Special Security Allowance over and above basic pay and normal Central Government allowances.',
    },
    featured: true,
  },

  // ─── 8. Admit Card: UPSC Civil Services Prelims 2026 ────────────────────────
  {
    id: 'upsc-cse-admit-card-2026',
    slug: 'upsc-civil-services-prelims-admit-card-2026',
    title: 'UPSC Civil Services (Preliminary) Examination Admit Card',
    organization: 'Union Public Service Commission',
    shortOrg: 'UPSC',
    department: 'Examination Branch',
    category: 'admit-cards',
    qualification: 'Registered Candidates for UPSC CSE 2026',
    vacancies: 1056,
    location: 'All India Test Centers',
    startDate: '2026-11-01',
    lastDate: '2026-12-30',
    officialNotificationUrl: 'https://upsc.gov.in/e-admit-cards',
    officialApplyUrl: 'https://upsconline.nic.in/eadmitcard/sub_admitcard.php',
    sourceUrl: 'https://upsc.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'Download the official e-Admit Card for the UPSC Civil Services Preliminary Examination. Candidates must bring a printed copy of the e-Admit Card along with the original Photo ID card entered in the application form.',
    officialSummary:
      'Notice: The Union Public Service Commission has released the e-Admit Cards for the Civil Services (Preliminary) Examination. Candidates can download using their Registration ID or Roll Number.',
    eligibilityCriteria: {
      education: ['Registered applicants with accepted candidature for CSE 2026.'],
      ageLimit: {
        description: 'As per Civil Services Exam 2026 rules.',
      },
    },
    importantDates: {
      startDate: '2026-11-01',
      lastDate: '2026-12-30',
      examDate: 'Check date mentioned on e-Admit card',
      admitCardDate: 'Available for Download Now',
    },
    selectionProcess: ['Preliminary Objective Exam -> Main Written -> Interview'],
    salary: {
      officialDetails: 'Applies to final appointments in Level 10 of Pay Matrix.',
    },
    isAdmitCard: true,
    featured: false,
  },

  // ─── 9. Results: SSC Combined Graduate Level (CGL) Tier-I Final Result ──────
  {
    id: 'ssc-cgl-tier-1-results-2026',
    slug: 'ssc-cgl-tier-1-exam-results-merit-list-2026',
    title: 'SSC CGL Tier-I Written Exam Results & Cut-off Marks',
    organization: 'Staff Selection Commission',
    shortOrg: 'SSC',
    department: 'Confidential Examination Cell',
    category: 'results',
    qualification: 'Candidates who appeared in SSC CGL Tier-I Examination',
    vacancies: 17727,
    location: 'All India',
    startDate: '2026-10-01',
    lastDate: '2026-12-31',
    officialNotificationUrl: 'https://ssc.gov.in/api/results',
    officialApplyUrl: 'https://ssc.gov.in',
    sourceUrl: 'https://ssc.gov.in',
    lastVerifiedDate: '2026-11-14',
    overview:
      'Staff Selection Commission has announced the official results and category-wise cut-off marks for the Combined Graduate Level (CGL) Tier-I Examination. Qualified candidates are shortlisted for Tier-II.',
    officialSummary:
      'Declaration of Result of Combined Graduate Level Examination (Tier-I): Candidates have been shortlisted category-wise for appearing in Tier-II Examination based on marks scored in Tier-I.',
    eligibilityCriteria: {
      education: ['Appeared candidates in Tier-I computer based test.'],
      ageLimit: {
        description: 'As specified in original recruitment notification.',
      },
    },
    importantDates: {
      startDate: '2026-10-01',
      lastDate: '2026-12-31',
      resultDate: 'Announced & Active on official portal',
    },
    selectionProcess: ['Tier-I Result Declaration -> Tier-II CBT Examination'],
    salary: {
      officialDetails: 'Pay Level 4 to Level 8 depending upon allocated post.',
    },
    isResult: true,
    featured: false,
  },
];

