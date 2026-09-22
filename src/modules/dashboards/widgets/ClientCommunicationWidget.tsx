import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { MessageSquare, ChevronRight, Clock, Send } from 'lucide-react';

export const ClientCommunicationWidget: React.FC = () => {
  const { conversations, navigateTo } = useCRM();

  const recentConvs = conversations.slice(0, 4);

  return (
    <WidgetContainer
      title="Recent Client Conversations"
      subtitle="Latest prospect messages and scheduled next steps"
      badge={`${recentConvs.length} Active Threads`}
      action={
        <button
          onClick={() => navigateTo('/app/communication/messages')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          Open Chat <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-2.5">
        {recentConvs.map(conv => (
          <div
            key={conv.id}
            onClick={() => navigateTo('/app/communication/messages')}
            className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 hover:border-crm-borderHover rounded-md cursor-pointer transition-colors text-xs select-none"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-crm-text truncate">
                  {conv.clientName || conv.contactName || 'Client'}
                </span>
                <span className="text-[10px] text-crm-textMuted truncate">
                  ({conv.companyName})
                </span>
              </div>
              <span className="text-[10px] text-crm-textMuted font-mono flex-shrink-0">
                {conv.lastMessageTime || conv.lastActivity || 'Today'}
              </span>
            </div>

            <p className="text-[11px] text-crm-textMuted italic truncate mb-1.5">
              "{conv.lastMessageSnippet || conv.lastMessagePreview || 'Will review the proposal today.'}"
            </p>

            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-crm-border/40">
              <span className="text-turquoise font-medium">
                Next action: Follow up tomorrow
              </span>
              <span className="text-crm-textMuted">
                Channel: {conv.clientEmail ? 'Email' : 'Direct'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};
