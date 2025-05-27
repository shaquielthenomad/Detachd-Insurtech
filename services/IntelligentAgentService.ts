import { UserRole } from '../types';

// Core interfaces for the intelligent agent system
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  supportedRoles: UserRole[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
}

export interface AgentContext {
  userId: string;
  userRole: UserRole;
  sessionId: string;
  currentPage: string;
  formData?: any;
  claimContext?: ClaimContext;
  timestamp: Date;
}

export interface ClaimContext {
  claimId?: string;
  claimType?: string;
  claimStatus?: string;
  documentCount?: number;
  riskScore?: number;
  assignedAgent?: string;
}

export interface AgentResponse {
  agentId: string;
  type: 'GUIDANCE' | 'AUTOMATION' | 'ALERT' | 'SUGGESTION' | 'COMPLETION';
  message?: string;
  actions?: AgentAction[];
  data?: any;
  confidence: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface AgentAction {
  id: string;
  label: string;
  type: 'BUTTON' | 'LINK' | 'MODAL' | 'REDIRECT' | 'API_CALL';
  action: string;
  data?: any;
}

export enum AgentCategory {
  WORKFLOW_AUTOMATION = 'WORKFLOW_AUTOMATION',
  USER_GUIDANCE = 'USER_GUIDANCE',
  ANALYSIS_DETECTION = 'ANALYSIS_DETECTION',
  COMMUNICATION_SUPPORT = 'COMMUNICATION_SUPPORT',
  COMPLIANCE_SECURITY = 'COMPLIANCE_SECURITY'
}

// Intelligent Agent Service
export class IntelligentAgentService {
  private capabilities: Map<string, AgentCapability> = new Map();
  private activeAgents: Map<string, Agent> = new Map();

  constructor() {
    this.initializeCapabilities();
  }

  // Initialize all agent capabilities
  private initializeCapabilities(): void {
    const capabilities: AgentCapability[] = [
      // Policyholder Guidance Agents
      {
        id: 'claim-guidance',
        name: 'Claim Submission Guidance',
        description: 'Step-by-step guidance for claim submission process',
        category: AgentCategory.USER_GUIDANCE,
        supportedRoles: [UserRole.POLICYHOLDER],
        priority: 'HIGH',
        enabled: true
      },
      {
        id: 'document-assistant',
        name: 'Document Upload Assistant',
        description: 'Smart document categorization and upload guidance',
        category: AgentCategory.USER_GUIDANCE,
        supportedRoles: [UserRole.POLICYHOLDER, UserRole.THIRD_PARTY, UserRole.WITNESS],
        priority: 'HIGH',
        enabled: true
      },
      {
        id: 'form-completion',
        name: 'Smart Form Completion',
        description: 'Auto-fill forms based on previous submissions and context',
        category: AgentCategory.WORKFLOW_AUTOMATION,
        supportedRoles: [UserRole.POLICYHOLDER, UserRole.MEDICAL_PROFESSIONAL],
        priority: 'MEDIUM',
        enabled: true
      },

      // Fraud Detection Agents
      {
        id: 'fraud-detection',
        name: 'Real-time Fraud Detection',
        description: 'AI-powered fraud pattern detection and risk scoring',
        category: AgentCategory.ANALYSIS_DETECTION,
        supportedRoles: [UserRole.INSURER_ADMIN, UserRole.INSURER_AGENT, UserRole.SUPER_ADMIN],
        priority: 'CRITICAL',
        enabled: true
      },
      {
        id: 'anomaly-detection',
        name: 'Claim Anomaly Detection',
        description: 'Detect unusual patterns in claim submissions',
        category: AgentCategory.ANALYSIS_DETECTION,
        supportedRoles: [UserRole.INSURER_ADMIN, UserRole.INSURER_AGENT],
        priority: 'HIGH',
        enabled: true
      },

      // Workflow Automation Agents
      {
        id: 'bulk-processing',
        name: 'Bulk Claim Processing',
        description: 'Automated processing of similar claims in batches',
        category: AgentCategory.WORKFLOW_AUTOMATION,
        supportedRoles: [UserRole.INSURER_ADMIN, UserRole.SUPER_ADMIN],
        priority: 'HIGH',
        enabled: true
      },
      {
        id: 'auto-assignment',
        name: 'Intelligent Claim Assignment',
        description: 'Automatically assign claims based on agent expertise and workload',
        category: AgentCategory.WORKFLOW_AUTOMATION,
        supportedRoles: [UserRole.INSURER_ADMIN],
        priority: 'HIGH',
        enabled: true
      },

      // Communication Support Agents
      {
        id: 'chat-support',
        name: '24/7 Chat Support',
        description: 'AI-powered chat assistance for common queries',
        category: AgentCategory.COMMUNICATION_SUPPORT,
        supportedRoles: Object.values(UserRole),
        priority: 'MEDIUM',
        enabled: true
      },
      {
        id: 'status-updates',
        name: 'Automated Status Updates',
        description: 'Proactive notifications about claim status changes',
        category: AgentCategory.COMMUNICATION_SUPPORT,
        supportedRoles: [UserRole.POLICYHOLDER, UserRole.THIRD_PARTY, UserRole.WITNESS],
        priority: 'MEDIUM',
        enabled: true
      },

      // Professional Integration Agents
      {
        id: 'medical-integration',
        name: 'Medical Report Integration',
        description: 'Streamlined medical report generation and submission',
        category: AgentCategory.WORKFLOW_AUTOMATION,
        supportedRoles: [UserRole.MEDICAL_PROFESSIONAL],
        priority: 'HIGH',
        enabled: true
      },
      {
        id: 'legal-compliance',
        name: 'Legal Compliance Checker',
        description: 'Automated legal document review and compliance verification',
        category: AgentCategory.COMPLIANCE_SECURITY,
        supportedRoles: [UserRole.LEGAL_PROFESSIONAL, UserRole.INSURER_ADMIN],
        priority: 'HIGH',
        enabled: true
      },

      // Security and Compliance Agents
      {
        id: 'access-control',
        name: 'Dynamic Access Control',
        description: 'Role-based access enforcement and monitoring',
        category: AgentCategory.COMPLIANCE_SECURITY,
        supportedRoles: [UserRole.SUPER_ADMIN, UserRole.GOVERNMENT_OFFICIAL],
        priority: 'CRITICAL',
        enabled: true
      },
      {
        id: 'audit-monitor',
        name: 'Audit Trail Monitor',
        description: 'Real-time audit logging and compliance monitoring',
        category: AgentCategory.COMPLIANCE_SECURITY,
        supportedRoles: [UserRole.SUPER_ADMIN, UserRole.GOVERNMENT_OFFICIAL],
        priority: 'HIGH',
        enabled: true
      }
    ];

    capabilities.forEach(capability => {
      this.capabilities.set(capability.id, capability);
    });
  }

  // Get agent for specific context
  public async getAgent(context: AgentContext): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];
    
    // Get applicable agents for the user's role
    const applicableAgents = this.getApplicableAgents(context.userRole);
    
    for (const agent of applicableAgents) {
      const response = await this.processAgentLogic(agent, context);
      if (response) {
        responses.push(response);
      }
    }

    // Sort by priority and confidence
    return responses.sort((a, b) => {
      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  // Get agents applicable to specific role
  private getApplicableAgents(userRole: UserRole): AgentCapability[] {
    return Array.from(this.capabilities.values())
      .filter(capability => 
        capability.enabled && 
        capability.supportedRoles.includes(userRole)
      );
  }

  // Process specific agent logic
  private async processAgentLogic(
    capability: AgentCapability, 
    context: AgentContext
  ): Promise<AgentResponse | null> {
    switch (capability.id) {
      case 'claim-guidance':
        return this.claimGuidanceAgent(context);
      
      case 'document-assistant':
        return this.documentAssistantAgent(context);
      
      case 'fraud-detection':
        return this.fraudDetectionAgent(context);
      
      case 'bulk-processing':
        return this.bulkProcessingAgent(context);
      
      case 'chat-support':
        return this.chatSupportAgent(context);
      
      case 'medical-integration':
        return this.medicalIntegrationAgent(context);
      
      case 'legal-compliance':
        return this.legalComplianceAgent(context);
      
      default:
        return null;
    }
  }

  // Individual Agent Implementations

  private claimGuidanceAgent(context: AgentContext): AgentResponse | null {
    if (context.currentPage.includes('/claims/new')) {
      return {
        agentId: 'claim-guidance',
        type: 'GUIDANCE',
        message: 'I\'m here to help you through the claim submission process. Let me guide you step by step.',
        actions: [
          {
            id: 'show-checklist',
            label: 'Show Document Checklist',
            type: 'MODAL',
            action: 'showDocumentChecklist'
          },
          {
            id: 'fill-assistance',
            label: 'Help Fill Forms',
            type: 'BUTTON',
            action: 'enableFormAssistance'
          }
        ],
        confidence: 0.9,
        priority: 'HIGH'
      };
    }
    return null;
  }

  private documentAssistantAgent(context: AgentContext): AgentResponse | null {
    if (context.currentPage.includes('/upload-documents')) {
      return {
        agentId: 'document-assistant',
        type: 'GUIDANCE',
        message: 'I can help organize your documents automatically. Drop your files and I\'ll categorize them.',
        actions: [
          {
            id: 'auto-categorize',
            label: 'Auto-Categorize Documents',
            type: 'BUTTON',
            action: 'enableAutoCategorization'
          },
          {
            id: 'scan-quality',
            label: 'Check Document Quality',
            type: 'BUTTON',
            action: 'checkDocumentQuality'
          }
        ],
        confidence: 0.85,
        priority: 'MEDIUM'
      };
    }
    return null;
  }

  private fraudDetectionAgent(context: AgentContext): AgentResponse | null {
    if (context.claimContext && context.claimContext.riskScore && context.claimContext.riskScore > 70) {
      return {
        agentId: 'fraud-detection',
        type: 'ALERT',
        message: `High-risk claim detected (Risk Score: ${context.claimContext.riskScore}%). Recommended for detailed review.`,
        actions: [
          {
            id: 'detailed-review',
            label: 'Start Detailed Review',
            type: 'BUTTON',
            action: 'initiateDetailedReview',
            data: { claimId: context.claimContext.claimId }
          },
          {
            id: 'flag-for-investigation',
            label: 'Flag for Investigation',
            type: 'BUTTON',
            action: 'flagForInvestigation'
          }
        ],
        confidence: 0.95,
        priority: 'URGENT'
      };
    }
    return null;
  }

  private bulkProcessingAgent(context: AgentContext): AgentResponse | null {
    if (context.currentPage.includes('/claims') && context.userRole === UserRole.INSURER_ADMIN) {
      return {
        agentId: 'bulk-processing',
        type: 'SUGGESTION',
        message: 'I noticed you have multiple similar claims. Would you like me to process them in bulk?',
        actions: [
          {
            id: 'bulk-approve',
            label: 'Bulk Approve Similar Claims',
            type: 'BUTTON',
            action: 'initiateBulkProcessing'
          },
          {
            id: 'create-template',
            label: 'Create Processing Template',
            type: 'BUTTON',
            action: 'createProcessingTemplate'
          }
        ],
        confidence: 0.75,
        priority: 'MEDIUM'
      };
    }
    return null;
  }

  private chatSupportAgent(context: AgentContext): AgentResponse | null {
    // Always available but with varying priority
    const priority = context.userRole === UserRole.POLICYHOLDER ? 'MEDIUM' : 'LOW';
    
    return {
      agentId: 'chat-support',
      type: 'SUGGESTION',
      message: 'Need help? I\'m here 24/7 to assist you with any questions.',
      actions: [
        {
          id: 'open-chat',
          label: 'Ask a Question',
          type: 'MODAL',
          action: 'openChatModal'
        },
        {
          id: 'show-faq',
          label: 'Browse FAQ',
          type: 'MODAL',
          action: 'showFAQ'
        }
      ],
      confidence: 0.7,
      priority
    };
  }

  private medicalIntegrationAgent(context: AgentContext): AgentResponse | null {
    if (context.userRole === UserRole.MEDICAL_PROFESSIONAL) {
      return {
        agentId: 'medical-integration',
        type: 'AUTOMATION',
        message: 'I can streamline your medical report generation. Connect your EHR system for automatic data entry.',
        actions: [
          {
            id: 'connect-ehr',
            label: 'Connect EHR System',
            type: 'MODAL',
            action: 'connectEHRSystem'
          },
          {
            id: 'generate-template',
            label: 'Generate Report Template',
            type: 'BUTTON',
            action: 'generateMedicalTemplate'
          }
        ],
        confidence: 0.8,
        priority: 'HIGH'
      };
    }
    return null;
  }

  private legalComplianceAgent(context: AgentContext): AgentResponse | null {
    if (context.userRole === UserRole.LEGAL_PROFESSIONAL || 
        (context.userRole === UserRole.INSURER_ADMIN && context.currentPage.includes('/claims'))) {
      return {
        agentId: 'legal-compliance',
        type: 'AUTOMATION',
        message: 'I can automatically check legal compliance and flag potential issues.',
        actions: [
          {
            id: 'compliance-check',
            label: 'Run Compliance Check',
            type: 'BUTTON',
            action: 'runComplianceCheck'
          },
          {
            id: 'legal-review',
            label: 'Request Legal Review',
            type: 'BUTTON',
            action: 'requestLegalReview'
          }
        ],
        confidence: 0.85,
        priority: 'HIGH'
      };
    }
    return null;
  }

  // Agent action handlers
  public async executeAgentAction(actionId: string, agentId: string, data?: any): Promise<any> {
    switch (actionId) {
      case 'showDocumentChecklist':
        return this.getDocumentChecklist();
      
      case 'enableFormAssistance':
        return this.enableFormAssistance();
      
      case 'enableAutoCategorization':
        return this.enableAutoCategorization();
      
      case 'initiateDetailedReview':
        return this.initiateDetailedReview(data.claimId);
      
      case 'initiateBulkProcessing':
        return this.initiateBulkProcessing();
      
      case 'openChatModal':
        return this.openChatModal();
      
      case 'connectEHRSystem':
        return this.connectEHRSystem();
      
      case 'runComplianceCheck':
        return this.runComplianceCheck();
      
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }

  // Helper methods for agent actions
  private getDocumentChecklist(): any {
    return {
      title: 'Document Checklist',
      items: [
        { name: 'Police Report', required: true, uploaded: false },
        { name: 'Photos of Damage', required: true, uploaded: false },
        { name: 'Medical Records', required: false, uploaded: false },
        { name: 'Witness Statements', required: false, uploaded: false }
      ]
    };
  }

  private enableFormAssistance(): any {
    return {
      success: true,
      message: 'Form assistance enabled. I\'ll help you fill out forms automatically.',
      features: ['auto-complete', 'field-validation', 'smart-suggestions']
    };
  }

  private enableAutoCategorization(): any {
    return {
      success: true,
      message: 'Document auto-categorization enabled. Upload files and I\'ll organize them.',
      categories: ['police-report', 'medical-record', 'photo-evidence', 'correspondence']
    };
  }

  private initiateDetailedReview(claimId: string): any {
    return {
      success: true,
      message: 'Detailed review initiated for high-risk claim.',
      reviewId: `review_${Date.now()}`,
      claimId,
      assignedTo: 'fraud-investigation-team'
    };
  }

  private initiateBulkProcessing(): any {
    return {
      success: true,
      message: 'Bulk processing workflow started.',
      batchId: `batch_${Date.now()}`,
      estimatedCompletion: '15 minutes'
    };
  }

  private openChatModal(): any {
    return {
      success: true,
      chatSession: `chat_${Date.now()}`,
      availableTopics: ['claim-status', 'document-upload', 'payment-issues', 'general-inquiry']
    };
  }

  private connectEHRSystem(): any {
    return {
      success: true,
      message: 'EHR integration wizard started.',
      supportedSystems: ['Epic', 'Cerner', 'AllScripts', 'NextGen']
    };
  }

  private runComplianceCheck(): any {
    return {
      success: true,
      message: 'Compliance check completed.',
      results: {
        overallScore: 92,
        issues: [],
        recommendations: ['Update privacy policy link', 'Add GDPR consent clause']
      }
    };
  }
}

// Base Agent interface
interface Agent {
  id: string;
  capability: AgentCapability;
  context: AgentContext;
  isActive: boolean;
  lastActivity: Date;
}

// Export singleton instance
export const intelligentAgentService = new IntelligentAgentService(); 