// In-memory / LocalStorage stateful database manager to act as a fallback 
// when Firebase services are offline or not fully configured in the local workspace.
// Seamlessly delegates to Firestore when available.

import { db } from './config';
import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, 
  addDoc
} from 'firebase/firestore';

export interface StudentData {
  uid: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  gradYear: number;
  skills: string[];
  certifications: string[];
  projects: Array<{ title: string; desc: string; link?: string }>;
  resumeUrl?: string;
  resumeFileName?: string;
  photoUrl?: string;
  phone?: string;
}

export interface CompanyData {
  uid: string;
  name: string;
  email: string;
  website: string;
  industry: string;
  description: string;
  logoUrl?: string;
  isApproved?: boolean;
}

export interface JobOpening {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  type: 'Full-Time' | 'Internship';
  description: string;
  packageAmt: string; // package amount e.g. "12 LPA", "40k/month"
  eligibility: {
    minCGPA: number;
    branches: string[]; // e.g. ["CSE", "ECE", "IT"]
    gradYears: number[]; // e.g. [2026, 2027]
  };
  skillsRequired: string[];
  deadline: string;
  createdAt: string;
  applicantsCount: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentBranch: string;
  studentCGPA: number;
  studentResumeUrl?: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected';
  appliedAt: string;
  statusNotes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Check if Firebase Firestore is connected / ready
const checkFirestore = async (): Promise<boolean> => {
  try {
    // Quick probe check
    await getDoc(doc(db, 'system_test_probe_abc123', 'probe'));
    return true;
  } catch (e: any) {
    // If it's a permission/network issue, fail gracefully to mock
    return false;
  }
};

// INITIAL MOCK DATA SEED
const DEFAULT_STUDENTS: StudentData[] = [
  {
    uid: 'mock-student-id',
    name: 'Aravind Sharma',
    email: 'student-demo@test.com',
    branch: 'CSE',
    cgpa: 9.1,
    gradYear: 2026,
    skills: ['React', 'TypeScript', 'Node.js', 'Firebase', 'Python'],
    certifications: ['AWS Certified Cloud Practitioner', 'Google Cloud Associate Engineer'],
    projects: [
      { title: 'AI Placement Bot', desc: 'A Slack chatbot that extracts resume skills using LLMs.' },
      { title: 'E-Commerce Platform', desc: 'Next.js application featuring global state, Stripe, and Redis cache.' }
    ],
    resumeFileName: 'Aravind_Sharma_Resume.pdf',
    phone: '9876543210'
  },
  {
    uid: 'student-2',
    name: 'Priyanka Patel',
    email: 'priyanka@test.com',
    branch: 'ECE',
    cgpa: 8.5,
    gradYear: 2026,
    skills: ['C++', 'Embedded Systems', 'Verilog', 'Python'],
    certifications: ['Certified Embedded Systems Specialist'],
    projects: [
      { title: 'IoT Weather Station', desc: 'ESP32 based weather station that logs temperature, pressure to Cloud.' }
    ],
    resumeFileName: 'Priyanka_Patel_Resume.pdf',
    phone: '9876500123'
  },
  {
    uid: 'student-3',
    name: 'Rohan Mehra',
    email: 'rohan@test.com',
    branch: 'IT',
    cgpa: 7.2,
    gradYear: 2026,
    skills: ['Java', 'Spring Boot', 'MySQL', 'JavaScript'],
    certifications: ['Oracle Certified Java Associate'],
    projects: [
      { title: 'Employee Portal', desc: 'Full stack enterprise spring boot CRUD system.' }
    ],
    resumeFileName: 'Rohan_Mehra_Resume.pdf',
    phone: '9876500456'
  }
];

const DEFAULT_COMPANIES: CompanyData[] = [
  {
    uid: 'mock-hr-id',
    name: 'Google India',
    email: 'hr-demo@test.com',
    website: 'https://google.co.in',
    industry: 'Technology',
    description: 'Google is a global tech leader specializing in search engine, cloud, hardware, software, and AI systems.',
    isApproved: true
  },
  {
    uid: 'company-microsoft',
    name: 'Microsoft India',
    email: 'hr-microsoft@test.com',
    website: 'https://microsoft.com',
    industry: 'Technology',
    description: 'Empowering every person and organization on the planet to achieve more.',
    isApproved: true
  },
  {
    uid: 'company-tata',
    name: 'TCS',
    email: 'hr-tcs@test.com',
    website: 'https://tcs.com',
    industry: 'IT Services',
    description: 'A global IT service, consulting, and business solutions organization partners with largest businesses.',
    isApproved: true
  },
  {
    uid: 'company-amazon',
    name: 'Amazon India',
    email: 'hr-amazon@test.com',
    website: 'https://amazon.in',
    industry: 'Cloud & E-Commerce',
    description: 'Earth\'s most customer-centric company and cloud computing innovator (AWS).',
    isApproved: true
  },
  {
    uid: 'company-goldman',
    name: 'Goldman Sachs',
    email: 'hr-goldman@test.com',
    website: 'https://goldmansachs.com',
    industry: 'FinTech & Banking',
    description: 'Global investment banking, securities and investment management firm.',
    isApproved: true
  }
];

const DEFAULT_JOBS: JobOpening[] = [
  {
    id: 'job-1',
    companyId: 'mock-hr-id',
    companyName: 'Google India',
    title: 'Associate Software Engineer',
    type: 'Full-Time',
    description: 'Join the Google Core Infrastructure engineering team. You will write high-performance C++ and Go microservices, design scalable APIs, and work on cluster resource scheduling configurations.',
    packageAmt: '32 LPA',
    eligibility: {
      minCGPA: 8.0,
      branches: ['CSE', 'IT'],
      gradYears: [2026]
    },
    skillsRequired: ['C++', 'Go', 'Data Structures & Algorithms', 'System Design'],
    deadline: '2026-08-30',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applicantsCount: 3
  },
  {
    id: 'job-2',
    companyId: 'mock-hr-id',
    companyName: 'Google India',
    title: 'Cloud DevOps Intern',
    type: 'Internship',
    description: 'Help manage and automate massive Kubernetes clusters. Work closely with Site Reliability Engineers (SREs) to implement automated CI/CD pipelines, configure Terraform, and design monitoring dashboards using Prometheus.',
    packageAmt: '75k / month',
    eligibility: {
      minCGPA: 7.5,
      branches: ['CSE', 'IT', 'ECE'],
      gradYears: [2026, 2027]
    },
    skillsRequired: ['Linux', 'Docker', 'Kubernetes', 'Python', 'Terraform'],
    deadline: '2026-08-15',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicantsCount: 1
  },
  {
    id: 'job-3',
    companyId: 'company-microsoft',
    companyName: 'Microsoft India',
    title: 'Software Development Engineer (SDE-1)',
    type: 'Full-Time',
    description: 'Build enterprise-grade SaaS products within Microsoft Azure. Focus on writing clean C# backend APIs, developing responsive React client-side dashboards, and managing high-throughput SQL server schemas.',
    packageAmt: '28 LPA',
    eligibility: {
      minCGPA: 7.8,
      branches: ['CSE', 'IT', 'ECE'],
      gradYears: [2026]
    },
    skillsRequired: ['C#', '.NET', 'React', 'TypeScript', 'SQL Server'],
    deadline: '2026-09-05',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicantsCount: 2
  },
  {
    id: 'job-4',
    companyId: 'company-tata',
    companyName: 'TCS',
    title: 'Systems Engineer',
    type: 'Full-Time',
    description: 'Work on diverse client engagements across retail, healthcare, and finance domains. Responsibilities include system migration, SQL reporting, Java server support, and deployment orchestration.',
    packageAmt: '4.5 LPA',
    eligibility: {
      minCGPA: 6.0,
      branches: ['CSE', 'IT', 'ECE', 'EE', 'ME'],
      gradYears: [2026]
    },
    skillsRequired: ['Java', 'SQL', 'HTML/CSS', 'SDLC Basics'],
    deadline: '2026-10-01',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    applicantsCount: 2
  },
  {
    id: 'job-5',
    companyId: 'company-amazon',
    companyName: 'Amazon India',
    title: 'AWS Cloud Solutions Intern',
    type: 'Internship',
    description: 'Work with cloud enterprise architects to design high-availability AWS serverless applications using Lambda, DynamoDB, API Gateway, and CloudFront.',
    packageAmt: '80k / month',
    eligibility: {
      minCGPA: 8.2,
      branches: ['CSE', 'IT'],
      gradYears: [2026]
    },
    skillsRequired: ['AWS', 'Node.js', 'Python', 'Cloud Architecture'],
    deadline: '2026-08-20',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    applicantsCount: 1
  },
  {
    id: 'job-6',
    companyId: 'company-goldman',
    companyName: 'Goldman Sachs',
    title: 'Quantitative Systems Analyst',
    type: 'Full-Time',
    description: 'Develop low-latency algorithmic trading systems and risk calculation microservices in C++20 and Python for high-frequency trading desks.',
    packageAmt: '36 LPA',
    eligibility: {
      minCGPA: 8.5,
      branches: ['CSE', 'IT', 'ECE'],
      gradYears: [2026]
    },
    skillsRequired: ['C++', 'Algorithms', 'Linear Algebra', 'Python'],
    deadline: '2026-09-15',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    applicantsCount: 1
  }
];

const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Associate Software Engineer',
    companyId: 'mock-hr-id',
    companyName: 'Google India',
    studentId: 'mock-student-id',
    studentName: 'Aravind Sharma',
    studentBranch: 'CSE',
    studentCGPA: 9.1,
    status: 'Shortlisted',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Passed resume screening. Technical Round 1 interview scheduled.'
  },
  {
    id: 'app-2',
    jobId: 'job-5',
    jobTitle: 'AWS Cloud Solutions Intern',
    companyId: 'company-amazon',
    companyName: 'Amazon India',
    studentId: 'mock-student-id',
    studentName: 'Aravind Sharma',
    studentBranch: 'CSE',
    studentCGPA: 9.1,
    status: 'Rejected',
    appliedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Application evaluation complete. Candidate profile lacks requisite hands-on Kubernetes cluster administration & Terraform IaC credentials.'
  },
  {
    id: 'app-3',
    jobId: 'job-6',
    jobTitle: 'Quantitative Systems Analyst',
    companyId: 'company-goldman',
    companyName: 'Goldman Sachs',
    studentId: 'mock-student-id',
    studentName: 'Aravind Sharma',
    studentBranch: 'CSE',
    studentCGPA: 9.1,
    status: 'Rejected',
    appliedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Profile review complete. Looking for specialized Financial Engineering or Stochastic Math degree specialization.'
  },
  {
    id: 'app-4',
    jobId: 'job-3',
    jobTitle: 'Software Development Engineer (SDE-1)',
    companyId: 'company-microsoft',
    companyName: 'Microsoft India',
    studentId: 'mock-student-id',
    studentName: 'Aravind Sharma',
    studentBranch: 'CSE',
    studentCGPA: 9.1,
    status: 'Interview Scheduled',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'System Design Interview scheduled for next Monday at 2:00 PM IST.'
  },
  {
    id: 'app-5',
    jobId: 'job-3',
    jobTitle: 'Software Development Engineer (SDE-1)',
    companyId: 'company-microsoft',
    companyName: 'Microsoft India',
    studentId: 'student-2',
    studentName: 'Priyanka Patel',
    studentBranch: 'ECE',
    studentCGPA: 8.5,
    status: 'Under Review',
    appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Under review by Engineering Hiring Manager.'
  },
  {
    id: 'app-6',
    jobId: 'job-1',
    jobTitle: 'Associate Software Engineer',
    companyId: 'mock-hr-id',
    companyName: 'Google India',
    studentId: 'student-2',
    studentName: 'Priyanka Patel',
    studentBranch: 'ECE',
    studentCGPA: 8.5,
    status: 'Rejected',
    appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Did not meet the core Computer Science Engineering / IT stream criteria specified for this opening track.'
  },
  {
    id: 'app-7',
    jobId: 'job-4',
    jobTitle: 'Systems Engineer',
    companyId: 'company-tata',
    companyName: 'TCS',
    studentId: 'student-3',
    studentName: 'Rohan Mehra',
    studentBranch: 'IT',
    studentCGPA: 7.2,
    status: 'Selected',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Congratulations! Official placement offer letter released via email.'
  },
  {
    id: 'app-8',
    jobId: 'job-1',
    jobTitle: 'Associate Software Engineer',
    companyId: 'mock-hr-id',
    companyName: 'Google India',
    studentId: 'student-3',
    studentName: 'Rohan Mehra',
    studentBranch: 'IT',
    studentCGPA: 7.2,
    status: 'Rejected',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    statusNotes: 'Candidate CGPA (7.2) is below the mandatory minimum CGPA threshold (8.0) set by recruiter.'
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'mock-student-id',
    title: 'Application Status Updated',
    message: 'Your application for AWS Cloud Solutions Intern at Amazon India status: Rejected. Feedback: Missing Kubernetes experience.',
    read: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'mock-student-id',
    title: 'Interview Scheduled!',
    message: 'Microsoft India scheduled your interview for Software Development Engineer (SDE-1) for Monday 2:00 PM IST.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'mock-student-id',
    title: 'Resume Shortlisted',
    message: 'Your application for Associate Software Engineer at Google India has been Shortlisted! Check details.',
    read: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-4',
    userId: 'mock-student-id',
    title: 'New Job Drive Posted',
    message: 'Google India just posted a new opening: Cloud DevOps Intern. Click to apply!',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to load/save from localStorage
const loadData = <T>(key: string, defaultVal: T[]): T[] => {
  const data = localStorage.getItem(`cpp_${key}`);
  if (!data) {
    localStorage.setItem(`cpp_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  
  // If applications array in local storage lacks rejected items for mock student, force update defaults
  if (key === 'applications') {
    try {
      const parsed = JSON.parse(data) as JobApplication[];
      const hasRejected = parsed.some(a => a.status === 'Rejected');
      if (!hasRejected) {
        localStorage.setItem(`cpp_${key}`, JSON.stringify(defaultVal));
        return defaultVal;
      }
    } catch (e) {
      localStorage.setItem(`cpp_${key}`, JSON.stringify(defaultVal));
      return defaultVal;
    }
  }

  return JSON.parse(data);
};

const saveData = <T>(key: string, val: T[]) => {
  localStorage.setItem(`cpp_${key}`, JSON.stringify(val));
};

// Database Services API wrapper
export const dbMock = {
  // STUDENTS CRUD
  async getStudents(): Promise<StudentData[]> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        const snap = await getDocs(collection(db, 'students'));
        return snap.docs.map(doc => doc.data() as StudentData);
      } catch (e) {
        console.error("Firestore read fallback to mock", e);
      }
    }
    return loadData<StudentData>('students', DEFAULT_STUDENTS);
  },

  async getStudent(uid: string): Promise<StudentData | null> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        const docSnap = await getDoc(doc(db, 'students', uid));
        if (docSnap.exists()) return docSnap.data() as StudentData;
      } catch (e) {
        console.error(e);
      }
    }
    const list = loadData<StudentData>('students', DEFAULT_STUDENTS);
    return list.find(s => s.uid === uid) || null;
  },

  async saveStudent(profile: StudentData): Promise<void> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        await setDoc(doc(db, 'students', profile.uid), profile);
        // Also update users role info matching this user
        await updateDoc(doc(db, 'users', profile.uid), { name: profile.name });
        return;
      } catch (e) {
        console.error(e);
      }
    }
    const list = loadData<StudentData>('students', DEFAULT_STUDENTS);
    const index = list.findIndex(s => s.uid === profile.uid);
    if (index > -1) {
      list[index] = profile;
    } else {
      list.push(profile);
    }
    saveData('students', list);
  },

  // COMPANIES CRUD
  async getCompanies(): Promise<CompanyData[]> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        const snap = await getDocs(collection(db, 'companies'));
        return snap.docs.map(doc => doc.data() as CompanyData);
      } catch (e) {
        console.error(e);
      }
    }
    return loadData<CompanyData>('companies', DEFAULT_COMPANIES);
  },

  async getCompany(uid: string): Promise<CompanyData | null> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        const docSnap = await getDoc(doc(db, 'companies', uid));
        if (docSnap.exists()) return docSnap.data() as CompanyData;
      } catch (e) {
        console.error(e);
      }
    }
    const list = loadData<CompanyData>('companies', DEFAULT_COMPANIES);
    return list.find(c => c.uid === uid) || null;
  },

  async saveCompany(profile: CompanyData): Promise<void> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        await setDoc(doc(db, 'companies', profile.uid), profile);
        await updateDoc(doc(db, 'users', profile.uid), { name: profile.name });
        return;
      } catch (e) {
        console.error(e);
      }
    }
    const list = loadData<CompanyData>('companies', DEFAULT_COMPANIES);
    const index = list.findIndex(c => c.uid === profile.uid);
    if (index > -1) {
      list[index] = profile;
    } else {
      list.push(profile);
    }
    saveData('companies', list);
  },

  // JOBS CRUD
  async getJobs(): Promise<JobOpening[]> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        const snap = await getDocs(collection(db, 'jobs'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobOpening));
      } catch (e) {
        console.error(e);
      }
    }
    return loadData<JobOpening>('jobs', DEFAULT_JOBS);
  },

  async addJob(job: Omit<JobOpening, 'id' | 'createdAt' | 'applicantsCount'>): Promise<void> {
    const isConnected = await checkFirestore();
    const newJob: JobOpening = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      applicantsCount: 0
    };

    if (isConnected) {
      try {
        await addDoc(collection(db, 'jobs'), newJob);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    const list = loadData<JobOpening>('jobs', DEFAULT_JOBS);
    list.unshift(newJob);
    saveData('jobs', list);

    // Create notifications for all students eligible
    const students = loadData<StudentData>('students', DEFAULT_STUDENTS);
    students.forEach(s => {
      // Check eligibility
      const meetsCGPA = s.cgpa >= newJob.eligibility.minCGPA;
      const meetsBranch = newJob.eligibility.branches.includes(s.branch);
      const meetsGradYear = newJob.eligibility.gradYears.includes(s.gradYear);

      if (meetsCGPA && meetsBranch && meetsGradYear) {
        this.addNotification(
          s.uid,
          'New Eligible Job Drive!',
          `${newJob.companyName} is hiring for ${newJob.title} (${newJob.packageAmt}). Apply now!`
        );
      }
    });
  },

  async updateJob(jobId: string, updates: Partial<JobOpening>): Promise<void> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        await updateDoc(doc(db, 'jobs', jobId), updates);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    const list = loadData<JobOpening>('jobs', DEFAULT_JOBS);
    const index = list.findIndex(j => j.id === jobId);
    if (index > -1) {
      list[index] = { ...list[index], ...updates };
      saveData('jobs', list);
    }
  },

  // APPLICATIONS CRUD
  async getApplications(): Promise<JobApplication[]> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        const snap = await getDocs(collection(db, 'applications'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
      } catch (e) {
        console.error(e);
      }
    }
    return loadData<JobApplication>('applications', DEFAULT_APPLICATIONS);
  },

  async applyForJob(studentId: string, jobId: string): Promise<void> {
    const student = await this.getStudent(studentId);
    const jobs = loadData<JobOpening>('jobs', DEFAULT_JOBS);
    const job = jobs.find(j => j.id === jobId);

    if (!student || !job) {
      throw new Error('Student or Job record not found.');
    }

    const apps = loadData<JobApplication>('applications', DEFAULT_APPLICATIONS);
    
    // Check if already applied
    const alreadyApplied = apps.some(a => a.studentId === studentId && a.jobId === jobId);
    if (alreadyApplied) {
      throw new Error('You have already applied for this position.');
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      studentId: student.uid,
      studentName: student.name,
      studentBranch: student.branch,
      studentCGPA: student.cgpa,
      studentResumeUrl: student.resumeUrl || '',
      status: 'Applied',
      appliedAt: new Date().toISOString()
    };

    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        await addDoc(collection(db, 'applications'), newApp);
        // increment job applicants count
        await updateDoc(doc(db, 'jobs', jobId), { applicantsCount: (job.applicantsCount || 0) + 1 });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    apps.unshift(newApp);
    saveData('applications', apps);

    // Increment applicant count in local job store
    const jobIdx = jobs.findIndex(j => j.id === jobId);
    if (jobIdx > -1) {
      jobs[jobIdx].applicantsCount = (jobs[jobIdx].applicantsCount || 0) + 1;
      saveData('jobs', jobs);
    }

    // Add TPO / HR notifications
    this.addNotification(
      job.companyId,
      'New Applicant Received',
      `${student.name} (${student.branch}) has applied for ${job.title}.`
    );
  },

  async updateApplicationStatus(appId: string, status: JobApplication['status'], notes?: string): Promise<void> {
    const isConnected = await checkFirestore();
    if (isConnected) {
      try {
        await updateDoc(doc(db, 'applications', appId), { status, statusNotes: notes || '' });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    const apps = loadData<JobApplication>('applications', DEFAULT_APPLICATIONS);
    const idx = apps.findIndex(a => a.id === appId);
    if (idx > -1) {
      const app = apps[idx];
      apps[idx] = { ...app, status, statusNotes: notes || '' };
      saveData('applications', apps);

      // Notify Student
      this.addNotification(
        app.studentId,
        `Application Status Update`,
        `Your application for ${app.jobTitle} at ${app.companyName} is now: ${status}. ${notes ? `Notes: ${notes}` : ''}`
      );
    }
  },

  // NOTIFICATIONS
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const list = loadData<NotificationItem>('notifications', DEFAULT_NOTIFICATIONS);
    return list.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addNotification(userId: string, title: string, message: string): void {
    const list = loadData<NotificationItem>('notifications', DEFAULT_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    saveData('notifications', list);
  },

  async markNotificationAsRead(notifId: string): Promise<void> {
    const list = loadData<NotificationItem>('notifications', DEFAULT_NOTIFICATIONS);
    const idx = list.findIndex(n => n.id === notifId);
    if (idx > -1) {
      list[idx].read = true;
      saveData('notifications', list);
    }
  },

  // SYSTEM STATS / TPO ANALYTICS
  async getTPOAnalytics() {
    const students = loadData<StudentData>('students', DEFAULT_STUDENTS);
    const apps = loadData<JobApplication>('applications', DEFAULT_APPLICATIONS);
    const jobs = loadData<JobOpening>('jobs', DEFAULT_JOBS);
    const companies = loadData<CompanyData>('companies', DEFAULT_COMPANIES);

    // Calculate Placement Percentage
    const selectedApps = apps.filter(a => a.status === 'Selected');
    const uniquelySelectedStudents = new Set(selectedApps.map(a => a.studentId));
    const totalStudentsCount = students.length || 1;
    const placementRate = Math.round((uniquelySelectedStudents.size / totalStudentsCount) * 100);

    // Branch-wise placement details
    const branchStats: Record<string, { total: number; placed: number }> = {};
    students.forEach(s => {
      if (!branchStats[s.branch]) {
        branchStats[s.branch] = { total: 0, placed: 0 };
      }
      branchStats[s.branch].total += 1;
      const isPlaced = selectedApps.some(a => a.studentId === s.uid);
      if (isPlaced) {
        branchStats[s.branch].placed += 1;
      }
    });

    const branchChartData = Object.keys(branchStats).map(b => ({
      branch: b,
      total: branchStats[b].total,
      placed: branchStats[b].placed,
      percentage: Math.round((branchStats[b].placed / branchStats[b].total) * 100)
    }));

    // Company placement numbers
    const companyHiring: Record<string, number> = {};
    selectedApps.forEach(a => {
      companyHiring[a.companyName] = (companyHiring[a.companyName] || 0) + 1;
    });
    const companyChartData = Object.keys(companyHiring).map(c => ({
      company: c,
      offers: companyHiring[c]
    }));

    // Packages metrics
    const parsePackage = (pkg: string): number => {
      const match = pkg.match(/([\d.]+)\s*LPA/i);
      if (match) return parseFloat(match[1]);
      const intp = pkg.match(/([\d.]+)\s*k\s*\/\s*month/i);
      if (intp) return (parseFloat(intp[1]) * 12) / 100; // rough convert k/month to LPA
      return 4.0; // default lower bounds
    };

    const packagesList = jobs.map(j => parsePackage(j.packageAmt));
    const highestPkg = Math.max(...packagesList, 0);
    const averagePkg = Math.round((packagesList.reduce((acc, v) => acc + v, 0) / (packagesList.length || 1)) * 10) / 10;

    // Package distributions buckets
    // 0-6 LPA, 6-12 LPA, 12-20 LPA, 20+ LPA
    const packagesBuckets = [
      { range: '0-6 LPA', count: jobs.filter(j => parsePackage(j.packageAmt) < 6).length },
      { range: '6-12 LPA', count: jobs.filter(j => parsePackage(j.packageAmt) >= 6 && parsePackage(j.packageAmt) < 12).length },
      { range: '12-20 LPA', count: jobs.filter(j => parsePackage(j.packageAmt) >= 12 && parsePackage(j.packageAmt) < 20).length },
      { range: '20+ LPA', count: jobs.filter(j => parsePackage(j.packageAmt) >= 20).length }
    ];

    return {
      totalStudents: students.length,
      totalCompanies: companies.length,
      totalJobs: jobs.length,
      totalApplications: apps.length,
      placedCount: uniquelySelectedStudents.size,
      placementRate,
      highestPackage: highestPkg ? `${highestPkg} LPA` : 'N/A',
      averagePackage: averagePkg ? `${averagePkg} LPA` : 'N/A',
      branchChartData,
      companyChartData,
      packagesBuckets,
      monthlyPlacements: [
        { month: 'Jan', count: 1 },
        { month: 'Feb', count: 2 },
        { month: 'Mar', count: 4 },
        { month: 'Apr', count: 6 },
        { month: 'May', count: 9 },
        { month: 'Jun', count: 14 }
      ]
    };
  }
};
