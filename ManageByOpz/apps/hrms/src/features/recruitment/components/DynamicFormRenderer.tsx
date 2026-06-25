import React, { useEffect, useState } from 'react';
import { useGetFormDefinitionsQuery, useGetFieldDefinitionsQuery, useGetFieldValuesQuery, useSaveFieldValuesMutation } from '../recruitmentConfigApi';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface DynamicFormRendererProps {
  formName: string; // e.g. "REQUISITION" or "CANDIDATE"
  entityType: string; // e.g. "requisition" or "candidate"
  entityId?: string;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>, customValues: Array<{ fieldDefinitionId: string; fieldValue: string }>) => void;
  onCancel?: () => void;
}

export function DynamicFormRenderer({
  formName,
  entityType,
  entityId,
  initialValues = {},
  onSubmit,
  onCancel
}: DynamicFormRendererProps) {
  const { data: forms, isLoading: formsLoading } = useGetFormDefinitionsQuery();
  const formDef = forms?.find(f => f.formName === formName);
  
  const { data: fields, isLoading: fieldsLoading } = useGetFieldDefinitionsQuery(formDef?.id || '', {
    skip: !formDef?.id
  });

  const { data: savedCustomValues, isLoading: valuesLoading } = useGetFieldValuesQuery(
    { entityType, entityId: entityId || '' },
    { skip: !entityId }
  );

  const [formState, setFormState] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Populate formState with initialValues and saved custom values
    const state: Record<string, any> = { ...initialValues };
    if (savedCustomValues && fields) {
      savedCustomValues.forEach(val => {
        const field = fields.find(f => f.id === val.fieldDefinitionId);
        if (field) {
          state[field.fieldKey] = val.fieldValue;
        }
      });
    }
    // Set default values for defined fields if not present
    if (fields) {
      fields.forEach(f => {
        if (state[f.fieldKey] === undefined && f.defaultValue) {
          state[f.fieldKey] = f.defaultValue;
        }
      });
    }
    setFormState(state);
  }, [initialValues, savedCustomValues, fields]);

  if (formsLoading || fieldsLoading || (entityId && valuesLoading)) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
        <span className="text-sm text-gray-400">Loading form template...</span>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate fields
    fields?.forEach(f => {
      if (f.required && !formState[f.fieldKey]) {
        newErrors[f.fieldKey] = `${f.fieldLabel} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Split standard properties from custom field definitions
    const standardValues: Record<string, any> = {};
    const customValuesList: Array<{ fieldDefinitionId: string; fieldValue: string }> = [];

    // Map properties
    if (fields) {
      fields.forEach(f => {
        const val = formState[f.fieldKey] !== undefined ? String(formState[f.fieldKey]) : '';
        customValuesList.push({
          fieldDefinitionId: f.id!,
          fieldValue: val
        });
        standardValues[f.fieldKey] = formState[f.fieldKey];
      });
    }

    // Add any remaining initial values that might not be custom fields
    Object.keys(formState).forEach(k => {
      if (!(fields?.some(f => f.fieldKey === k))) {
        standardValues[k] = formState[k];
      }
    });

    onSubmit(standardValues, customValuesList);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields?.map(field => {
          if (!field.visible) return null;
          const isError = !!errors[field.fieldKey];

          return (
            <div key={field.id} className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-300 flex items-center justify-between">
                <span>
                  {field.fieldLabel}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </span>
                {isError && (
                  <span className="text-xs text-red-400 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors[field.fieldKey]}
                  </span>
                )}
              </label>

              {field.fieldType === 'textarea' ? (
                <textarea
                  value={formState[field.fieldKey] || ''}
                  onChange={e => handleChange(field.fieldKey, e.target.value)}
                  disabled={field.readOnly}
                  rows={3}
                  className={`bg-slate-900/60 border ${
                    isError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500'
                  } rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                />
              ) : field.fieldType === 'select' ? (
                <select
                  value={formState[field.fieldKey] || ''}
                  onChange={e => handleChange(field.fieldKey, e.target.value)}
                  disabled={field.readOnly}
                  className={`bg-slate-900/60 border ${
                    isError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500'
                  } rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2`}
                >
                  <option value="" className="bg-slate-950">Select option...</option>
                  {/* Custom selection options can be parsed here or from local field options if available */}
                  {field.defaultValue && (
                    <option value={field.defaultValue} className="bg-slate-950">{field.defaultValue}</option>
                  )}
                  {field.fieldKey === 'priority' && (
                    <>
                      <option value="LOW" className="bg-slate-950">LOW</option>
                      <option value="MEDIUM" className="bg-slate-950">MEDIUM</option>
                      <option value="HIGH" className="bg-slate-950">HIGH</option>
                      <option value="CRITICAL" className="bg-slate-950">CRITICAL</option>
                    </>
                  )}
                  {field.fieldKey === 'employmentType' && (
                    <>
                      <option value="FULL_TIME" className="bg-slate-950">Full Time</option>
                      <option value="PART_TIME" className="bg-slate-950">Part Time</option>
                      <option value="CONTRACT" className="bg-slate-950">Contract</option>
                      <option value="INTERN" className="bg-slate-950">Intern</option>
                    </>
                  )}
                </select>
              ) : (
                <input
                  type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                  value={formState[field.fieldKey] || ''}
                  onChange={e => handleChange(field.fieldKey, e.target.value)}
                  disabled={field.readOnly}
                  className={`bg-slate-900/60 border ${
                    isError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500'
                  } rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition"
        >
          <Save className="w-4 h-4" />
          Save Form
        </button>
      </div>
    </form>
  );
}
