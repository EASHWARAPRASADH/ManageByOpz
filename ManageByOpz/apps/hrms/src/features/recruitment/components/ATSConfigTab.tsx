import React, { useState } from 'react';
import {
  useGetFormDefinitionsQuery,
  useSaveFormDefinitionMutation,
  useGetFieldDefinitionsQuery,
  useSaveFieldDefinitionMutation,
  useGetFormSectionsQuery,
  useSaveFormSectionMutation,
  useGetStagesQuery,
  useSaveStageMutation,
  useDeleteStageMutation,
  useGetInterviewTypesQuery,
  useSaveInterviewTypeMutation,
  useGetRecruitmentSourcesQuery,
  useSaveRecruitmentSourceMutation,
  useGetWorkflowDefinitionsQuery,
  useSaveWorkflowDefinitionMutation,
  useGetWorkflowStepsQuery,
  useSaveWorkflowStepMutation,
  useGetOfferTemplatesQuery,
  useSaveOfferTemplateMutation,
  useGetNotificationTemplatesQuery,
  useSaveNotificationTemplateMutation,
  useGetNotificationRulesQuery,
  useSaveNotificationRuleMutation,
  useGetAutomationRulesQuery,
  useSaveAutomationRuleMutation,
  useSaveAutomationConditionMutation,
  useSaveAutomationActionMutation,
  useGetHiringReasonsQuery,
  useSaveHiringReasonMutation,
  useGetSkillsQuery,
  useSaveSkillMutation
} from '../recruitmentConfigApi';
import {
  Settings,
  ListPlus,
  GitBranch,
  Layers,
  Zap,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  PlusCircle,
  FileText
} from 'lucide-react';

export function ATSConfigTab() {
  const [activeSubTab, setActiveSubTab] = useState<'fields' | 'stages' | 'interviews_sources' | 'workflows' | 'templates_rules' | 'hiring_reasons_skills'>('fields');
  const [selectedFormName, setSelectedFormName] = useState<'REQUISITION' | 'CANDIDATE'>('REQUISITION');

  const { data: forms } = useGetFormDefinitionsQuery();
  const activeFormDef = forms?.find(f => f.formName === selectedFormName);

  const { data: fields, refetch: refetchFields } = useGetFieldDefinitionsQuery(activeFormDef?.id || '', {
    skip: !activeFormDef?.id
  });
  const { data: sections, refetch: refetchSections } = useGetFormSectionsQuery(activeFormDef?.id || '', {
    skip: !activeFormDef?.id
  });
  const { data: stages, refetch: refetchStages } = useGetStagesQuery();
  const { data: interviewTypes, refetch: refetchIntTypes } = useGetInterviewTypesQuery();
  const { data: sources, refetch: refetchSources } = useGetRecruitmentSourcesQuery();
  const { data: workflows, refetch: refetchWfs } = useGetWorkflowDefinitionsQuery();
  const { data: templates } = useGetOfferTemplatesQuery();
  const { data: notifications } = useGetNotificationRulesQuery();
  const { data: automations } = useGetAutomationRulesQuery();

  const { data: hiringReasons, refetch: refetchReasons } = useGetHiringReasonsQuery();
  const { data: skills, refetch: refetchSkills } = useGetSkillsQuery();

  const [saveField] = useSaveFieldDefinitionMutation();
  const [saveSection] = useSaveFormSectionMutation();
  const [saveStage] = useSaveStageMutation();
  const [deleteStage] = useDeleteStageMutation();
  const [saveIntType] = useSaveInterviewTypeMutation();
  const [saveSource] = useSaveRecruitmentSourceMutation();
  const [saveWorkflow] = useSaveWorkflowDefinitionMutation();
  const [saveStep] = useSaveWorkflowStepMutation();
  const [saveTemplate] = useSaveOfferTemplateMutation();
  const [saveNotif] = useSaveNotificationRuleMutation();
  const [saveAuto] = useSaveAutomationRuleMutation();
  const [saveHiringReason] = useSaveHiringReasonMutation();
  const [saveSkill] = useSaveSkillMutation();

  // Field Form State
  const [fieldKey, setFieldKey] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOrder, setFieldOrder] = useState(1);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Section Form State
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionOrder, setNewSectionOrder] = useState(1);

  // Hiring Reason Form State
  const [reasonCode, setReasonCode] = useState('');
  const [reasonName, setReasonName] = useState('');

  // Skill Form State
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Stage Form State
  const [stageCode, setStageCode] = useState('');
  const [stageName, setStageName] = useState('');
  const [stageColor, setStageColor] = useState('#6366f1');
  const [stageOrder, setStageOrder] = useState(1);

  // Interview Type Form State
  const [typeName, setTypeName] = useState('');

  // Source Form State
  const [sourceName, setSourceName] = useState('');

  // Workflow Form State
  const [wfName, setWfName] = useState('');
  const [wfType, setWfType] = useState('REQUISITION');
  const [selectedWfId, setSelectedWfId] = useState('');
  const [stepName, setStepName] = useState('');
  const [stepOrder, setStepOrder] = useState(1);
  const [stepRole, setStepRole] = useState('ROLE_HR_MANAGER');

  // Templates state
  const [tplName, setTplName] = useState('');
  const [tplHtml, setTplHtml] = useState('');

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormDef?.id) return;
    await saveField({
      formId: activeFormDef.id,
      groupId: selectedSectionId || undefined,
      fieldKey,
      fieldLabel,
      fieldType,
      required: fieldRequired,
      visible: true,
      readOnly: false,
      displayOrder: Number(fieldOrder)
    });
    setFieldKey('');
    setFieldLabel('');
    setFieldRequired(false);
    refetchFields();
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormDef?.id) return;
    await saveSection({
      formId: activeFormDef.id,
      sectionName: newSectionName,
      displayOrder: Number(newSectionOrder)
    });
    setNewSectionName('');
    setNewSectionOrder(prev => prev + 1);
    refetchSections();
  };

  const handleAddHiringReason = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveHiringReason({
      reasonCode,
      reasonName,
      active: true
    });
    setReasonCode('');
    setReasonName('');
    refetchReasons();
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSkill({
      skillName,
      category: skillCategory || undefined,
      active: true
    });
    setSkillName('');
    setSkillCategory('');
    refetchSkills();
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStage({
      stageCode,
      stageName,
      stageColor,
      displayOrder: Number(stageOrder),
      active: true
    });
    setStageCode('');
    setStageName('');
    refetchStages();
  };

  const handleDeleteStage = async (id: string) => {
    if (confirm('Are you sure you want to delete this stage?')) {
      await deleteStage(id);
      refetchStages();
    }
  };

  const handleAddIntType = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveIntType({ typeName, active: true });
    setTypeName('');
    refetchIntTypes();
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSource({ sourceName, active: true });
    setSourceName('');
    refetchSources();
  };

  const handleAddWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveWorkflow({ workflowName: wfName, workflowType: wfType, active: true });
    setWfName('');
    refetchWfs();
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWfId) return;
    await saveStep({
      workflowDefinitionId: selectedWfId,
      stepName,
      stepOrder: Number(stepOrder),
      approverRole: stepRole
    });
    setStepName('');
    setStepOrder(prev => prev + 1);
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTemplate({
      templateName: tplName,
      templateType: 'OFFER_LETTER',
      templateHtml: tplHtml
    });
    setTplName('');
    setTplHtml('');
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ATS Configuration Cockpit
          </h2>
          <p className="text-slate-550 dark:text-gray-400 text-sm">Configure fields, recruitment stages, workflows, templates and automation rules dynamically.</p>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 max-w-max">
        <button
          onClick={() => setActiveSubTab('fields')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === 'fields'
              ? 'bg-indigo-600 text-white shadow-lg dark:bg-indigo-500'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          Fields Configuration
        </button>
        <button
          onClick={() => setActiveSubTab('stages')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === 'stages'
              ? 'bg-indigo-600 text-white shadow-lg dark:bg-indigo-500'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Pipeline Stages
        </button>
        <button
          onClick={() => setActiveSubTab('interviews_sources')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === 'interviews_sources'
              ? 'bg-indigo-600 text-white shadow-lg dark:bg-indigo-500'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Interviews & Sources
        </button>
        <button
          onClick={() => setActiveSubTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === 'workflows'
              ? 'bg-indigo-600 text-white shadow-lg dark:bg-indigo-500'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Approval Workflows
        </button>
        <button
          onClick={() => setActiveSubTab('templates_rules')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === 'templates_rules'
              ? 'bg-indigo-600 text-white shadow-lg dark:bg-indigo-500'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-4 h-4" />
          Templates & Automation
        </button>
        <button
          onClick={() => setActiveSubTab('hiring_reasons_skills')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === 'hiring_reasons_skills'
              ? 'bg-indigo-600 text-white shadow-lg dark:bg-indigo-500'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Hiring Reasons & Skills
        </button>
      </div>

      {/* Sub Tab Content */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm">
        {activeSubTab === 'fields' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-700 dark:text-gray-300 font-semibold">Select Form Template:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFormName('REQUISITION')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                      selectedFormName === 'REQUISITION'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-550 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Manpower Requisition Form
                  </button>
                  <button
                    onClick={() => setSelectedFormName('CANDIDATE')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                      selectedFormName === 'CANDIDATE'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-550 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Candidate Form
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Fields List grouped by Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Form Schema</h3>
                </div>

                <div className="space-y-6">
                  {sections?.map(section => {
                    const sectionFields = fields?.filter(f => f.groupId === section.id) || [];
                    return (
                      <div key={section.id} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <span>{section.sectionName}</span>
                            <span className="text-[10px] text-slate-450 dark:text-gray-500 font-mono font-normal">(Order: {section.displayOrder})</span>
                          </h4>
                        </div>
                        <div className="divide-y divide-slate-150 dark:divide-slate-800/50">
                          {sectionFields.map(field => (
                            <div key={field.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10 transition px-1 rounded-md">
                              <div>
                                <div className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                  {field.fieldLabel}
                                  {field.required && (
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-50 text-red-650 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
                                  Key: {field.fieldKey} | Type: {field.fieldType} | Order: {field.displayOrder}
                                </div>
                              </div>
                            </div>
                          ))}
                          {sectionFields.length === 0 && (
                            <div className="text-xs text-slate-550 dark:text-gray-500 italic py-2 text-center">No fields assigned to this group yet.</div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Unassigned fields */}
                  {(() => {
                    const unassigned = fields?.filter(f => !f.groupId || !sections?.some(s => s.id === f.groupId)) || [];
                    if (unassigned.length > 0) {
                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Unassigned Fields</h4>
                          </div>
                          <div className="divide-y divide-slate-150 dark:divide-slate-800/50">
                            {unassigned.map(field => (
                              <div key={field.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10 transition px-1 rounded-md">
                                <div>
                                  <div className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    {field.fieldLabel}
                                    {field.required && (
                                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-50 text-red-650 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
                                    Key: {field.fieldKey} | Type: {field.fieldType} | Order: {field.displayOrder}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {(!fields || fields.length === 0) && (!sections || sections.length === 0) && (
                    <div className="p-8 text-center text-slate-500 dark:text-gray-500 text-sm border border-slate-250 dark:border-slate-800 rounded-xl">No form elements defined.</div>
                  )}
                </div>
              </div>

              {/* Add Field & Group Forms */}
              <div className="space-y-6">
                {/* Add Field Group Form */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                    Create Field Group
                  </h3>
                  <form onSubmit={handleAddSection} className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Group Name</label>
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={e => setNewSectionName(e.target.value)}
                        placeholder="e.g. Compensation Details"
                        required
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Display Order</label>
                      <input
                        type="number"
                        value={newSectionOrder}
                        onChange={e => setNewSectionOrder(Number(e.target.value))}
                        required
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Add Group
                    </button>
                  </form>
                </div>

                {/* Add Custom Field Form */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-655 dark:text-indigo-400" />
                    Add Custom Field
                  </h3>
                  <form onSubmit={handleAddField} className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Assign to Group</label>
                      <select
                        value={selectedSectionId}
                        onChange={e => setSelectedSectionId(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- No Group (Unassigned) --</option>
                        {sections?.map(s => (
                          <option key={s.id} value={s.id}>{s.sectionName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Field Label</label>
                      <input
                        type="text"
                        value={fieldLabel}
                        onChange={e => setFieldLabel(e.target.value)}
                        placeholder="e.g. Target CTC"
                        required
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Field Key (Unique ID)</label>
                      <input
                        type="text"
                        value={fieldKey}
                        onChange={e => setFieldKey(e.target.value)}
                        placeholder="e.g. targetCtc"
                        required
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Field Type</label>
                      <select
                        value={fieldType}
                        onChange={e => setFieldType(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="TEXT">Short Text</option>
                        <option value="TEXTAREA">Long Paragraph</option>
                        <option value="NUMBER">Numeric Input</option>
                        <option value="CURRENCY">Currency</option>
                        <option value="DATE">Date picker</option>
                        <option value="DROPDOWN">Dropdown</option>
                        <option value="MULTI_SELECT">Multi Select</option>
                        <option value="RADIO">Radio</option>
                        <option value="CHECKBOX">Checkbox</option>
                        <option value="EMPLOYEE_LOOKUP">Employee Lookup</option>
                        <option value="DEPARTMENT_LOOKUP">Department Lookup</option>
                        <option value="LOCATION_LOOKUP">Location Lookup</option>
                        <option value="FILE_UPLOAD">File Upload</option>
                        <option value="RICH_TEXT">Rich Text</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Display Order</label>
                      <input
                        type="number"
                        value={fieldOrder}
                        onChange={e => setFieldOrder(Number(e.target.value))}
                        required
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={fieldRequired}
                        onChange={e => setFieldRequired(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-indigo-650 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                      />
                      <label htmlFor="required" className="text-sm text-slate-700 dark:text-gray-300">
                        Mark as required field
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Add Field to Schema
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'stages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stages List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Configurable Pipeline Stages</h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                {stages?.map(stage => (
                  <div key={stage.id} className="p-4 flex items-center justify-between hover:bg-slate-55/50 dark:hover:bg-slate-800/20 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.stageColor || '#6366f1' }} />
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-white">{stage.stageName}</div>
                        <div className="text-xs text-slate-450 dark:text-gray-400 font-mono mt-0.5">
                          Code: {stage.stageCode} | Order: {stage.displayOrder}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStage(stage.id!)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!stages || stages.length === 0) && (
                  <div className="p-8 text-center text-slate-500 dark:text-gray-500 text-sm">No hiring stages defined.</div>
                )}
              </div>
            </div>

            {/* Add Stage Form */}
            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                Add Pipeline Stage
              </h3>
              <form onSubmit={handleAddStage} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Stage Name</label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={e => setStageName(e.target.value)}
                    placeholder="e.g. Technical Round 1"
                    required
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Stage Code (Unique ID)</label>
                  <input
                    type="text"
                    value={stageCode}
                    onChange={e => setStageCode(e.target.value)}
                    placeholder="e.g. TECH_ROUND_1"
                    required
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Stage Theme Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={stageColor}
                      onChange={e => setStageColor(e.target.value)}
                      className="w-10 h-9 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stageColor}
                      onChange={e => setStageColor(e.target.value)}
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono flex-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Display Order</label>
                  <input
                    type="number"
                    value={stageOrder}
                    onChange={e => setStageOrder(Number(e.target.value))}
                    required
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                >
                  Add Pipeline Stage
                </button>
              </form>
            </div>
          </div>
        )}

        {activeSubTab === 'interviews_sources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interview Types */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                  Define Interview Types
                </h3>
                <form onSubmit={handleAddIntType} className="flex gap-2">
                  <input
                    type="text"
                    value={typeName}
                    onChange={e => setTypeName(e.target.value)}
                    placeholder="e.g. Executive Interview"
                    required
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Add
                  </button>
                </form>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                  {interviewTypes?.map(type => (
                    <div key={type.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <span className="text-sm text-slate-700 dark:text-gray-200">{type.typeName}</span>
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruitment Sources */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                  Define Recruitment Channels (Sources)
                </h3>
                <form onSubmit={handleAddSource} className="flex gap-2">
                  <input
                    type="text"
                    value={sourceName}
                    onChange={e => setSourceName(e.target.value)}
                    placeholder="e.g. LinkedIn Recruit"
                    required
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Add
                  </button>
                </form>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                  {sources?.map(source => (
                    <div key={source.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <span className="text-sm text-slate-700 dark:text-gray-200">{source.sourceName}</span>
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'workflows' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Workflows List */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Approval Workflows</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows?.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWfId(wf.id!)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedWfId === wf.id
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500'
                        : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{wf.workflowName}</div>
                    <div className="text-xs text-slate-450 dark:text-gray-400 mt-1">Type: {wf.workflowType}</div>
                  </div>
                ))}
              </div>

              {selectedWfId && (
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Design Steps</h4>
                  <div className="space-y-2">
                    <WorkflowStepsList workflowId={selectedWfId} />
                  </div>

                  <form onSubmit={handleAddStep} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      value={stepName}
                      onChange={e => setStepName(e.target.value)}
                      placeholder="Step Name (e.g. HR Head)"
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                    <select
                      value={stepRole}
                      onChange={e => setStepRole(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="ROLE_HR_MANAGER">HR Manager</option>
                      <option value="ROLE_FINANCE_DIRECTOR">Finance Director</option>
                      <option value="ROLE_ADMIN">Administrator</option>
                      <option value="ROLE_RECRUITER">Recruiter</option>
                    </select>
                    <button
                      type="submit"
                      className="py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Add Step
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Add Workflow Form */}
            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                Create Approval Flow
              </h3>
              <form onSubmit={handleAddWorkflow} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Workflow Name</label>
                  <input
                    type="text"
                    value={wfName}
                    onChange={e => setWfName(e.target.value)}
                    placeholder="e.g. Exec Requisition Approval"
                    required
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Workflow Type</label>
                  <select
                    value={wfType}
                    onChange={e => setWfType(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="REQUISITION">Manpower Requisition</option>
                    <option value="OFFER">Hiring Offer Letter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                >
                  Create Workflow
                </button>
              </form>
            </div>
          </div>
        )}

        {activeSubTab === 'templates_rules' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Offer Templates builder */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                  Configure Offer Letter Templates
                </h3>
                <form onSubmit={handleAddTemplate} className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Template Name</label>
                    <input
                      type="text"
                      value={tplName}
                      onChange={e => setTplName(e.target.value)}
                      placeholder="e.g. Standard Offer Letter"
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Template HTML Body</label>
                    <textarea
                      value={tplHtml}
                      onChange={e => setTplHtml(e.target.value)}
                      rows={8}
                      placeholder="Use placeholders like {{candidate_name}} or {{ctc}} in your HTML..."
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Save Template
                  </button>
                </form>
              </div>

              {/* Automation Rules list */}
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                    Hiring Automations
                  </h3>
                  <div className="space-y-3">
                    {automations?.map(rule => (
                      <div key={rule.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{rule.ruleName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">Trigger: {rule.triggerEvent}</div>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30 rounded-md">
                          Active
                        </span>
                      </div>
                    ))}
                    {(!automations || automations.length === 0) && (
                      <div className="text-center text-xs text-slate-400 dark:text-gray-500 py-4">No automation rules configured.</div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                    Notification Alerts
                  </h3>
                  <div className="space-y-3">
                    {notifications?.map(rule => (
                      <div key={rule.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{rule.ruleName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">Event: {rule.eventType}</div>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded-md">
                          Active
                        </span>
                      </div>
                    ))}
                    {(!notifications || notifications.length === 0) && (
                      <div className="text-center text-xs text-slate-400 dark:text-gray-500 py-4">No notification alerts configured.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeSubTab === 'hiring_reasons_skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hiring Reasons Column */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                  Define Hiring Reasons
                </h3>
                <form onSubmit={handleAddHiringReason} className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Reason Code</label>
                    <input
                      type="text"
                      value={reasonCode}
                      onChange={e => setReasonCode(e.target.value)}
                      placeholder="e.g. PROJECT_EXPANSION"
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Reason Name</label>
                    <input
                      type="text"
                      value={reasonName}
                      onChange={e => setReasonName(e.target.value)}
                      placeholder="e.g. Project Expansion"
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Add Hiring Reason
                  </button>
                </form>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                  {hiringReasons?.map(reason => (
                    <div key={reason.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <div>
                        <span className="text-sm font-semibold text-slate-750 dark:text-gray-200">{reason.reasonName}</span>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">Code: {reason.reasonCode}</div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                  {(!hiringReasons || hiringReasons.length === 0) && (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-gray-500">No hiring reasons defined.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Master Column */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-655 dark:text-indigo-400" />
                  Define Skills Master
                </h3>
                <form onSubmit={handleAddSkill} className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-555 dark:text-gray-400 font-semibold">Skill Name</label>
                    <input
                      type="text"
                      value={skillName}
                      onChange={e => setSkillName(e.target.value)}
                      placeholder="e.g. React.js, Python, Kubernetes"
                      required
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-slate-555 dark:text-gray-400 font-semibold">Category (Optional)</label>
                    <input
                      type="text"
                      value={skillCategory}
                      onChange={e => setSkillCategory(e.target.value)}
                      placeholder="e.g. Frontend Development"
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Add Skill
                  </button>
                </form>

                {/* Search / Filter skills */}
                <div className="flex flex-col space-y-1 pt-2">
                  <label className="text-xs text-slate-550 dark:text-gray-400 font-semibold">Search Skills</label>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={e => setSkillSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 max-h-[250px] overflow-y-auto">
                  {skills
                    ?.filter(skill => skill.skillName.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                    ?.map(skill => (
                      <div key={skill.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <div>
                          <span className="text-sm font-semibold text-slate-750 dark:text-gray-200">{skill.skillName}</span>
                          {skill.category && <div className="text-[10px] text-slate-500 dark:text-gray-400">{skill.category}</div>}
                        </div>
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded">
                          Active
                        </span>
                      </div>
                    ))}
                  {(!skills || skills.length === 0) && (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-gray-500">No skills defined.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowStepsList({ workflowId }: { workflowId: string }) {
  const { data: steps } = useGetWorkflowStepsQuery(workflowId);

  return (
    <div className="space-y-2">
      {steps?.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
            {idx + 1}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-850 dark:text-white">{step.stepName}</div>
            <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">Approver Role: {step.approverRole}</div>
          </div>
        </div>
      ))}
      {(!steps || steps.length === 0) && (
        <div className="text-center text-xs text-slate-400 dark:text-gray-500 py-2">No approval steps defined for this workflow yet.</div>
      )}
    </div>
  );
}
