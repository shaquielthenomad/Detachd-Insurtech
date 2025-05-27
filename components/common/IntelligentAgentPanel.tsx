import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSecureAuth } from '../../contexts/SecureAuthContext';
import { Button } from './Button';
import PixelCard from './PixelCard';

// Import agent service types and functions
interface AgentContext {
  userId: string;
  userRole: string;
  sessionId: string;
  currentPage: string;
  formData?: any;
  claimContext?: any;
  timestamp: Date;
}

interface AgentResponse {
  agentId: string;
  type: 'GUIDANCE' | 'AUTOMATION' | 'ALERT' | 'SUGGESTION' | 'COMPLETION';
  message?: string;
  actions?: AgentAction[];
  data?: any;
  confidence: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface AgentAction {
  id: string;
  label: string;
  type: 'BUTTON' | 'LINK' | 'MODAL' | 'REDIRECT' | 'API_CALL';
  action: string;
  data?: any;
}

interface IntelligentAgentPanelProps {
  claimContext?: {
    claimId?: string;
    claimType?: string;
    claimStatus?: string;
    documentCount?: number;
    riskScore?: number;
    assignedAgent?: string;
  };
  formData?: any;
  className?: string;
}

export const IntelligentAgentPanel: React.FC<IntelligentAgentPanelProps> = ({
  claimContext,
  formData,
  className = ''
}) => {
  const { user } = useSecureAuth();
  const location = useLocation();
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  // Mock agent responses for demonstration
  useEffect(() => {
    if (user) {
      loadMockAgentSuggestions();
    }
  }, [user, location.pathname, claimContext, formData]);

  const loadMockAgentSuggestions = () => {
    const mockResponses: AgentResponse[] = [];

    // Role-specific suggestions
    if (user?.role === 'POLICYHOLDER') {
      if (location.pathname.includes('/claims/new')) {
        mockResponses.push({
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
        });
      }

      // Always available chat support
      mockResponses.push({
        agentId: 'chat-support',
        type: 'SUGGESTION',
        message: 'Need help? I\'m here 24/7 to assist you with any questions.',
        actions: [
          {
            id: 'open-chat',
            label: 'Ask a Question',
            type: 'MODAL',
            action: 'openChatModal'
          }
        ],
        confidence: 0.7,
        priority: 'MEDIUM'
      });
    }

    if (user?.role === 'INSURER_ADMIN' || user?.role === 'INSURER_PARTY') {
      if (claimContext?.riskScore && claimContext.riskScore > 70) {
        mockResponses.push({
          agentId: 'fraud-detection',
          type: 'ALERT',
          message: `High-risk claim detected (Risk Score: ${claimContext.riskScore}%). Recommended for detailed review.`,
          actions: [
            {
              id: 'detailed-review',
              label: 'Start Detailed Review',
              type: 'BUTTON',
              action: 'initiateDetailedReview'
            },
            {
              id: 'flag-investigation',
              label: 'Flag for Investigation',
              type: 'BUTTON',
              action: 'flagForInvestigation'
            }
          ],
          confidence: 0.95,
          priority: 'URGENT'
        });
      }

      if (location.pathname.includes('/claims')) {
        mockResponses.push({
          agentId: 'bulk-processing',
          type: 'SUGGESTION',
          message: 'I noticed you have multiple similar claims. Would you like me to process them in bulk?',
          actions: [
            {
              id: 'bulk-approve',
              label: 'Bulk Approve Similar Claims',
              type: 'BUTTON',
              action: 'initiateBulkProcessing'
            }
          ],
          confidence: 0.75,
          priority: 'MEDIUM'
        });
      }
    }

    if (user?.role === 'MEDICAL_PROFESSIONAL') {
      mockResponses.push({
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
      });
    }

    setAgentResponses(mockResponses);
  };

  const executeAction = async (action: AgentAction) => {
    console.log('Executing action:', action);
    
    // Mock action execution
    switch (action.action) {
      case 'showDocumentChecklist':
        alert('Document Checklist:\n• Police Report ✓\n• Photos of Damage\n• Medical Records\n• Witness Statements');
        break;
      case 'enableFormAssistance':
        alert('Form assistance enabled! I\'ll help you fill out forms automatically.');
        break;
      case 'openChatModal':
        alert('Chat support activated. How can I help you today?');
        break;
      case 'initiateDetailedReview':
        alert('Detailed fraud review initiated. Assigned to investigation team.');
        break;
      case 'initiateBulkProcessing':
        alert('Bulk processing started. Estimated completion: 15 minutes.');
        break;
      case 'connectEHRSystem':
        alert('EHR integration wizard started. Supported systems: Epic, Cerner, AllScripts.');
        break;
      default:
        alert(`Action executed: ${action.label}`);
    }
  };

  const getAgentIcon = (type: AgentResponse['type']) => {
    switch (type) {
      case 'ALERT':
        return '🚨';
      case 'GUIDANCE':
        return '💡';
      case 'SUGGESTION':
        return 'ℹ️';
      case 'COMPLETION':
        return '✅';
      case 'AUTOMATION':
        return '⚙️';
      default:
        return '✨';
    }
  };

  const getPriorityColor = (priority: AgentResponse['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'border-red-500 bg-red-900/20';
      case 'HIGH':
        return 'border-orange-500 bg-orange-900/20';
      case 'MEDIUM':
        return 'border-blue-500 bg-blue-900/20';
      default:
        return 'border-slate-500 bg-slate-900/20';
    }
  };

  if (!agentResponses.length && !loading) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 z-50 ${className}`}>
      <PixelCard 
        variant="blue" 
        className={`transition-all duration-300 ${isExpanded ? 'max-h-screen' : 'max-h-16'} overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤖</span>
            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            {agentResponses.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {agentResponses.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isExpanded ? '⬇️' : '⬆️'}
            </button>
            <button
              onClick={() => setAgentResponses([])}
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              ❌
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-400">
                <div className="animate-spin text-2xl mb-2">⚙️</div>
                <p>Analyzing your workflow...</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {agentResponses.map((response, index) => (
                  <div
                    key={`${response.agentId}-${index}`}
                    className={`p-3 rounded-lg border ${getPriorityColor(response.priority)}`}
                  >
                    {/* Agent Response Header */}
                    <div className="flex items-start space-x-3 mb-2">
                      <span className="text-xl">{getAgentIcon(response.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white capitalize">
                            {response.type.toLowerCase().replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">
                            {Math.round(response.confidence * 100)}% confident
                          </span>
                        </div>
                        {response.message && (
                          <p className="text-sm text-slate-300 mt-1">
                            {response.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Agent Actions */}
                    {response.actions && response.actions.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {response.actions.map((action, actionIndex) => (
                          <Button
                            key={`${action.id}-${actionIndex}`}
                            variant={response.priority === 'URGENT' ? 'danger' : 'outline'}
                            size="sm"
                            className="w-full text-left justify-start"
                            onClick={() => executeAction(action)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Quick Actions */}
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadMockAgentSuggestions}
                      className="text-xs"
                    >
                      🔄 Refresh
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => executeAction({
                        id: 'open-chat',
                        label: 'Chat',
                        type: 'MODAL',
                        action: 'openChatModal'
                      })}
                      className="text-xs"
                    >
                      💬 Chat
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </PixelCard>
    </div>
  );
};

// Hook for easy integration
export const useIntelligentAgent = () => {
  const [agentPanelVisible, setAgentPanelVisible] = useState(true);

  const hideAgentPanel = () => setAgentPanelVisible(false);
  const showAgentPanel = () => setAgentPanelVisible(true);
  const toggleAgentPanel = () => setAgentPanelVisible(!agentPanelVisible);

  return {
    agentPanelVisible,
    hideAgentPanel,
    showAgentPanel,
    toggleAgentPanel
  };
}; 