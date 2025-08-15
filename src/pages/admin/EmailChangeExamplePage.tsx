import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import EmailChangeExample from '../../components/admin/EmailChangeExample';

const EmailChangeExamplePage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">
            Email Change Example
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Example implementation of email change with confirmation modal
          </p>
        </div>
        
        <EmailChangeExample />
      </div>
    </AdminLayout>
  );
};

export default EmailChangeExamplePage;