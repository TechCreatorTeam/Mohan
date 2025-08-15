import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Send,
  MessageSquare,
  Calendar,
  User,
  Package,
  RefreshCw,
  Filter,
  Search,
  ExternalLink,
  FileText,
  Loader,
  MailCheck,
  MailPlus
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getDownloadLinkRequests, 
  updateDownloadLinkRequestStatus,
  DownloadLinkRequest 
} from '../../utils/secureDownloads';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { sendSecureDocumentDelivery } from '../../utils/email';
import { generateSecureDownloadTokens } from '../../utils/secureDownloads';

const AdminDownloadRequestsPage = () => {
  const { user } = useAuth();
    const { getProjectDocuments, orders, projects } = useProjects();
  const [requests, setRequests] = useState<DownloadLinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DownloadLinkRequest | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState<'acknowledgment' | 'completion'>('acknowledgment');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getDownloadLinkRequests(filterStatus === 'all' ? undefined : filterStatus);
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.customer_email.toLowerCase().includes(searchLower) ||
      request.customer_name?.toLowerCase().includes(searchLower) ||
      request.project_title?.toLowerCase().includes(searchLower) ||
      request.order_id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleProcessRequest = async (
    request: DownloadLinkRequest,
    action: 'approve' | 'reject',
    orders: any[],
    getProjectDocuments: (projectId: string) => any[]
  ) => {
    if (!user?.email) return;

    setProcessing(request.id);
    try {
      if (action === 'approve') {
        // First update status to processing
        await updateDownloadLinkRequestStatus(
          request.id,
          'processing',
          user.email,
          'Processing request and generating new download links...'
        );

        // Try to find the correct order and documents
        let orderId = request.order_id;
        let projectId = undefined;
        let order = null;
        let documents = [];

        // Try to get order and projectId if order_id is missing or unknown
        if (!orderId || orderId === 'unknown') {
          // Try to find the latest order for this customer and project
          order = orders
            .filter(o =>
              o.customerEmail === request.customer_email &&
              (request.project_title ? o.projectTitle === request.project_title : true)
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          if (order) {
            orderId = order.id;
            projectId = order.projectId;
          }
        } else {
          // Try to get order from context
          order = orders.find(o => o.id === orderId);
          if (order) {
            projectId = order.projectId;
          }
        }

        // Get documents for the project
        if (projectId) {
          documents = getProjectDocuments(projectId);
        }

        if (order && documents.length > 0) {
          // Generate new secure download tokens
          const secureUrls = await generateSecureDownloadTokens(
            documents.map(doc => ({
              id: doc.id,
              name: doc.name,
              url: doc.url
            })),
            request.customer_email,
            orderId,
            {
              expirationHours: 72, // 3 days
              maxDownloads: 5,
              requireEmailVerification: true
            }
          );

          // Format secure documents for email
          const secureDocuments = secureUrls.map(secureUrl => {
            const originalDoc = documents.find(doc => doc.id === secureUrl.documentId);
            return {
              documentName: secureUrl.documentName,
              secureUrl: secureUrl.secureUrl,
              category: originalDoc?.document_category || 'document',
              review_stage: originalDoc?.review_stage || 'review_1',
              size: originalDoc?.size || 0
            };
          });

          // Send secure document delivery email
          await sendSecureDocumentDelivery({
            project_title: order.projectTitle || request.project_title || 'Project Documents',
            customer_name: order.customerName || request.customer_name || 'Customer',
            customer_email: request.customer_email,
            order_id: orderId,
            secureDocuments,
            expiresAt: secureUrls[0]?.expiresAt || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            maxDownloads: 5,
            // Only include admin_message if this is an approval (download links sent)
            ...(action === 'approve' && responseMessage ? { admin_message: responseMessage } : {})
          });

          // Update status to completed
          await updateDownloadLinkRequestStatus(
            request.id,
            'completed',
            user.email,
            responseMessage || `New download links have been generated and sent to your email address. Generated ${secureUrls.length} secure links.`,
            secureUrls.length
          );
        } else {
          // No order or no documents found
          await updateDownloadLinkRequestStatus(
            request.id,
            'rejected',
            user.email,
            !order
              ? 'No valid order found for this customer and project.'
              : 'No documents found for this order/project. Please check the order details.'
          );
        }
      } else {
        // Reject the request
        await updateDownloadLinkRequestStatus(
          request.id,
          'rejected',
          user.email,
          responseMessage || 'Request rejected by admin.'
        );
      }

      // Reload requests
      await loadRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setResponseMessage('');
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const openModal = (request: DownloadLinkRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setShowModal(true);
    setResponseMessage(
      action === 'approve' 
        ? 'New download links have been generated and sent to your email address.'
        : 'Your request has been reviewed and unfortunately cannot be processed at this time.'
    );
  };

  const openEmailModal = (request: DownloadLinkRequest, type: 'acknowledgment' | 'completion') => {
    setSelectedRequest(request);
    setEmailType(type);
    setShowEmailModal(true);
    
    // Set default message based on type
    if (type === 'acknowledgment') {
      setEmailMessage(`Dear ${request.customer_name || 'Customer'},

Thank you for contacting us regarding your download links for Order ID: ${request.order_id}.

We have received your request and our team is currently reviewing it. Here's what you can expect:

📋 Request Details:
• Order ID: ${request.order_id}
• Project: ${request.project_title || 'Your project'}
• Reason: ${request.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
• Priority: ${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}

⏰ Timeline:
• Review Time: 24-48 hours
• Response: You'll receive an email once processed
• New Links: If approved, secure download links will be sent

🔒 What's Next:
Our team will verify your order details and generate new secure download links if everything checks out. The new links will be time-limited and personalized for your email address.

If you have any urgent questions, please don't hesitate to contact us.

Best regards,
TechCreator Support Team`);
    } else {
      setEmailMessage(`Dear ${request.customer_name || 'Customer'},

Great news! Your download link request has been processed and completed.

📦 Request Completed:
• Order ID: ${request.order_id}
• Project: ${request.project_title || 'Your project'}
• Status: ✅ Completed
• Processed: ${new Date().toLocaleDateString()}

🔒 New Secure Download Links:
You should have received a separate email containing your new secure download links. These links are:
• Time-limited (72 hours)
• Email-specific (only work for your email)
• Download-limited (5 downloads per document)
• Fully secure and encrypted

📥 Next Steps:
1. Check your inbox for the "Secure Documents Ready" email
2. Click the secure download buttons for each document
3. Verify your email address when prompted
4. Download all files before the links expire

⚠️ Important Notes:
• Save all files to your computer promptly
• The links expire in 72 hours for security
• Contact us if you need any technical assistance

Thank you for your patience, and we hope you find the project materials helpful!

Best regards,
TechCreator Support Team`);
    }
  };

  const sendCustomEmail = async () => {
    if (!selectedRequest || !emailMessage.trim()) return;

    setSendingEmail(true);
    try {
      // Import the Brevo email function
      const { sendBrevoEmail } = await import('../../utils/email');
      
      const emailData = {
        sender: {
          name: 'TechCreator Support',
          email: 'mohanselenophile@gmail.com'
        },
        to: [{
          email: selectedRequest.customer_email,
          name: selectedRequest.customer_name || 'Customer'
        }],
        subject: emailType === 'acknowledgment' 
          ? `📧 Request Received - ${selectedRequest.project_title || 'Download Links'} (${selectedRequest.order_id})`
          : `✅ Request Completed - ${selectedRequest.project_title || 'Download Links'} (${selectedRequest.order_id})`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${emailType === 'acknowledgment' ? 'Request Received' : 'Request Completed'} - TechCreator</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, ${emailType === 'acknowledgment' ? '#3b82f6, #1d4ed8' : '#10b981, #059669'}); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
              .message { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-line; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${emailType === 'acknowledgment' ? '📧 Request Received' : '✅ Request Completed'}</h1>
                <p>${emailType === 'acknowledgment' ? 'We\'re processing your download link request' : 'Your download links have been processed'}</p>
              </div>
              
              <div class="content">
                <div class="message">
                  ${emailMessage.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div class="footer">
                <p>&copy; 2025 TechCreator. All rights reserved.</p>
                <p>This is a customer service message regarding your download request.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        tags: ['customer-service', emailType === 'acknowledgment' ? 'acknowledgment' : 'completion', 'download-request']
      };

      console.log('🚀 Sending email via Brevo...', {
        to: selectedRequest.customer_email,
        subject: emailData.subject,
        type: emailType
      });
      
      await sendBrevoEmail(emailData);

      console.log('✅ Email sent successfully via Brevo');
      
      // Show success notification
      const successMessage = `${emailType === 'acknowledgment' ? 'Acknowledgment' : 'Completion'} email sent successfully to ${selectedRequest.customer_email}!`;
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = successMessage;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 5000);
      
      // Close modal
      setShowEmailModal(false);
      setSelectedRequest(null);
      setEmailMessage('');
    } catch (error) {
      console.error('❌ Error sending email via Brevo:', error);
      
      // Show error notification
      const errorMessage = `Failed to send ${emailType} email: ${error.message || 'Unknown error'}`;
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = errorMessage;
      document.body.appendChild(notification);
      
      // Remove notification after 7 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 7000);
    } finally {
      setSendingEmail(false);
    }
  };

  const getRequestStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const processing = requests.filter(r => r.status === 'processing').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return { total, pending, processing, completed, rejected };
  };

  const stats = getRequestStats();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Download Link Requests</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage customer requests for new download links when their original links expire
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Processing</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{stats.processing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rejected</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200"
                />
              </div>
              <button
                onClick={loadRequests}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-2">
                No download requests found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No customers have requested new download links yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-8 w-8 text-slate-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                              {request.customer_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {request.customer_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-slate-200">
                          <div className="font-medium">{request.project_title || 'Unknown Project'}</div>
                          <div className="text-slate-500 dark:text-slate-400">Order: {request.order_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-slate-200">
                          {request.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {request.customer_message && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs truncate">
                            {request.customer_message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openModal(request, 'approve')}
                                disabled={processing === request.id}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                title="Approve and send new links"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openModal(request, 'reject')}
                                disabled={processing === request.id}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                title="Reject request"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          
                          {/* Email Buttons */}
                          <button
                            onClick={() => openEmailModal(request, 'acknowledgment')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Send acknowledgment email"
                          >
                            <MailCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEmailModal(request, 'completion')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Send completion email"
                          >
                            <MailPlus className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                  {responseMessage.includes('generated') ? 'Approve Request' : 'Reject Request'}
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Customer: {selectedRequest.customer_name} ({selectedRequest.customer_email})
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Order: {selectedRequest.order_id}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Project: {(() => {
                      let order = orders.find(o => o.id === selectedRequest.order_id);
                      let project = order ? projects.find(p => p.id === order.projectId) : null;
                      return project ? project.title : (selectedRequest.project_title || 'Unknown Project');
                    })()}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Response Message
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="Enter a message for the customer..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                      setResponseMessage('');
                    }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleProcessRequest(
                      selectedRequest, 
                      responseMessage.includes('generated') ? 'approve' : 'reject',
                      orders,
                      getProjectDocuments
                    )}
                    disabled={processing === selectedRequest.id}
                    className={`px-4 py-2 rounded-md text-white flex items-center ${
                      responseMessage.includes('generated')
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {processing === selectedRequest.id ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {responseMessage.includes('generated') ? (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Approve & Send Links
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Request
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Composition Modal */}
        {showEmailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                    {emailType === 'acknowledgment' ? (
                      <>
                        <MailCheck className="h-6 w-6 inline mr-2 text-blue-600" />
                        Send Acknowledgment Email
                      </>
                    ) : (
                      <>
                        <MailPlus className="h-6 w-6 inline mr-2 text-green-600" />
                        Send Completion Email
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSelectedRequest(null);
                      setEmailMessage('');
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Sending to:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-600 dark:text-slate-400">Name:</span> {selectedRequest.customer_name || 'Customer'}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Email:</span> {selectedRequest.customer_email}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Order:</span> {selectedRequest.order_id}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Project:</span> {selectedRequest.project_title || 'Unknown'}</p>
                  </div>
                </div>

                {/* Email Subject Preview */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Subject (Preview)
                  </label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300">
                    {emailType === 'acknowledgment' 
                      ? `📧 Request Received - ${selectedRequest.project_title || 'Download Links'} (${selectedRequest.order_id})`
                      : `✅ Request Completed - ${selectedRequest.project_title || 'Download Links'} (${selectedRequest.order_id})`
                    }
                  </div>
                </div>

                {/* Email Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200 font-mono text-sm"
                    placeholder="Enter your email message..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSelectedRequest(null);
                      setEmailMessage('');
                    }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendCustomEmail}
                    disabled={sendingEmail || !emailMessage.trim()}
                    className={`px-4 py-2 rounded-md text-white flex items-center ${
                      emailType === 'acknowledgment'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {sendingEmail ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send {emailType === 'acknowledgment' ? 'Acknowledgment' : 'Completion'} Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && !showModal && !showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                    Request Details
                  </h3>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-600 dark:text-slate-400">Name:</span> {selectedRequest.customer_name || 'Not provided'}</p>
                        <p><span className="text-slate-600 dark:text-slate-400">Email:</span> {selectedRequest.customer_email}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-600 dark:text-slate-400">Order ID:</span> {selectedRequest.order_id}</p>
                        <p><span className="text-slate-600 dark:text-slate-400">Project:</span> {selectedRequest.project_title || 'Not specified'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          // Find the order and project for this request
                          let order = orders.find(o => o.id === selectedRequest.order_id);
                          let project = order ? projects.find(p => p.id === order.projectId) : null;
                          if (project) {
                            return <>
                              <p><span className="text-slate-600 dark:text-slate-400">Title:</span> {project.title}</p>
                              {project.description && <p><span className="text-slate-600 dark:text-slate-400">Description:</span> {project.description}</p>}
                              {project.category && <p><span className="text-slate-600 dark:text-slate-400">Category:</span> {project.category}</p>}
                              {project.created_at && <p><span className="text-slate-600 dark:text-slate-400">Created:</span> {new Date(project.created_at).toLocaleString()}</p>}
                            </>;
                          } else {
                            return <p className="text-slate-500 dark:text-slate-400">No project details found.</p>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-600 dark:text-slate-400">Reason:</span> {selectedRequest.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p><span className="text-slate-600 dark:text-slate-400">Priority:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                        </span>
                      </p>
                      <p><span className="text-slate-600 dark:text-slate-400">Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </span>
                      </p>
                      <p><span className="text-slate-600 dark:text-slate-400">Created:</span> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                      {selectedRequest.processed_at && (
                        <p><span className="text-slate-600 dark:text-slate-400">Processed:</span> {new Date(selectedRequest.processed_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {selectedRequest.customer_message && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Customer Message</h4>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{selectedRequest.customer_message}</p>
                      </div>
                    </div>
                  )}

                  {selectedRequest.admin_notes && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Admin Notes</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">{selectedRequest.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedRequest.processed_by && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Processing Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-600 dark:text-slate-400">Processed by:</span> {selectedRequest.processed_by}</p>
                        {selectedRequest.new_links_sent_at && (
                          <p><span className="text-slate-600 dark:text-slate-400">Links sent:</span> {new Date(selectedRequest.new_links_sent_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => openModal(selectedRequest, 'reject')}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => openModal(selectedRequest, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve & Send Links
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDownloadRequestsPage;