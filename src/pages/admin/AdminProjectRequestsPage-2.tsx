import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowRight, 
  Search, 
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  MessageSquare,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  Star,
  TrendingUp,
  Edit,
  Save,
  X,
  Download,
  ChevronDown,
  ChevronUp,
  Send,
  MailCheck,
  MailPlus,
  Loader
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { ProjectRequest, ProjectRequestStatusHistory, Project } from '../../types';

const AdminProjectRequestsPage = () => {
  const { 
    projectRequests, 
    updateProjectRequestStatus, 
    convertRequestToProject, 
    getRequestStatusHistory,
    deleteProjectRequest,
    addProject,
    fetchProjectRequests // Add this if available in context
  } = useProjects();
  // Refresh button functionality (replacing previous logic)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // The data will be automatically refreshed through the ProjectContext
      // which has real-time subscriptions to the database
      // We can add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [statusHistory, setStatusHistory] = useState<ProjectRequestStatusHistory[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState<'acknowledgment' | 'quote' | 'approval' | 'rejection'>('acknowledgment');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  // Custom dropdown state for filters
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  // Project conversion form state
  const [projectFormData, setProjectFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: 'IoT',
    price: 0,
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    imageUpload: null,
    features: [''],
    technical_details: '',
    featured: false,
    updated_at: new Date().toISOString()
  });

  // Filter requests
  const filteredRequests = projectRequests.filter(request => {
    const matchesSearch = 
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? request.status === statusFilter : true;
    const matchesPriority = priorityFilter ? request.priority === priorityFilter : true;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sorting functionality
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedRequests = () => {
    if (!sortConfig) return filteredRequests;

    return [...filteredRequests].sort((a, b) => {
      // Handle different data types appropriately
      let aValue: any, bValue: any;
      
      // Special handling for dates
      if (sortConfig.key === 'date') {
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
      } 
      // Special handling for customer name
      else if (sortConfig.key === 'customer') {
        aValue = a.customer_name?.toLowerCase() || '';
        bValue = b.customer_name?.toLowerCase() || '';
      } 
      // Special handling for project title
      else if (sortConfig.key === 'project') {
        aValue = a.project_title?.toLowerCase() || '';
        bValue = b.project_title?.toLowerCase() || '';
      }
      // Special handling for priority
      else if (sortConfig.key === 'priority') {
        const priorityOrder = ['low', 'medium', 'high', 'urgent'];
        aValue = priorityOrder.indexOf(a.priority || '');
        bValue = priorityOrder.indexOf(b.priority || '');
      }
      // Special handling for status
      else if (sortConfig.key === 'status') {
        const statusOrder = ['pending', 'reviewing', 'approved', 'rejected', 'converted'];
        aValue = statusOrder.indexOf(a.status || '');
        bValue = statusOrder.indexOf(b.status || '');
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedRequests = getSortedRequests();

  // Calculate statistics
  const stats = {
    total: projectRequests.length,
    pending: projectRequests.filter(r => r.status === 'pending').length,
    reviewing: projectRequests.filter(r => r.status === 'reviewing').length,
    approved: projectRequests.filter(r => r.status === 'approved').length,
    rejected: projectRequests.filter(r => r.status === 'rejected').length,
    converted: projectRequests.filter(r => r.status === 'converted').length,
    thisMonth: projectRequests.filter(r => {
      const created = new Date(r.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'reviewing', label: 'Reviewing', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'converted', label: 'Converted', color: 'purple' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };

    const colorMap = {
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-300', icon: Clock },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300', icon: Eye },
      green: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', icon: CheckCircle },
      red: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-300', icon: XCircle },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-300', icon: ArrowRight }
    };

    return colorMap[statusConfig.color as keyof typeof colorMap] || colorMap.blue;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorityOptions.find(p => p.value === priority);
    if (!priorityConfig) return { bg: 'bg-gray-100', text: 'text-gray-800' };

    const colorMap = {
      gray: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-300' },
      red: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-300' }
    };

    return colorMap[priorityConfig.color as keyof typeof colorMap] || colorMap.blue;
  };

  // Get project type color
  const getProjectTypeColor = (projectType: string) => {
    switch (projectType.toLowerCase()) {
      case 'iot':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'blockchain':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'web':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'mobile':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Handle checkbox selection
  const handleSelect = (id: string) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter(selectedId => selectedId !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(request => request.id));
    }
  };

  // Export selected requests as CSV
  const exportAsCSV = () => {
    if (selectedRequests.length === 0) return;
    
    const selectedData = projectRequests.filter(request => selectedRequests.includes(request.id));
    
    // Create CSV header
    let csv = 'Customer Name,Email,Phone,Project Title,Project Type,Budget Range,Priority,Status,Description,Requirements,Timeline,Created Date,Updated Date\n';
    
    // Add rows
    selectedData.forEach(request => {
      const createdDate = formatDate(request.created_at);
      const updatedDate = formatDate(request.updated_at);
      const escapedDescription = `"${request.description?.replace(/"/g, '""') || ''}"`;
      const escapedRequirements = `"${request.requirements?.replace(/"/g, '""') || ''}"`;
      const escapedName = `"${request.customer_name?.replace(/"/g, '""') || ''}"`;
      const escapedTitle = `"${request.project_title?.replace(/"/g, '""') || ''}"`;
      
      csv += `${escapedName},${request.customer_email || ''},${request.customer_phone || ''},${escapedTitle},${request.project_type || ''},${request.budget_range || ''},${request.priority || ''},${request.status || ''},${escapedDescription},${escapedRequirements},${request.timeline || ''},${createdDate},${updatedDate}\n`;
    });
    
    // Create download link with UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-requests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send email to selected requests
  const sendEmail = () => {
    if (selectedRequests.length === 0) return;
    
    const selectedData = projectRequests.filter(request => selectedRequests.includes(request.id));
    const emailAddresses = selectedData.map(request => request.customer_email).join(',');
    
    window.open(`mailto:${emailAddresses}`);
  };

  const openEmailModal = (request: ProjectRequest, type: 'acknowledgment' | 'quote' | 'approval' | 'rejection') => {
    setSelectedRequest(request);
    setEmailType(type);
    setShowEmailModal(true);
    
    // Set default message based on type
    switch (type) {
      case 'acknowledgment':
        setEmailMessage(`Dear ${request.customer_name},

Thank you for submitting your project request for "${request.project_title}".

📋 Request Details:
• Project: ${request.project_title}
• Type: ${request.project_type}
• Budget Range: ${request.budget_range}
• Priority: ${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
• Submitted: ${new Date(request.created_at).toLocaleDateString()}

⏰ What's Next:
• Review Time: 24-48 hours
• Technical Assessment: Our team will evaluate your requirements
• Quote Preparation: We'll prepare a detailed proposal
• Response: You'll receive our proposal within 2-3 business days

🔍 Our Process:
1. Technical feasibility analysis
2. Resource allocation planning
3. Timeline estimation
4. Detailed quote preparation
5. Project proposal delivery

We're excited about the possibility of working on your project and will be in touch soon with our detailed proposal.

Best regards,
TechCreator Development Team`);
        break;

      case 'quote':
        setEmailMessage(`Dear ${request.customer_name},

Thank you for your interest in "${request.project_title}". We've completed our technical assessment and are pleased to provide you with our project proposal.

📊 Project Analysis:
• Project Type: ${request.project_type}
• Complexity: Based on your requirements
• Estimated Timeline: ${request.estimated_timeline || 'To be determined'}
• Proposed Budget: ${request.estimated_price ? `₹${request.estimated_price.toLocaleString()}` : 'Custom quote attached'}

📋 What's Included:
• Complete source code and documentation
• 3-stage review process with deliverables
• Technical specifications and architecture
• Installation and deployment guides
• Post-delivery support and maintenance
• Quality assurance and testing

💼 Next Steps:
1. Review the attached detailed proposal
2. Schedule a consultation call if needed
3. Confirm project scope and timeline
4. Sign the project agreement
5. Begin development with 30% advance payment

🤝 Why Choose TechCreator:
• Proven expertise in ${request.project_type} development
• Transparent communication throughout the project
• Quality deliverables with comprehensive documentation
• Ongoing support and maintenance options

We're confident this solution will meet your needs perfectly. Please let us know if you have any questions or would like to discuss the proposal further.

Best regards,
TechCreator Development Team`);
        break;

      case 'approval':
        setEmailMessage(`Dear ${request.customer_name},

Excellent news! Your project request for "${request.project_title}" has been approved and we're ready to begin development.

✅ Project Approved:
• Project: ${request.project_title}
• Approved Budget: ${request.estimated_price ? `₹${request.estimated_price.toLocaleString()}` : 'As quoted'}
• Estimated Timeline: ${request.estimated_timeline || '4-6 weeks'}
• Start Date: Within 3 business days
• Project Manager: ${request.assigned_to || 'To be assigned'}

🚀 Development Process:
• Phase 1: Requirements analysis and architecture design
• Phase 2: Core development and initial review
• Phase 3: Feature completion and testing
• Phase 4: Final review and deployment preparation
• Phase 5: Delivery and documentation handover

📅 Timeline & Milestones:
• Week 1-2: Architecture and setup
• Week 3-4: Core development
• Week 5-6: Testing and refinement
• Week 7: Final delivery and documentation

💳 Payment Schedule:
• 30% advance payment to begin development
• 40% payment after Phase 2 completion
• 30% final payment upon project delivery

📞 Next Steps:
1. Review and sign the project agreement (attached)
2. Process the advance payment
3. Join our project communication channel
4. Attend the project kickoff meeting
5. Begin development immediately

We're thrilled to work on your project and deliver an exceptional solution that exceeds your expectations!

Best regards,
TechCreator Development Team`);
        break;

      case 'rejection':
        setEmailMessage(`Dear ${request.customer_name},

Thank you for submitting your project request for "${request.project_title}". After careful consideration, we regret to inform you that we cannot proceed with this project at this time.

📋 Request Details:
• Project: ${request.project_title}
• Type: ${request.project_type}
• Submitted: ${new Date(request.created_at).toLocaleDateString()}

🤔 Reason for Decline:
Unfortunately, this project falls outside our current expertise area or capacity. We want to ensure we only take on projects where we can deliver exceptional results.

💡 Alternative Suggestions:
• Consider simplifying the project scope for future consideration
• We may be able to help with specific components of your project
• We'd be happy to recommend other developers who specialize in this area
• Feel free to reach out for future projects that align with our expertise

🔄 Future Opportunities:
While we cannot proceed with this specific request, we'd love to work with you on future projects that better match our capabilities in:
• IoT Solutions and Smart Device Development
• Blockchain and Cryptocurrency Applications
• Web Applications and E-commerce Platforms
• Mobile App Development
• Custom Software Solutions

Thank you for considering TechCreator for your development needs. We appreciate your understanding and hope to collaborate on a future project.

Best regards,
TechCreator Development Team`);
        break;
    }
  };

  const sendCustomEmail = async () => {
    if (!selectedRequest || !emailMessage.trim()) return;

    setSendingEmail(true);
    try {
      // Import the Brevo email function
      const { sendBrevoEmail } = await import('../../utils/email');
      
      const getEmailConfig = () => {
        switch (emailType) {
          case 'acknowledgment':
            return {
              subject: `📧 Project Request Received - ${selectedRequest.project_title}`,
              headerColor: '#3b82f6, #1d4ed8',
              headerTitle: '📧 Project Request Received',
              headerSubtitle: 'We\'re reviewing your project requirements'
            };
          case 'quote':
            return {
              subject: `💼 Project Proposal - ${selectedRequest.project_title}`,
              headerColor: '#7c3aed, #5b21b6',
              headerTitle: '💼 Project Proposal Ready',
              headerSubtitle: 'Your custom development quote is attached'
            };
          case 'approval':
            return {
              subject: `✅ Project Approved - ${selectedRequest.project_title}`,
              headerColor: '#10b981, #059669',
              headerTitle: '✅ Project Approved!',
              headerSubtitle: 'We\'re ready to begin development'
            };
          case 'rejection':
            return {
              subject: `❌ Project Update - ${selectedRequest.project_title}`,
              headerColor: '#ef4444, #dc2626',
              headerTitle: '❌ Project Status Update',
              headerSubtitle: 'Regarding your project request'
            };
          default:
            return {
              subject: `📧 Project Update - ${selectedRequest.project_title}`,
              headerColor: '#3b82f6, #1d4ed8',
              headerTitle: '📧 Project Update',
              headerSubtitle: 'Update regarding your project request'
            };
        }
      };

      const config = getEmailConfig();
      
      const emailData = {
        sender: {
          name: 'TechCreator Development Team',
          email: 'mohanselenophile@gmail.com'
        },
        to: [{
          email: selectedRequest.customer_email,
          name: selectedRequest.customer_name
        }],
        subject: config.subject,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${config.headerTitle} - TechCreator</title>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="All">All Categories</option>
                  <option value="All">All Categories</option>
                  <option value="IoT">IoT</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Web">Web</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Other">Other</option>
                </select>
                <p>${config.headerSubtitle}</p>
              </div>
              
              <div class="content">
                <div class="message">
                  ${emailMessage.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div class="footer">
                <p>&copy; 2025 TechCreator. All rights reserved.</p>
                <p>Professional development services for your business needs.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        tags: ['project-request', emailType, 'customer-communication']
      };

      console.log('🚀 Sending project request email via Brevo...', {
        to: selectedRequest.customer_email,
        subject: config.subject,
        type: emailType
      });
      
      await sendBrevoEmail(emailData);

      console.log('✅ Project request email sent successfully via Brevo');
      
      // Show success notification
      const successMessage = `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} email sent successfully to ${selectedRequest.customer_email}!`;
      
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
      console.error('❌ Error sending project request email via Brevo:', error);
      
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

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateProjectRequestStatus(requestId, newStatus, user?.email, adminNotes);
      setAdminNotes('');
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvertToProject = (request: ProjectRequest) => {
    // Pre-fill the form with request data
    setProjectFormData({
      title: request.project_title,
      description: request.description,
      category: request.project_type,
      price: request.estimated_price || 0,
      image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      imageUpload: null,
      features: request.requirements ? [request.requirements] : ['Custom development based on requirements'],
      technical_details: request.requirements || 'Custom project based on client requirements',
      featured: false,
      updated_at: new Date().toISOString()
    });
    
    setSelectedRequest(request);
    setShowConversionModal(true);
  };

  const handleConfirmConversion = async () => {
    if (!selectedRequest) return;

    setIsConverting(true);
    try {
      // Create the project with the edited details
      await addProject(projectFormData);
      
      // Update the request status to converted
      await updateProjectRequestStatus(
        selectedRequest.id, 
        'converted', 
        user?.email, 
        `Converted to project: ${projectFormData.title}`
      );
      
      setShowConversionModal(false);
      setSelectedRequest(null);
      alert('Successfully converted to project!');
    } catch (error) {
      console.error('Error converting to project:', error);
      alert('Failed to convert to project. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleViewDetails = async (request: ProjectRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setShowDetailsModal(true);
  };

  const handleViewHistory = async (request: ProjectRequest) => {
    try {
      const history = await getRequestStatusHistory(request.id);
      setStatusHistory(history);
      setShowStatusHistory(true);
    } catch (error) {
      console.error('Error fetching status history:', error);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProjectRequest(requestId);
      if (selectedRequest?.id === requestId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  const handleSendMessage = (request: ProjectRequest) => {
    openEmailModal(request, 'acknowledgment');
  };

  // Handle feature list changes
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...projectFormData.features];
    updatedFeatures[index] = value;
    setProjectFormData({
      ...projectFormData,
      features: updatedFeatures
    });
  };

  // Add new feature input
  const addFeature = () => {
    setProjectFormData({
      ...projectFormData,
      features: [...projectFormData.features, '']
    });
  };

  // Remove feature input
  const removeFeature = (index: number) => {
    const updatedFeatures = [...projectFormData.features];
    updatedFeatures.splice(index, 1);
    setProjectFormData({
      ...projectFormData,
      features: updatedFeatures
    });
  };

  // Allowed categories for project conversion modal
  const allowedCategories = [
    { value: "IoT", label: "IoT" },
    { value: "Blockchain", label: "Blockchain" },
    { value: "Web", label: "Web Development" },
    { value: "Mobile", label: "Mobile App" },
    { value: "Other", label: "Other" }
  ];

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Project Requests</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage customer project requests and convert them to projects.</p>
          </div>
        </div>

        {/* Stats Cards - visually distinct accent colors for each metric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-700 dark:text-blue-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.total}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-yellow-300 dark:from-yellow-900 dark:to-yellow-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-700 dark:text-yellow-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{stats.pending}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-100 to-cyan-300 dark:from-cyan-900 dark:to-cyan-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-cyan-700 dark:text-cyan-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Reviewing</p>
                <h3 className="text-2xl font-bold text-cyan-900 dark:text-cyan-200">{stats.reviewing}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Approved</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.approved}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-purple-300 dark:from-purple-900 dark:to-purple-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <ArrowRight className="h-8 w-8 text-purple-700 dark:text-purple-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Converted</p>
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-200">{stats.converted}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-100 to-indigo-300 dark:from-indigo-900 dark:to-indigo-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-700 dark:text-indigo-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">This Month</p>
                <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{stats.thisMonth}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search input */}
            <div className="relative flex-1 min-w-[220px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search by customer name, email, or project title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
              />
            </div>

            {/* Export button */}
            <button
              onClick={exportAsCSV}
              disabled={selectedRequests.length === 0}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                selectedRequests.length > 0
                  ? 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                  : 'border-slate-300 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:text-slate-500'
              }`}
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedRequests.length})
            </button>

            {/* Email button */}
            <button
              onClick={sendEmail}
              disabled={selectedRequests.length === 0}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                selectedRequests.length > 0
                  ? 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-slate-700'
                  : 'border-slate-300 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:text-slate-500'
              }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email ({selectedRequests.length})
            </button>

            {/* Status filter button */}
            <div className="relative min-w-[150px] w-full md:w-auto">
              <button
                type="button"
                className="pl-4 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 w-full flex items-center justify-between focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setShowStatusDropdown((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showStatusDropdown ? 'true' : 'false'}
                id="statusFilterDropdown"
              >
                <span className="flex items-center">
                  <Filter className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="font-medium">
                    <span className={(!statusFilter ? 'text-blue-600 font-bold' : '')}>
                      Status: {statusFilter ? (statusOptions.find(opt => opt.value === statusFilter)?.label || statusFilter) : 'All'}
                    </span>
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 ml-2" />
              </button>
              {showStatusDropdown && (
                <ul
                  className="absolute left-0 mt-2 w-full z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg py-1"
                  role="listbox"
                  aria-labelledby="statusFilterDropdown"
                  tabIndex={-1}
                >
                  <li
                    key="all"
                    role="option"
                    aria-selected={!statusFilter ? 'true' : 'false'}
                    tabIndex={0}
                    onClick={() => { setStatusFilter(null); setShowStatusDropdown(false); }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter(null); setShowStatusDropdown(false); } }}
                    className={`cursor-pointer px-8 py-2 flex items-center transition-colors duration-150 ${!statusFilter ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'}`}
                  >
                    All
                  </li>
                  {statusOptions.map(option => (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={statusFilter === option.value ? 'true' : 'false'}
                      tabIndex={0}
                      onClick={() => { setStatusFilter(option.value); setShowStatusDropdown(false); }}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter(option.value); setShowStatusDropdown(false); } }}
                      className={`cursor-pointer px-8 py-2 flex items-center transition-colors duration-150 ${statusFilter === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'}`}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Priority filter button */}
            <div className="relative min-w-[150px] w-full md:w-auto">
              <button
                type="button"
                className="pl-4 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 w-full flex items-center justify-between focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setShowPriorityDropdown((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showPriorityDropdown ? 'true' : 'false'}
                id="priorityFilterDropdown"
              >
                <span className="flex items-center">
                  <Star className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="font-medium">
                    <span className={(!priorityFilter ? 'text-blue-600 font-bold' : '')}>
                      Priority: {priorityFilter ? (priorityOptions.find(opt => opt.value === priorityFilter)?.label || priorityFilter) : 'All'}
                    </span>
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 ml-2" />
              </button>
              {showPriorityDropdown && (
                <ul
                  className="absolute left-0 mt-2 w-full z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg py-1"
                  role="listbox"
                  aria-labelledby="priorityFilterDropdown"
                  tabIndex={-1}
                >
                  <li
                    key="all"
                    role="option"
                    aria-selected={!priorityFilter ? 'true' : 'false'}
                    tabIndex={0}
                    onClick={() => { setPriorityFilter(null); setShowPriorityDropdown(false); }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setPriorityFilter(null); setShowPriorityDropdown(false); } }}
                    className={`cursor-pointer px-8 py-2 flex items-center transition-colors duration-150 ${!priorityFilter ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'}`}
                  >
                    All
                  </li>
                  {priorityOptions.map(option => (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={priorityFilter === option.value ? 'true' : 'false'}
                      tabIndex={0}
                      onClick={() => { setPriorityFilter(option.value); setShowPriorityDropdown(false); }}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setPriorityFilter(option.value); setShowPriorityDropdown(false); } }}
                      className={`cursor-pointer px-8 py-2 flex items-center transition-colors duration-150 ${priorityFilter === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'}`}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Refresh project requests"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden mb-8">
          {sortedRequests.length === 0 ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-1">No project requests found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {projectRequests.length === 0 
                  ? "No project requests have been submitted yet." 
                  : "No requests match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 rounded"
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => requestSort('customer')}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortConfig?.key === 'customer' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => requestSort('project')}
                    >
                      <div className="flex items-center">
                        Project
                        {sortConfig?.key === 'project' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => requestSort('priority')}
                    >
                      <div className="flex items-center">
                        Priority
                        {sortConfig?.key === 'priority' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig?.key === 'status' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => requestSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig?.key === 'date' && (
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {sortedRequests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    const priorityBadge = getPriorityBadge(request.priority);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={() => handleSelect(request.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-8 w-8 text-slate-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{request.customer_name}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                <a href={`mailto:${request.customer_email}`} className="hover:underline text-sm text-blue-600 dark:text-blue-400">
                                  {request.customer_email}
                                </a>
                              </div>
                              {request.customer_phone && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <Phone className="w-4 h-4 text-green-500 dark:text-green-400" />
                                  <span className="text-xs text-slate-500 dark:text-slate-400">{request.customer_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{request.project_title}</div>
                            <div className="flex items-center space-x-2 mt-1 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectTypeColor(request.project_type)}`}>{request.project_type}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">• {request.budget_range}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                            {request.priority}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {request.status}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(request.created_at)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {/* Email Action Buttons */}
                            <button
                              onClick={() => openEmailModal(request, 'acknowledgment')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Send acknowledgment email"
                            >
                              <MailCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openEmailModal(request, 'quote')}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Send project quote"
                            >
                              <MessageSquare className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openEmailModal(request, 'approval')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Send approval email"
                            >
                              <MailPlus className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openEmailModal(request, 'rejection')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Send rejection email"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                            
                            {/* Existing Action Buttons */}
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleViewHistory(request)}
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                              title="View history"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            {/*
                            <button
                              onClick={() => window.location.href = `mailto:${request.customer_email}`}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors"
                              title="Send email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleSendMessage(request)}
                              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                              title="Send message"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            */}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleConvertToProject(request)}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                                title="Convert to project"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                              title="Delete request"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Email Composition Modal */}
      {showEmailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                  {emailType === 'acknowledgment' && (
                    <>
                      <MailCheck className="h-6 w-6 inline mr-2 text-blue-600" />
                      Send Acknowledgment Email
                    </>
                  )}
                  {emailType === 'quote' && (
                    <>
                      <MessageSquare className="h-6 w-6 inline mr-2 text-purple-600" />
                      Send Project Quote
                    </>
                  )}
                  {emailType === 'approval' && (
                    <>
                      <MailPlus className="h-6 w-6 inline mr-2 text-green-600" />
                      Send Approval Email
                    </>
                  )}
                  {emailType === 'rejection' && (
                    <>
                      <XCircle className="h-6 w-6 inline mr-2 text-red-600" />
                      Send Rejection Email
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

              {/* Customer & Project Info */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Customer Details:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-600 dark:text-slate-400">Name:</span> {selectedRequest.customer_name}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Email:</span> {selectedRequest.customer_email}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Phone:</span> {selectedRequest.customer_phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Project Details:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-600 dark:text-slate-400">Title:</span> {selectedRequest.project_title}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Type:</span> {selectedRequest.project_type}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Budget:</span> {selectedRequest.budget_range}</p>
                    <p><span className="text-slate-600 dark:text-slate-400">Priority:</span> {selectedRequest.priority}</p>
                  </div>
                </div>
              </div>

              {/* Email Subject Preview */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Subject (Preview)
                </label>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300">
                  {emailType === 'acknowledgment' && `📧 Project Request Received - ${selectedRequest.project_title}`}
                  {emailType === 'quote' && `💼 Project Proposal - ${selectedRequest.project_title}`}
                  {emailType === 'approval' && `✅ Project Approved - ${selectedRequest.project_title}`}
                  {emailType === 'rejection' && `❌ Project Update - ${selectedRequest.project_title}`}
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
                  rows={20}
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
                    emailType === 'acknowledgment' ? 'bg-blue-600 hover:bg-blue-700' :
                    emailType === 'quote' ? 'bg-purple-600 hover:bg-purple-700' :
                    emailType === 'approval' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-red-600 hover:bg-red-700'
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
                      Send {emailType.charAt(0).toUpperCase() + emailType.slice(1)} Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                  Project Request Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-900 dark:text-slate-200">Customer Information</h4>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg space-y-3">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-slate-400 mr-2" />
                      <span className="font-medium">{selectedRequest.customer_name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-slate-400 mr-2" />
                      <a href={`mailto:${selectedRequest.customer_email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedRequest.customer_email}
                      </a>
                    </div>
                    
                    {selectedRequest.customer_phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-slate-400 mr-2" />
                        <span>{selectedRequest.customer_phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-slate-400 mr-2" />
                      <span>{selectedRequest.budget_range}</span>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-900 dark:text-slate-200">Project Information</h4>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Title</label>
                      <p className="text-slate-900 dark:text-slate-200">{selectedRequest.project_title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</label>
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ml-2 ${getProjectTypeColor(selectedRequest.project_type)}`}>
                        {selectedRequest.project_type}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Priority</label>
                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ml-2 ${getPriorityBadge(selectedRequest.priority).bg} ${getPriorityBadge(selectedRequest.priority).text}`}>
                          {selectedRequest.priority}
                        </span>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ml-2 ${getStatusBadge(selectedRequest.status).bg} ${getStatusBadge(selectedRequest.status).text}`}>
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-3">Project Description</h4>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedRequest.requirements && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-3">Requirements</h4>
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedRequest.requirements}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-3">Admin Notes</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Add notes about this request..."
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'reviewing')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Start Review
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {selectedRequest.status === 'reviewing' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {selectedRequest.status === 'approved' && (
                  <button
                    onClick={() => handleConvertToProject(selectedRequest)}
                    disabled={isConverting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isConverting ? 'Converting...' : 'Convert to Project'}
                  </button>
                )}

                <button
                  onClick={() => handleViewHistory(selectedRequest)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Conversion Modal */}
      {showConversionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                  <Edit className="h-5 w-5 inline mr-2" />
                  Convert to Project - Review & Edit Details
                </h3>
                <button
                  onClick={() => setShowConversionModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  📋 Converting Request: {selectedRequest.project_title}
                </h4>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Review and modify the project details below before creating the project. All fields are pre-filled from the customer request.
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={projectFormData.category}
                      onChange={(e) => setProjectFormData({ ...projectFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                      required
                    >
                      {allowedCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={projectFormData.price}
                      onChange={(e) => setProjectFormData({ ...projectFormData, price: parseInt(e.target.value) || 0 })}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                      required
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Customer Budget: {selectedRequest.budget_range}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Project Image URL
                    </label>
                    <input
                      type="url"
                      value={projectFormData.image}
                      onChange={(e) => setProjectFormData({ ...projectFormData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Project Features
                  </label>
                  
                  {projectFormData.features.map((feature, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder={`Feature ${index + 1}`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 flex items-center justify-center h-10 w-10 rounded-md bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center px-3 py-1 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Technical Details
                  </label>
                  <textarea
                    value={projectFormData.technical_details}
                    onChange={(e) => setProjectFormData({ ...projectFormData, technical_details: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="Technologies used, implementation details, etc."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectFormData.featured}
                    onChange={(e) => setProjectFormData({ ...projectFormData, featured: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600"
                  />
                  <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Mark as featured project
                  </label>
                </div>
              </form>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowConversionModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                  disabled={isConverting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConversion}
                  disabled={isConverting || !projectFormData.title || !projectFormData.description}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showStatusHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                  Status History
                </h3>
                <button
                  onClick={() => setShowStatusHistory(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {statusHistory.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No status changes recorded.</p>
              ) : (
                <div className="space-y-4">
                  {statusHistory.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                            {entry.old_status && `${entry.old_status} → `}{entry.new_status}
                          </p>
                          {entry.changed_by && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Changed by: {entry.changed_by}
                            </p>
                          )}
                          {entry.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(entry.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProjectRequestsPage;