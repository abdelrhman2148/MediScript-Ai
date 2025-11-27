import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { getPrescriptions } from '../services/storageService';
import { PrescriptionData } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const data = await getPrescriptions();
      setPrescriptions(data);
      setLoading(false);
    };
    fetchPrescriptions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage processed prescriptions</p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <span className="mr-2">+</span> Upload New
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
           <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">No prescriptions yet</h3>
          <p className="mt-2 text-slate-500 mb-6">Upload a prescription PDF to get started.</p>
          <Button variant="secondary" onClick={() => navigate('/upload')}>Upload First Document</Button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {prescriptions.map((script) => (
              <li key={script.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-teal-700 truncate">
                        {script.patient.name || 'Unknown Patient'}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${script.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {script.status === 'approved' ? 'Approved' : 'Pending Review'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {script.document_type || 'Document'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {script.prescriber.name || 'N/A'} • {script.medications.length} Medications
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Processed on {new Date(script.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button variant={script.status === 'approved' ? 'secondary' : 'primary'} onClick={() => {
                        navigate('/review', { state: { data: script } });
                    }}>
                        {script.status === 'approved' ? 'View Details' : 'Review & Approve'}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;