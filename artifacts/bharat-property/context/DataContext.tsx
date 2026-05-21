import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TxStage } from "@/components/TransactionStageTracker";

export interface Property {
  id: string;
  bpid: string;
  type: "flat" | "land" | "commercial";
  address: string;
  area: string;
  value: number;
  status: "verified" | "under_review" | "disputed" | "frozen";
  ownerId: string;
  ownerName: string;
  registrationDate: string;
  documents: Document[];
  loanStatus?: "none" | "active" | "pending" | "closed";
  loanAmount?: number;
  loanBank?: string;
}

export interface Document {
  id: string;
  propertyId: string;
  docType: string;
  fileUrl: string;
  verifiedStatus: "verified" | "pending" | "rejected";
  uploadedOn: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  bpid: string;
  propertyAddress: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  status: "initiated" | "verifying" | "approved" | "completed" | "rejected";
  stage: TxStage;
  escrowStatus: "held" | "released" | "pending";
  initiatedOn: string;
  completedOn?: string;
  cpfId?: string;
  cpfName?: string;
  stageHistory: { stage: TxStage; label: string; timestamp: string; actor: string }[];
}

export interface Project {
  id: string;
  bbid: string;
  developerId: string;
  developerName: string;
  name: string;
  location: string;
  approvalStatus: "pending" | "approved" | "rejected" | "under_review";
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  completionDate: string;
  price: number;
}

export interface Unit {
  id: string;
  unitId: string;
  projectId: string;
  projectName: string;
  type: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "studio" | "commercial";
  size: number;
  price: number;
  floor: number;
  status: "available" | "booked" | "sold";
  ownerId?: string;
  ownerName?: string;
}

export interface Loan {
  id: string;
  propertyId: string;
  bpid: string;
  propertyAddress: string;
  applicantId: string;
  applicantName: string;
  bankId: string;
  bankName: string;
  amount: number;
  tenure: number;
  interestRate: number;
  status: "pending" | "under_review" | "approved" | "rejected" | "active" | "closed";
  appliedOn: string;
  approvedOn?: string;
  emiAmount?: number;
  tracker?: {
    bankSubmitted: boolean;
    bankCalled: boolean;
    docsRequested: boolean;
    kycComplete: boolean;
    verifiedAccounts?: string[];
    recommendedBank?: string;
    notes?: string;
  };
}

export interface Dispute {
  id: string;
  propertyId: string;
  bpid: string;
  propertyAddress: string;
  raisedBy: string;
  raisedByName: string;
  caseDetails: string;
  status: "open" | "under_review" | "resolved" | "frozen";
  raisedOn: string;
  assignedOfficer?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata: string;
  propertyId?: string;
}

interface DataContextType {
  properties: Property[];
  transactions: Transaction[];
  projects: Project[];
  units: Unit[];
  loans: Loan[];
  disputes: Dispute[];
  auditLogs: AuditLog[];
  liveSimulationTxId: string | null;
  addProperty: (property: Property) => void;
  updatePropertyStatus: (id: string, status: Property["status"]) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (id: string, status: Transaction["status"]) => void;
  advanceTransactionStage: (id: string) => void;
  startLiveSimulation: (txId: string) => void;
  stopLiveSimulation: () => void;
  addLoan: (loan: Loan) => void;
  updateLoanStatus: (id: string, status: Loan["status"]) => void;
  addDispute: (dispute: Dispute) => void;
  updateDisputeStatus: (id: string, status: Dispute["status"]) => void;
  addAuditLog: (log: Omit<AuditLog, "id">) => void;
}

const INITIAL_PROPERTIES: Property[] = [
  {
    id: "p1",
    bpid: "B-PID-MH-2024-001",
    type: "flat",
    address: "Flat 4B, Sunshine Residency, Andheri West, Mumbai - 400053",
    area: "1200 sq ft",
    value: 15000000,
    status: "verified",
    ownerId: "USR001",
    ownerName: "Rajesh Kumar Sharma",
    registrationDate: "2021-06-15",
    loanStatus: "active",
    loanAmount: 9000000,
    loanBank: "State Bank of India",
    documents: [
      { id: "doc1", propertyId: "p1", docType: "Sale Deed", fileUrl: "sale_deed_001.pdf", verifiedStatus: "verified", uploadedOn: "2021-06-15" },
      { id: "doc2", propertyId: "p1", docType: "Encumbrance Certificate", fileUrl: "ec_001.pdf", verifiedStatus: "verified", uploadedOn: "2021-06-15" },
      { id: "doc3", propertyId: "p1", docType: "Property Tax Receipt", fileUrl: "tax_001.pdf", verifiedStatus: "pending", uploadedOn: "2024-01-10" },
    ],
  },
  {
    id: "p2",
    bpid: "B-PID-MH-2024-002",
    type: "land",
    address: "Survey No. 45/2, Thane Rural, Maharashtra - 421203",
    area: "2400 sq ft",
    value: 8500000,
    status: "under_review",
    ownerId: "USR001",
    ownerName: "Rajesh Kumar Sharma",
    registrationDate: "2019-03-22",
    loanStatus: "none",
    documents: [
      { id: "doc4", propertyId: "p2", docType: "7/12 Extract", fileUrl: "712_002.pdf", verifiedStatus: "verified", uploadedOn: "2019-03-22" },
      { id: "doc5", propertyId: "p2", docType: "Mutation Certificate", fileUrl: "mutation_002.pdf", verifiedStatus: "pending", uploadedOn: "2024-02-01" },
    ],
  },
  {
    id: "p3",
    bpid: "B-PID-DL-2024-003",
    type: "commercial",
    address: "Shop No. 12, DLF City Centre, Gurugram, Haryana - 122002",
    area: "800 sq ft",
    value: 22000000,
    status: "disputed",
    ownerId: "USR002",
    ownerName: "Priya Mehta",
    registrationDate: "2022-11-08",
    loanStatus: "none",
    documents: [
      { id: "doc6", propertyId: "p3", docType: "Sale Deed", fileUrl: "sale_deed_003.pdf", verifiedStatus: "verified", uploadedOn: "2022-11-08" },
    ],
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx1",
    propertyId: "p2",
    bpid: "B-PID-MH-2024-002",
    propertyAddress: "Survey No. 45/2, Thane Rural, Maharashtra",
    buyerId: "USR002",
    buyerName: "Priya Mehta",
    sellerId: "USR001",
    sellerName: "Rajesh Kumar Sharma",
    amount: 8500000,
    status: "verifying",
    stage: 3,
    escrowStatus: "held",
    initiatedOn: "2024-03-10",
    cpfId: "USR002",
    cpfName: "Priya Mehta",
    stageHistory: [
      { stage: 1, label: "Initiated", timestamp: "2024-03-10T09:15:00Z", actor: "Rajesh Kumar Sharma" },
      { stage: 2, label: "CPF Attached", timestamp: "2024-03-10T11:30:00Z", actor: "Priya Mehta (CPF Broker)" },
      { stage: 3, label: "Lawyer Review", timestamp: "2024-03-11T10:00:00Z", actor: "Adv. R. Krishnamurthy" },
    ],
  },
  {
    id: "tx2",
    propertyId: "p1",
    bpid: "B-PID-MH-2024-001",
    propertyAddress: "Flat 4B, Sunshine Residency, Andheri West, Mumbai",
    buyerId: "USR001",
    buyerName: "Rajesh Kumar Sharma",
    sellerId: "USR006",
    sellerName: "Vikram Patel",
    amount: 15000000,
    status: "completed",
    stage: 6,
    escrowStatus: "released",
    initiatedOn: "2021-05-01",
    completedOn: "2021-06-15",
    cpfId: "USR002",
    cpfName: "Priya Mehta",
    stageHistory: [
      { stage: 1, label: "Initiated", timestamp: "2021-05-01T09:00:00Z", actor: "Vikram Patel" },
      { stage: 2, label: "CPF Attached", timestamp: "2021-05-02T10:00:00Z", actor: "Priya Mehta (CPF Broker)" },
      { stage: 3, label: "Lawyer Review", timestamp: "2021-05-10T11:00:00Z", actor: "Adv. S. Pillai" },
      { stage: 4, label: "Bank Escrow", timestamp: "2021-05-20T14:00:00Z", actor: "SBI Home Loans" },
      { stage: 5, label: "Govt Approval", timestamp: "2021-06-10T10:00:00Z", actor: "Sub-Registrar K. Iyer" },
      { stage: 6, label: "Completed", timestamp: "2021-06-15T15:00:00Z", actor: "System" },
    ],
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj1",
    bbid: "B-BID-MH-2024-001",
    developerId: "USR003",
    developerName: "Amit Builders Pvt. Ltd.",
    name: "Emerald Heights",
    location: "Powai, Mumbai, Maharashtra",
    approvalStatus: "approved",
    totalUnits: 120,
    availableUnits: 45,
    soldUnits: 75,
    completionDate: "2026-12-31",
    price: 12500000,
  },
  {
    id: "proj2",
    bbid: "B-BID-PU-2024-002",
    developerId: "USR003",
    developerName: "Amit Builders Pvt. Ltd.",
    name: "Green Valley Township",
    location: "Hinjewadi, Pune, Maharashtra",
    approvalStatus: "under_review",
    totalUnits: 240,
    availableUnits: 240,
    soldUnits: 0,
    completionDate: "2028-03-31",
    price: 8200000,
  },
];

const INITIAL_UNITS: Unit[] = [
  { id: "u1", unitId: "EH-A-101", projectId: "proj1", projectName: "Emerald Heights", type: "2BHK", size: 1050, price: 12500000, floor: 1, status: "sold", ownerId: "USR001", ownerName: "Rajesh Kumar Sharma" },
  { id: "u2", unitId: "EH-A-201", projectId: "proj1", projectName: "Emerald Heights", type: "3BHK", size: 1450, price: 17000000, floor: 2, status: "available" },
  { id: "u3", unitId: "EH-B-101", projectId: "proj1", projectName: "Emerald Heights", type: "2BHK", size: 1100, price: 13000000, floor: 1, status: "booked" },
  { id: "u4", unitId: "EH-B-301", projectId: "proj1", projectName: "Emerald Heights", type: "3BHK", size: 1500, price: 18000000, floor: 3, status: "available" },
  { id: "u5", unitId: "GVT-A-001", projectId: "proj2", projectName: "Green Valley Township", type: "2BHK", size: 950, price: 8200000, floor: 1, status: "available" },
  { id: "u6", unitId: "GVT-A-002", projectId: "proj2", projectName: "Green Valley Township", type: "3BHK", size: 1300, price: 11000000, floor: 1, status: "available" },
];

const INITIAL_LOANS: Loan[] = [
  {
    id: "loan1",
    propertyId: "p1",
    bpid: "B-PID-MH-2024-001",
    propertyAddress: "Flat 4B, Sunshine Residency, Andheri West, Mumbai",
    applicantId: "USR001",
    applicantName: "Rajesh Kumar Sharma",
    bankId: "USR005",
    bankName: "State Bank of India",
    amount: 9000000,
    tenure: 240,
    interestRate: 8.5,
    status: "active",
    appliedOn: "2021-04-15",
    approvedOn: "2021-05-20",
    emiAmount: 78302,
  },
  {
    id: "loan2",
    propertyId: "p2",
    bpid: "B-PID-MH-2024-002",
    propertyAddress: "Survey No. 45/2, Thane Rural, Maharashtra",
    applicantId: "USR001",
    applicantName: "Rajesh Kumar Sharma",
    bankId: "USR005",
    bankName: "State Bank of India",
    amount: 5000000,
    tenure: 180,
    interestRate: 9.0,
    status: "pending",
    appliedOn: "2024-03-01",
  },
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "disp1",
    propertyId: "p3",
    bpid: "B-PID-DL-2024-003",
    propertyAddress: "Shop No. 12, DLF City Centre, Gurugram",
    raisedBy: "USR007",
    raisedByName: "Suresh Gupta",
    caseDetails: "Claiming co-ownership of the commercial property based on a prior unregistered agreement dated 2020. Requesting court-ordered title investigation.",
    status: "open",
    raisedOn: "2024-02-14",
    assignedOfficer: "Sub-Registrar K. Iyer",
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "al1", action: "Property Verified", userId: "USR004", userName: "Sub-Registrar K. Iyer", timestamp: "2024-03-12T10:30:00Z", metadata: "B-PID-MH-2024-001 status updated to verified", propertyId: "p1" },
  { id: "al2", action: "Transaction Initiated", userId: "USR002", userName: "Priya Mehta", timestamp: "2024-03-10T09:15:00Z", metadata: "Transaction TX001 initiated for B-PID-MH-2024-002", propertyId: "p2" },
  { id: "al3", action: "Loan Application", userId: "USR001", userName: "Rajesh Kumar Sharma", timestamp: "2024-03-01T14:00:00Z", metadata: "Loan application submitted to SBI for ₹50L", propertyId: "p2" },
  { id: "al4", action: "Dispute Filed", userId: "USR007", userName: "Suresh Gupta", timestamp: "2024-02-14T11:00:00Z", metadata: "Dispute filed against B-PID-DL-2024-003", propertyId: "p3" },
  { id: "al5", action: "Document Uploaded", userId: "USR001", userName: "Rajesh Kumar Sharma", timestamp: "2024-01-10T16:20:00Z", metadata: "Property tax receipt uploaded for B-PID-MH-2024-001", propertyId: "p1" },
];

const TX_STAGE_LABELS = ["Initiated", "CPF Attached", "Lawyer Review", "Bank Escrow", "Govt Approval", "Completed"];
const TX_STAGE_ACTORS = ["System", "CPF Broker", "Legal Team", "Bank Escrow Dept", "Sub-Registrar Office", "System"];

const DataContext = createContext<DataContextType>({
  properties: INITIAL_PROPERTIES,
  transactions: INITIAL_TRANSACTIONS,
  projects: INITIAL_PROJECTS,
  units: INITIAL_UNITS,
  loans: INITIAL_LOANS,
  disputes: INITIAL_DISPUTES,
  auditLogs: INITIAL_AUDIT_LOGS,
  liveSimulationTxId: null,
  addProperty: () => {},
  updatePropertyStatus: () => {},
  addTransaction: () => {},
  updateTransactionStatus: () => {},
  advanceTransactionStage: () => {},
  startLiveSimulation: () => {},
  stopLiveSimulation: () => {},
  addLoan: () => {},
  updateLoanStatus: () => {},
  addDispute: () => {},
  updateDisputeStatus: () => {},
  addAuditLog: () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [units] = useState<Unit[]>(INITIAL_UNITS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [liveSimulationTxId, setLiveSimulationTxId] = useState<string | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addProperty = useCallback((property: Property) => {
    setProperties((prev) => [...prev, property]);
  }, []);

  const updatePropertyStatus = useCallback((id: string, status: Property["status"]) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [...prev, tx]);
  }, []);

  const updateTransactionStatus = useCallback((id: string, status: Transaction["status"]) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const advanceTransactionStage = useCallback((id: string) => {
    setTransactions((prev) => prev.map((t) => {
      if (t.id !== id || t.stage >= 6) return t;
      const nextStage = (t.stage + 1) as TxStage;
      const now = new Date().toISOString();
      const newHistoryEntry = {
        stage: nextStage,
        label: TX_STAGE_LABELS[nextStage - 1],
        timestamp: now,
        actor: TX_STAGE_ACTORS[nextStage - 1],
      };
      const newStatus: Transaction["status"] =
        nextStage <= 2 ? "initiated" :
        nextStage === 3 ? "verifying" :
        nextStage === 4 ? "verifying" :
        nextStage === 5 ? "approved" : "completed";
      return {
        ...t,
        stage: nextStage,
        status: newStatus,
        escrowStatus: nextStage >= 4 ? "held" : t.escrowStatus,
        completedOn: nextStage === 6 ? now : t.completedOn,
        stageHistory: [...t.stageHistory, newHistoryEntry],
      };
    }));
  }, []);

  const startLiveSimulation = useCallback((txId: string) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setLiveSimulationTxId(txId);
    simIntervalRef.current = setInterval(() => {
      setTransactions((prev) => {
        const tx = prev.find((t) => t.id === txId);
        if (!tx || tx.stage >= 6) {
          if (simIntervalRef.current) clearInterval(simIntervalRef.current);
          setLiveSimulationTxId(null);
          return prev;
        }
        const nextStage = (tx.stage + 1) as TxStage;
        const now = new Date().toISOString();
        const newHistoryEntry = {
          stage: nextStage,
          label: TX_STAGE_LABELS[nextStage - 1],
          timestamp: now,
          actor: TX_STAGE_ACTORS[nextStage - 1],
        };
        const newStatus: Transaction["status"] =
          nextStage <= 2 ? "initiated" :
          nextStage === 3 ? "verifying" :
          nextStage === 4 ? "verifying" :
          nextStage === 5 ? "approved" : "completed";
        return prev.map((t) =>
          t.id !== txId ? t : {
            ...t,
            stage: nextStage,
            status: newStatus,
            escrowStatus: nextStage >= 4 ? "held" : t.escrowStatus,
            completedOn: nextStage === 6 ? now : t.completedOn,
            stageHistory: [...t.stageHistory, newHistoryEntry],
          }
        );
      });
    }, 2500);
  }, []);

  const stopLiveSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setLiveSimulationTxId(null);
  }, []);

  const addLoan = useCallback((loan: Loan) => {
    setLoans((prev) => [...prev, loan]);
  }, []);

  const updateLoanStatus = useCallback((id: string, status: Loan["status"]) => {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }, []);

  const addDispute = useCallback((dispute: Dispute) => {
    setDisputes((prev) => [...prev, dispute]);
  }, []);

  const updateDisputeStatus = useCallback((id: string, status: Dispute["status"]) => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  const addAuditLog = useCallback((log: Omit<AuditLog, "id">) => {
    const newLog: AuditLog = { ...log, id: `al${Date.now()}` };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      properties, transactions, projects, units, loans, disputes, auditLogs,
      liveSimulationTxId,
      addProperty, updatePropertyStatus, addTransaction, updateTransactionStatus,
      advanceTransactionStage, startLiveSimulation, stopLiveSimulation,
      addLoan, updateLoanStatus, addDispute, updateDisputeStatus, addAuditLog,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
