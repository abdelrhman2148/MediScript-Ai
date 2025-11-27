import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PrescriptionData, Medication } from '../types';
import { savePrescription } from '../services/storageService';

const Review: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<PrescriptionData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state?.data) {
      setData(location.state.data);
    } else {
      navigate('/upload');
    }
  }, [location, navigate]);

  if (!data) return null;

  // Helper for deep updates
  const updateNested = (path: string[], value: string) => {
    setData(prev => {
      if (!prev) return null;
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setData(prev => {
      if (!prev) return null;
      const newMeds = [...prev.medications];
      newMeds[index] = { ...newMeds[index], [field]: value };
      return { ...prev, medications: newMeds };
    });
  };

  const removeMedication = (index: number) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, medications: prev.medications.filter((_, i) => i !== index) };
    });
  };

  const addMedication = () => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        medications: [...prev.medications, { 
          drug_name: '', strength: '', form: '', quantity: '', 
          refills: '', sig_instructions: '', din: '', fill_date: '' 
        }]
      };
    });
  };

  const handleApprove = async () => {
    if (!data) return;
    setIsSaving(true);
    // Force status update to approved
    const approvedData: PrescriptionData = { ...data, status: 'approved' };
    await savePrescription(approvedData);
    setIsSaving(false);
    navigate('/');
  };

  const renderSectionHeader = (title: string) => (
    <h2 className="text-lg font-semibold text-teal-800 border-b border-teal-100 pb-2 mb-4">{title}</h2>
  );

  const InputField = ({ label, value, onChange, placeholder }: { label: string, value: string | null, onChange: (val: string) => void, placeholder?: string }) => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold text-slate-900">Review Extraction</h1>
               <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${data.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                   {data.status === 'approved' ? 'Approved' : 'Pending'}
               </span>
           </div>
           <p className="text-slate-500 mt-1">Verify structured data extracted from the {data.document_type || 'document'}.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
            <Button onClick={handleApprove} isLoading={isSaving} className="bg-green-600 hover:bg-green-700">Approve & Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document & Patient Info */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          {renderSectionHeader("Document & Patient")}
          <div className="grid grid-cols-2 gap-4">
             <InputField label="Doc Type" value={data.document_type} onChange={(v) => updateNested(['document_type'], v)} />
             <InputField label="Issue Date (YYYY-MM-DD)" value={data.issue_date} onChange={(v) => updateNested(['issue_date'], v)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
             <InputField label="Patient Name" value={data.patient.name} onChange={(v) => updateNested(['patient', 'name'], v)} />
             <div className="grid grid-cols-2 gap-4">
                <InputField label="DOB" value={data.patient.dob} onChange={(v) => updateNested(['patient', 'dob'], v)} />
                <InputField label="Health Card (HCN)" value={data.patient.hcn} onChange={(v) => updateNested(['patient', 'hcn'], v)} />
             </div>
             <InputField label="Patient Address" value={data.patient.address} onChange={(v) => updateNested(['patient', 'address'], v)} />
          </div>
        </div>

        {/* Prescriber Info */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          {renderSectionHeader("Prescriber Info")}
          <div className="grid grid-cols-1 gap-4">
             <div className="grid grid-cols-2 gap-4">
               <InputField label="Prescriber Name" value={data.prescriber.name} onChange={(v) => updateNested(['prescriber', 'name'], v)} />
               <InputField label="License ID" value={data.prescriber.license_id} onChange={(v) => updateNested(['prescriber', 'license_id'], v)} />
             </div>
             <InputField label="Clinic Name" value={data.prescriber.clinic_name} onChange={(v) => updateNested(['prescriber', 'clinic_name'], v)} />
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Phone" value={data.prescriber.phone} onChange={(v) => updateNested(['prescriber', 'phone'], v)} />
                <InputField label="Fax" value={data.prescriber.fax} onChange={(v) => updateNested(['prescriber', 'fax'], v)} />
             </div>
          </div>
        </div>
      </div>

      {/* Medications */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-teal-800">Medications List</h2>
            <Button variant="secondary" onClick={addMedication} className="text-xs py-1 h-8">
                + Add Item
            </Button>
        </div>
        
        <div className="space-y-6">
          {data.medications.map((med, index) => (
            <div key={index} className="relative p-5 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-300 transition-colors">
              <button 
                onClick={() => removeMedication(index)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm"
                title="Remove"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Row 1 */}
                <div className="md:col-span-4">
                  <InputField label="Drug Name" value={med.drug_name} onChange={(v) => handleMedicationChange(index, 'drug_name', v)} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Strength" value={med.strength} onChange={(v) => handleMedicationChange(index, 'strength', v)} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Form" value={med.form} onChange={(v) => handleMedicationChange(index, 'form', v)} placeholder="TAB/CAP" />
                </div>
                 <div className="md:col-span-2">
                  <InputField label="DIN" value={med.din} onChange={(v) => handleMedicationChange(index, 'din', v)} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Fill Date" value={med.fill_date} onChange={(v) => handleMedicationChange(index, 'fill_date', v)} />
                </div>

                {/* Row 2 */}
                <div className="md:col-span-8">
                  <InputField label="Sig Instructions" value={med.sig_instructions} onChange={(v) => handleMedicationChange(index, 'sig_instructions', v)} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Qty" value={med.quantity} onChange={(v) => handleMedicationChange(index, 'quantity', v)} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Refills" value={med.refills} onChange={(v) => handleMedicationChange(index, 'refills', v)} />
                </div>
              </div>
            </div>
          ))}
          {data.medications.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500">No medications found.</p>
                  <button onClick={addMedication} className="text-teal-600 font-medium text-sm mt-2 hover:underline">Add one manually</button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;