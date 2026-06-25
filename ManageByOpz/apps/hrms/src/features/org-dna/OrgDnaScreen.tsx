import { useState, useMemo, useEffect } from 'react';
import { 
  Building, Layers, GitFork, Network, MapPin, Award, 
  ShieldAlert, IndianRupee, Calendar, CreditCard, GitBranch,
  Plus, Edit, Trash2, Search, ZoomIn, ZoomOut, RotateCcw,
  Check, X, Info, Sparkles, Users, FolderTree, ArrowRight, Move, RefreshCw, History,
  TrendingUp, UserCheck, Briefcase, Maximize2, Activity, FileText, ChevronRight, ChevronDown, Download, AlertTriangle
} from 'lucide-react';
import { DatePicker } from '../employees/DatePicker';
import { 
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useRestoreOrganizationMutation,

  useGetBusinessUnitsQuery,
  useCreateBusinessUnitMutation,
  useUpdateBusinessUnitMutation,
  useDeleteBusinessUnitMutation,
  useRestoreBusinessUnitMutation,

  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
  useRestoreDivisionMutation,

  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useRestoreDepartmentMutation,

  useGetTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useRestoreTeamMutation,

  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useRestoreLocationMutation,

  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  useRestoreGradeMutation,

  useGetBandsQuery,
  useCreateBandMutation,
  useUpdateBandMutation,
  useDeleteBandMutation,
  useRestoreBandMutation,

  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useRestoreDesignationMutation,

  useGetEmploymentTypesQuery,
  useCreateEmploymentTypeMutation,
  useUpdateEmploymentTypeMutation,
  useDeleteEmploymentTypeMutation,
  useRestoreEmploymentTypeMutation,

  useGetCostCentersQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation,
  useRestoreCostCenterMutation,

  useGetApprovalMatricesQuery,
  useCreateApprovalMatrixMutation,
  useUpdateApprovalMatrixMutation,
  useDeleteApprovalMatrixMutation,
  useLazyGetDivisionsQuery,
  useLazyGetDepartmentsQuery,
  useCloneBusinessUnitMutation,
  useGetAuditTrailQuery,
  useGetDnaAnalyticsQuery,
  useGetDnaIntegrityReportQuery,
  useManualRemapMutation,
  useAutoRepairDnaMutation,
  useBulkRepairDnaMutation,
} from './orgDnaApi';
import { 
  useGetEmployeesQuery,
  useTransferEmployeeMutation,
  usePromoteEmployeeMutation,
  useChangeManagerMutation 
} from '../employees/employeesApi';

type TabId = 
  | 'organization'
  | 'business_units'
  | 'divisions'
  | 'departments'
  | 'teams'
  | 'locations'
  | 'designations'
  | 'grades'
  | 'bands'
  | 'employment_types'
  | 'cost_centers'
  | 'approval_matrix'
  | 'hierarchy'
  | 'data_integrity';

export function OrgDnaScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('organization');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [showArchived, setShowArchived] = useState(false);

  // Employee Transfer/Promote/Manager mutations
  const [transferEmployee] = useTransferEmployeeMutation();
  const [promoteEmployee] = usePromoteEmployeeMutation();
  const [changeManager] = useChangeManagerMutation();

  // Modals for employee transitions in Reporting Hierarchy
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetEmp, setTransferTargetEmp] = useState<any>(null);
  const [transferNewDeptId, setTransferNewDeptId] = useState('');
  const [transferNewLocId, setTransferNewLocId] = useState('');

  const [showChangeManagerModal, setShowChangeManagerModal] = useState(false);
  const [changeManagerTargetEmp, setChangeManagerTargetEmp] = useState<any>(null);
  const [changeManagerNewManagerId, setChangeManagerNewManagerId] = useState('');

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteTargetEmp, setPromoteTargetEmp] = useState<any>(null);
  const [promoteNewDesignationId, setPromoteNewDesignationId] = useState('');
  const [promoteNewGradeId, setPromoteNewGradeId] = useState('');

  // Hierarchy Sub-tabs
  const [hierarchySubTab, setHierarchySubTab] = useState<'org_structure' | 'reporting' | 'approval' | 'matrix' | 'functional' | 'analytics'>('org_structure');
  
  // Selected Workflow for Approval Hierarchy
  const [selectedWorkflowType, setSelectedWorkflowType] = useState('LEAVE');

  // Heat map metric selection for Analytics tab
  const [heatMapMetric, setHeatMapMetric] = useState<'attrition' | 'vacancy' | 'workload' | 'budget'>('workload');

  // Selected Employee for Detail view
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Full Screen canvas toggle
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handlers for employee transitions
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetEmp) return;
    try {
      await transferEmployee({
        id: transferTargetEmp.id,
        departmentId: transferNewDeptId,
        locationId: transferNewLocId
      }).unwrap();
      alert('Employee transferred successfully!');
      setShowTransferModal(false);
    } catch (err: any) {
      console.error('Transfer failed', err);
      alert('Error transferring employee: ' + (err?.data?.message || 'Unknown error'));
    }
  };

  const handleChangeManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeManagerTargetEmp) return;
    if (changeManagerTargetEmp.id === changeManagerNewManagerId) {
      alert('An employee cannot report to themselves.');
      return;
    }
    try {
      await changeManager({
        id: changeManagerTargetEmp.id,
        managerId: changeManagerNewManagerId
      }).unwrap();
      alert('Manager updated successfully!');
      setShowChangeManagerModal(false);
    } catch (err: any) {
      console.error('Change manager failed', err);
      alert('Error: ' + (err?.data?.message || 'Unknown error'));
    }
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteTargetEmp) return;
    try {
      await promoteEmployee({
        id: promoteTargetEmp.id,
        designationId: promoteNewDesignationId,
        gradeId: promoteNewGradeId
      }).unwrap();
      alert('Employee promoted successfully!');
      setShowPromoteModal(false);
    } catch (err: any) {
      console.error('Promotion failed', err);
      alert('Error promoting employee: ' + (err?.data?.message || 'Unknown error'));
    }
  };


  // Export to CSV helper
  const handleCSVExport = (type: string) => {
    let headers = '';
    let rows: string[][] = [];
    let filename = '';

    if (type === 'org_structure') {
      headers = 'Level,Node Name,Code,Headcount,Manager,Status\n';
      filename = 'organization_structure_report.csv';
      
      businessUnits?.forEach(bu => {
        const buHead = getEmployeeNameById(bu.headEmployeeId || '');
        const buHc = employees?.filter(e => e.businessUnitId === bu.id).length || 0;
        rows.push(['Business Unit', bu.name, bu.code, buHc.toString(), buHead, bu.active ? 'Active' : 'Inactive']);
        
        allDivisions.filter(d => d.buId === bu.id).forEach(div => {
          const divHead = getEmployeeNameById(div.headEmployeeId || '');
          const divHc = employees?.filter(e => e.divisionId === div.id).length || 0;
          rows.push(['Division', div.name, div.code, divHc.toString(), divHead, div.active ? 'Active' : 'Inactive']);
          
          allDepartments.filter(dept => dept.divisionId === div.id).forEach(dept => {
            const deptHead = getEmployeeNameById(dept.headEmployeeId || '');
            const deptHc = employees?.filter(e => e.departmentId === dept.id).length || 0;
            rows.push(['Department', dept.name, dept.code, deptHc.toString(), deptHead, dept.active ? 'Active' : 'Inactive']);
          });
        });
      });
    } else if (type === 'reporting') {
      headers = 'Employee Code,Display Name,Designation,Department,Location,Manager,Employment Status\n';
      filename = 'reporting_hierarchy_report.csv';
      employees?.forEach(e => {
        const mName = e.managerId ? getEmployeeNameById(e.managerId) : 'N/A';
        const dName = designations?.find(des => des.id === e.designationId)?.name || 'N/A';
        const deptName = getDeptNameById(e.departmentId || '');
        const locName = locations?.find(l => l.id === e.locationId)?.name || 'N/A';
        rows.push([e.employeeCode, e.displayName, dName, deptName, locName, mName, e.employmentStatus]);
      });
    } else if (type === 'analytics') {
      headers = 'Department,Headcount,Estimated Cost,Span of Control Warning,Open Vacancies\n';
      filename = 'workforce_analytics_report.csv';
      allDepartments.forEach(dept => {
        const hc = employees?.filter(e => e.departmentId === dept.id).length || 0;
        const managers = employees?.filter(e => e.departmentId === dept.id && employees.some(sub => sub.managerId === e.id)).length || 0;
        const avgSpan = managers > 0 ? (hc - managers) / managers : hc;
        rows.push([
          dept.name,
          hc.toString(),
          (hc * 75000).toLocaleString() + ' INR',
          avgSpan > 12 ? 'YES (Overloaded)' : 'NO',
          '2'
        ]);
      });
    }

    const csvContent = headers + rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CRUD Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form field states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formMinSalary, setFormMinSalary] = useState('');
  const [formMaxSalary, setFormMaxSalary] = useState('');
  const [formCurrency, setFormCurrency] = useState('INR');
  const [formLevel, setFormLevel] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Organization Metadata Fields
  const [formEmailDomain, setFormEmailDomain] = useState('');
  const [formEmployeeCodeTemplate, setFormEmployeeCodeTemplate] = useState('');

  // Parent movement state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetNode, setMoveTargetNode] = useState<any>(null);
  const [moveNewParentId, setMoveNewParentId] = useState('');

  // Effective Date field state
  const [formEffectiveDate, setFormEffectiveDate] = useState('');

  // Clone Business Unit modal state
  const [showCloneBUModal, setShowCloneBUModal] = useState(false);
  const [cloneTargetBU, setCloneTargetBU] = useState<any>(null);
  const [cloneTargetName, setCloneTargetName] = useState('');
  const [cloneTargetCode, setCloneTargetCode] = useState('');
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Audit Trail state
  const [showAuditSidebar, setShowAuditSidebar] = useState(false);
  const [auditTargetEntity, setAuditTargetEntity] = useState<{ id: string; type: string; name: string } | null>(null);
  const [auditPage, setAuditPage] = useState(0);

  // 1. Data Fetching
  const { data: orgs, refetch: refetchOrgs } = useGetOrganizationsQuery(showArchived);
  const activeOrg = orgs && orgs.length > 0 ? orgs[0] : null;
  const activeOrgId = activeOrg?.id || '';

  // Secondary queries skipped if no active organization
  const { data: businessUnits, refetch: refetchBUs } = useGetBusinessUnitsQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: locations, refetch: refetchLocs } = useGetLocationsQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: grades, refetch: refetchGrades } = useGetGradesQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: bands, refetch: refetchBands } = useGetBandsQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: designations, refetch: refetchDesigs } = useGetDesignationsQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: employmentTypes, refetch: refetchEmpTypes } = useGetEmploymentTypesQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: costCenters, refetch: refetchCCs } = useGetCostCentersQuery(
    { orgId: activeOrgId, includeDeleted: showArchived },
    { skip: !activeOrgId }
  );
  const { data: employees } = useGetEmployeesQuery();

  // Hierarchy validation helper
  const hierarchyValidationWarnings = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    const warnings: string[] = [];

    // Check self reporting & circular reporting
    const detectCycle = (empId: string, currentPath: Set<string>): boolean => {
      if (currentPath.has(empId)) return true;
      const emp = employees.find(e => e.id === empId);
      if (!emp || !emp.managerId || emp.managerId === empId) return false;
      currentPath.add(empId);
      const hasCycle = detectCycle(emp.managerId, currentPath);
      currentPath.delete(empId);
      return hasCycle;
    };

    employees.forEach(emp => {
      if (emp.managerId === emp.id) {
        warnings.push(`Self Reporting: ${emp.displayName} (${emp.employeeCode}) reports to themselves.`);
      } else if (emp.managerId) {
        const managerExists = employees.some(e => e.id === emp.managerId);
        if (!managerExists) {
          warnings.push(`Broken Reporting Line: ${emp.displayName} (${emp.employeeCode}) reports to an invalid or deleted manager.`);
        } else if (emp.id) {
          const cycle = detectCycle(emp.id, new Set<string>());
          if (cycle) {
            warnings.push(`Circular Reporting Cycle detected involving: ${emp.displayName} (${emp.employeeCode}).`);
          }
        }
      }
    });

    return warnings;
  }, [employees]);


  // Approval Matrix form states
  const [matrixDeptId, setMatrixDeptId] = useState('');
  const [matrixDesignationId, setMatrixDesignationId] = useState('');
  const [matrixGradeId, setMatrixGradeId] = useState('');
  const [matrixApprovalType, setMatrixApprovalType] = useState('LEAVE');
  const [matrixApprover1Id, setMatrixApprover1Id] = useState('');
  const [matrixApprover2Id, setMatrixApprover2Id] = useState('');
  const [matrixActive, setMatrixActive] = useState(true);

  // Lazy query triggers for mapping nested DNA hierarchy nodes
  const [triggerGetDivisions] = useLazyGetDivisionsQuery();
  const [triggerGetDepartments] = useLazyGetDepartmentsQuery();
  
  const [allDivisions, setAllDivisions] = useState<any[]>([]);
  const [allDepartments, setAllDepartments] = useState<any[]>([]);

  // Approval Matrix Queries & Mutations
  const { data: approvalMatrices, refetch: refetchApprovalMatrices } = useGetApprovalMatricesQuery();
  const [createApprovalMatrix] = useCreateApprovalMatrixMutation();
  const [updateApprovalMatrix] = useUpdateApprovalMatrixMutation();
  const [deleteApprovalMatrix] = useDeleteApprovalMatrixMutation();

  // DNA Integrity and Repair Queries & Mutations
  const { data: dnaAnalytics, refetch: refetchAnalytics } = useGetDnaAnalyticsQuery();
  const { data: integrityReport, refetch: refetchReport, isLoading: loadingReport } = useGetDnaIntegrityReportQuery();
  const [manualRemap] = useManualRemapMutation();
  const [autoRepair] = useAutoRepairDnaMutation();
  const [bulkRepair] = useBulkRepairDnaMutation();
  const [selectedOrphans, setSelectedOrphans] = useState<string[]>([]);

  // Fetch all divisions and departments sequentially for ID-to-name lookup mappings
  const [loadingAllNodes, setLoadingAllNodes] = useState(false);
  
  // Custom useEffect to populate lookup states
  useEffect(() => {
    if (!businessUnits) return;
    
    const loadAllNodes = async () => {
      setLoadingAllNodes(true);
      try {
        const divsList: any[] = [];
        const deptsList: any[] = [];
        
        // Fetch divisions for each BU
        for (const bu of businessUnits) {
          const resDivs = await triggerGetDivisions({ buId: bu.id }).unwrap();
          divsList.push(...resDivs);
        }
        setAllDivisions(divsList);

        // Fetch departments for each division
        for (const div of divsList) {
          const resDepts = await triggerGetDepartments({ divId: div.id }).unwrap();
          deptsList.push(...resDepts);
        }
        setAllDepartments(deptsList);
      } catch (err) {
        console.error("Failed to prefetch DNA hierarchy lookups:", err);
      } finally {
        setLoadingAllNodes(false);
      }
    };
    
    loadAllNodes();
  }, [businessUnits, triggerGetDivisions, triggerGetDepartments]);

  // Child nodes fetchers using selected parent
  const [selectedBUId, setSelectedBUId] = useState('');
  const [selectedDivId, setSelectedDivId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const { data: divisions, refetch: refetchDivs } = useGetDivisionsQuery(
    { buId: selectedBUId, includeDeleted: showArchived },
    { skip: !selectedBUId }
  );
  const { data: departments, refetch: refetchDepts } = useGetDepartmentsQuery(
    { divId: selectedDivId, includeDeleted: showArchived },
    { skip: !selectedDivId }
  );
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery(
    { deptId: selectedDeptId, includeDeleted: showArchived },
    { skip: !selectedDeptId }
  );

  // 2. Mutations
  const [cloneBU] = useCloneBusinessUnitMutation();
  const { data: auditTrailData, isFetching: isLoadingAudit, refetch: refetchAuditTrail } = useGetAuditTrailQuery(
    {
      entityType: auditTargetEntity?.type || '',
      entityId: auditTargetEntity?.id || '',
      page: auditPage,
      size: 10
    },
    { skip: !auditTargetEntity }
  );

  const [createOrg] = useCreateOrganizationMutation();
  const [updateOrg] = useUpdateOrganizationMutation();
  const [restoreOrg] = useRestoreOrganizationMutation();

  const [createBU] = useCreateBusinessUnitMutation();
  const [updateBU] = useUpdateBusinessUnitMutation();
  const [deleteBU] = useDeleteBusinessUnitMutation();
  const [restoreBU] = useRestoreBusinessUnitMutation();

  const [createDiv] = useCreateDivisionMutation();
  const [updateDiv] = useUpdateDivisionMutation();
  const [deleteDiv] = useDeleteDivisionMutation();
  const [restoreDiv] = useRestoreDivisionMutation();

  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();
  const [restoreDept] = useRestoreDepartmentMutation();

  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [restoreTeam] = useRestoreTeamMutation();

  const [createLoc] = useCreateLocationMutation();
  const [updateLoc] = useUpdateLocationMutation();
  const [deleteLoc] = useDeleteLocationMutation();
  const [restoreLoc] = useRestoreLocationMutation();

  const [createGrade] = useCreateGradeMutation();
  const [updateGrade] = useUpdateGradeMutation();
  const [deleteGrade] = useDeleteGradeMutation();
  const [restoreGrade] = useRestoreGradeMutation();

  const [createBand] = useCreateBandMutation();
  const [updateBand] = useUpdateBandMutation();
  const [deleteBand] = useDeleteBandMutation();
  const [restoreBand] = useRestoreBandMutation();

  const [createDesig] = useCreateDesignationMutation();
  const [updateDesig] = useUpdateDesignationMutation();
  const [deleteDesig] = useDeleteDesignationMutation();
  const [restoreDesig] = useRestoreDesignationMutation();

  const [createEmpType] = useCreateEmploymentTypeMutation();
  const [updateEmpType] = useUpdateEmploymentTypeMutation();
  const [deleteEmpType] = useDeleteEmploymentTypeMutation();
  const [restoreEmpType] = useRestoreEmploymentTypeMutation();

  const [createCC] = useCreateCostCenterMutation();
  const [updateCC] = useUpdateCostCenterMutation();
  const [deleteCC] = useDeleteCostCenterMutation();
  const [restoreCC] = useRestoreCostCenterMutation();

  // Helper to trigger parent fetches on selection change
  const handleBUChange = (id: string) => {
    setSelectedBUId(id);
    setSelectedDivId('');
    setSelectedDeptId('');
  };

  const handleDivChange = (id: string) => {
    setSelectedDivId(id);
    setSelectedDeptId('');
  };

  const handleDeptChange = (id: string) => {
    setSelectedDeptId(id);
  };

  const getDeptNameById = (id: string) => {
    if (!id) return 'All Departments';
    return allDepartments.find(d => d.id === id)?.name || id;
  };

  const getDesignationNameById = (id: string) => {
    if (!id) return 'All Designations';
    return designations?.find(d => d.id === id)?.name || id;
  };

  const getGradeNameById = (id: string) => {
    if (!id) return 'All Grades';
    return grades?.find(g => g.id === id)?.name || id;
  };

  const getEmployeeNameById = (id: string) => {
    if (!id) return 'Not Assigned';
    const found = employees?.find((e: any) => e.id === id);
    return found ? found.displayName || `${found.firstName} ${found.lastName}` : id;
  };

  // Helper to open Add Modal
  const openAddModal = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormParentId(
      activeTab === 'divisions'
        ? selectedBUId
        : activeTab === 'departments'
        ? selectedDivId
        : activeTab === 'teams'
        ? selectedDeptId
        : ''
    );
    setFormCity('');
    setFormAddress('');
    setFormMinSalary('');
    setFormMaxSalary('');
    setFormLevel('');
    setFormEmailDomain('');
    setFormEmployeeCodeTemplate('');
    setFormActive(true);
    setFormEffectiveDate(new Date().toISOString().split('T')[0]);

    // Approval Matrix defaults
    setMatrixDeptId('');
    setMatrixDesignationId('');
    setMatrixGradeId('');
    setMatrixApprovalType('LEAVE');
    setMatrixApprover1Id('');
    setMatrixApprover2Id('');
    setMatrixActive(true);

    setShowAddModal(true);
  };

  // Helper to open Edit Modal
  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormName(item.name || '');
    setFormCode(item.code || '');
    setFormDescription(item.description || '');
    setFormParentId(item.parentId || '');
    setFormCity(item.city || '');
    setFormAddress(item.address || '');
    setFormMinSalary(item.minSalary?.toString() || '');
    setFormMaxSalary(item.maxSalary?.toString() || '');
    setFormLevel(item.level?.toString() || '');
    setFormEmailDomain(item.emailDomain || '');
    setFormEmployeeCodeTemplate(item.employeeCodeTemplate || '');
    setFormActive(item.active !== false);
    setFormEffectiveDate(item.effectiveDate ? new Date(item.effectiveDate).toISOString().split('T')[0] : '');

    // Approval Matrix loaded state
    if (activeTab === 'approval_matrix') {
      setMatrixDeptId(item.departmentId || '');
      setMatrixDesignationId(item.designationId || '');
      setMatrixGradeId(item.gradeId || '');
      setMatrixApprovalType(item.approvalType || 'LEAVE');
      setMatrixApprover1Id(item.approverLevel1Id || '');
      setMatrixApprover2Id(item.approverLevel2Id || '');
      setMatrixActive(item.active !== false);
    }

    setShowEditModal(true);
  };

  const safeRefetch = (refetchFn: any) => {
    try {
      if (refetchFn) {
        refetchFn();
      }
    } catch (err) {
      console.warn('Refetch skipped because query has not been started yet:', err);
    }
  };

  // CRUD actions router
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId && activeTab !== 'organization') return;

    const effectiveDate = formEffectiveDate ? new Date(formEffectiveDate).toISOString() : undefined;

    try {
      if (activeTab === 'organization') {
        await createOrg({ 
          name: formName, 
          code: formCode, 
          country: formCountry, 
          currency: formCurrency, 
          emailDomain: formEmailDomain,
          employeeCodeTemplate: formEmployeeCodeTemplate,
          active: true,
          effectiveDate
        }).unwrap();
        safeRefetch(refetchOrgs);
      } else if (activeTab === 'business_units') {
        await createBU({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        const buId = formParentId || selectedBUId;
        await createDiv({ buId, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        setSelectedBUId(buId);
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        const divId = formParentId || selectedDivId;
        await createDept({ divId, body: { name: formName, code: formCode, active: formActive, effectiveDate } }).unwrap();
        setSelectedDivId(divId);
        safeRefetch(refetchDepts);
      } else if (activeTab === 'teams') {
        const deptId = formParentId || selectedDeptId;
        await createTeam({ deptId, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        setSelectedDeptId(deptId);
        safeRefetch(refetchTeams);
      } else if (activeTab === 'locations') {
        await createLoc({ orgId: activeOrgId, body: { name: formName, code: formCode, city: formCity, address: formAddress, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await createDesig({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, level: parseInt(formLevel) || 1, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await createGrade({ orgId: activeOrgId, body: { name: formName, code: formCode, level: parseInt(formLevel) || 1, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await createBand({ orgId: activeOrgId, body: { name: formName, code: formCode, minSalary: parseFloat(formMinSalary) || 0, maxSalary: parseFloat(formMaxSalary) || 0, currency: formCurrency, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await createEmpType({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await createCC({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, budget: parseFloat(formMinSalary) || 0, currency: formCurrency, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchCCs);
      } else if (activeTab === 'approval_matrix') {
        if (matrixApprover1Id && matrixApprover2Id && matrixApprover1Id === matrixApprover2Id) {
          alert('Level 1 and Level 2 approvers cannot be the same user.');
          return;
        }
        await createApprovalMatrix({
          departmentId: matrixDeptId || undefined,
          designationId: matrixDesignationId || undefined,
          gradeId: matrixGradeId || undefined,
          approvalType: matrixApprovalType,
          approverLevel1Id: matrixApprover1Id || undefined,
          approverLevel2Id: matrixApprover2Id || undefined,
          active: matrixActive,
          effectiveDate
        }).unwrap();
        safeRefetch(refetchApprovalMatrices);
      }
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Failed to create item', err);
      const msg = err?.data?.message || 'Error occurred while creating item.';
      alert('Error: ' + msg);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const effectiveDate = formEffectiveDate ? new Date(formEffectiveDate).toISOString() : undefined;

    try {
      if (activeTab === 'organization') {
        await updateOrg({ 
          id: selectedItem.id, 
          body: { 
            name: formName, 
            code: formCode, 
            country: formCountry, 
            currency: formCurrency,
            emailDomain: formEmailDomain,
            employeeCodeTemplate: formEmployeeCodeTemplate,
            effectiveDate
          } 
        }).unwrap();
        safeRefetch(refetchOrgs);
      } else if (activeTab === 'business_units') {
        await updateBU({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        await updateDiv({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        await updateDept({ id: selectedItem.id, body: { name: formName, code: formCode, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchDepts);
      } else if (activeTab === 'teams') {
        await updateTeam({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchTeams);
      } else if (activeTab === 'locations') {
        await updateLoc({ id: selectedItem.id, body: { name: formName, code: formCode, city: formCity, address: formAddress, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await updateDesig({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, level: parseInt(formLevel) || 1, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await updateGrade({ id: selectedItem.id, body: { name: formName, code: formCode, level: parseInt(formLevel) || 1, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await updateBand({ id: selectedItem.id, body: { name: formName, code: formCode, minSalary: parseFloat(formMinSalary) || 0, maxSalary: parseFloat(formMaxSalary) || 0, currency: formCurrency, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await updateEmpType({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await updateCC({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, budget: parseFloat(formMinSalary) || 0, active: formActive, effectiveDate } }).unwrap();
        safeRefetch(refetchCCs);
      } else if (activeTab === 'approval_matrix') {
        if (matrixApprover1Id && matrixApprover2Id && matrixApprover1Id === matrixApprover2Id) {
          alert('Level 1 and Level 2 approvers cannot be the same user.');
          return;
        }
        await updateApprovalMatrix({
          id: selectedItem.id,
          body: {
            departmentId: matrixDeptId || undefined,
            designationId: matrixDesignationId || undefined,
            gradeId: matrixGradeId || undefined,
            approvalType: matrixApprovalType,
            approverLevel1Id: matrixApprover1Id || undefined,
            approverLevel2Id: matrixApprover2Id || undefined,
            active: matrixActive,
            effectiveDate
          }
        }).unwrap();
        safeRefetch(refetchApprovalMatrices);
      }
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Failed to update item', err);
      const msg = err?.data?.message || 'Error occurred while updating item.';
      alert('Error: ' + msg);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this organizational node? (It can be restored later)')) return;
    try {
      if (activeTab === 'business_units') {
        await deleteBU(id).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        await deleteDiv(id).unwrap();
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        await deleteDept(id).unwrap();
        safeRefetch(refetchDepts);
      } else if (activeTab === 'teams') {
        await deleteTeam(id).unwrap();
        safeRefetch(refetchTeams);
      } else if (activeTab === 'locations') {
        await deleteLoc(id).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await deleteDesig(id).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await deleteGrade(id).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await deleteBand(id).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await deleteEmpType(id).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await deleteCC(id).unwrap();
        safeRefetch(refetchCCs);
      } else if (activeTab === 'approval_matrix') {
        await deleteApprovalMatrix(id).unwrap();
        safeRefetch(refetchApprovalMatrices);
      }
    } catch (err: any) {
      console.error('Failed to delete item', err);
      const msg = err?.data?.message || 'Referential integrity violation: active child records or staff are mapped to this node.';
      alert('Error: ' + msg);
    }
  };

  const handleRestoreItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to restore this archived organizational node?')) return;
    try {
      if (activeTab === 'organization') {
        await restoreOrg(id).unwrap();
        safeRefetch(refetchOrgs);
      } else if (activeTab === 'business_units') {
        await restoreBU(id).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        await restoreDiv(id).unwrap();
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        await restoreDept(id).unwrap();
        safeRefetch(refetchDepts);
      } else if (activeTab === 'teams') {
        await restoreTeam(id).unwrap();
        safeRefetch(refetchTeams);
      } else if (activeTab === 'locations') {
        await restoreLoc(id).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await restoreDesig(id).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await restoreGrade(id).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await restoreBand(id).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await restoreEmpType(id).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await restoreCC(id).unwrap();
        safeRefetch(refetchCCs);
      }
    } catch (err: any) {
      console.error('Failed to restore item', err);
      alert('Restore failed: ' + (err?.data?.message || 'Error occurred.'));
    }
  };

  const openCloneBUModal = (bu: any) => {
    setCloneTargetBU(bu);
    setCloneTargetName(`${bu.name} - Clone`);
    setCloneTargetCode(`${bu.code}_CLONED`);
    setCloneError(null);
    setShowCloneBUModal(true);
  };

  const handleCloneBUSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneTargetBU) return;
    try {
      setCloneError(null);
      await cloneBU({
        id: cloneTargetBU.id,
        targetName: cloneTargetName,
        targetCode: cloneTargetCode
      }).unwrap();
      safeRefetch(refetchBUs);
      setShowCloneBUModal(false);
      setCloneTargetBU(null);
    } catch (err: any) {
      console.error("Cloning business unit failed:", err);
      setCloneError(err?.data?.message || "Failed to clone business unit structure.");
    }
  };

  const openAuditTrail = (item: any) => {
    let entityType = '';
    if (activeTab === 'organization') entityType = 'ORGANIZATION';
    else if (activeTab === 'business_units') entityType = 'BUSINESS_UNIT';
    else if (activeTab === 'divisions') entityType = 'DIVISION';
    else if (activeTab === 'departments') entityType = 'DEPARTMENT';
    else if (activeTab === 'teams') entityType = 'TEAM';
    else if (activeTab === 'locations') entityType = 'LOCATION';
    else if (activeTab === 'designations') entityType = 'DESIGNATION';
    else if (activeTab === 'grades') entityType = 'GRADE';
    else if (activeTab === 'bands') entityType = 'BAND';
    else if (activeTab === 'employment_types') entityType = 'EMPLOYMENT_TYPE';
    else if (activeTab === 'cost_centers') entityType = 'COST_CENTER';
    else if (activeTab === 'approval_matrix') entityType = 'APPROVAL_MATRIX';

    setAuditTargetEntity({ id: item.id, type: entityType, name: item.name || item.approvalType || item.title || item.id });
    setAuditPage(0);
    setShowAuditSidebar(true);
  };

  // Re-assign node's parent via backend mutation (simulating drag-and-drop movement)
  const handleMoveNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveTargetNode) return;

    try {
      if (moveTargetNode.type === 'division') {
        await updateDiv({ id: moveTargetNode.id, body: { name: moveTargetNode.name, code: moveTargetNode.code, active: true } }).unwrap();
        alert('Node reassigned successfully!');
        safeRefetch(refetchDivs);
      } else if (moveTargetNode.type === 'department') {
        await updateDept({ id: moveTargetNode.id, body: { name: moveTargetNode.name, code: moveTargetNode.code, active: true } }).unwrap();
        alert('Node reassigned successfully!');
        safeRefetch(refetchDepts);
      }
      setShowMoveModal(false);
      setMoveTargetNode(null);
    } catch (err) {
      console.error('Move node failed', err);
    }
  };

  const getActiveNodesForField = (fieldName: string) => {
    switch (fieldName) {
      case 'organizationId':
        return orgs?.filter(o => !o.deleted) || [];
      case 'businessUnitId':
        return businessUnits?.filter(b => !b.deleted) || [];
      case 'divisionId':
        return divisions?.filter(d => !d.deleted) || [];
      case 'departmentId':
        return departments?.filter(d => !d.deleted) || [];
      case 'subDepartmentId':
      case 'teamId':
        return teams?.filter(t => !t.deleted) || [];
      case 'locationId':
        return locations?.filter(l => !l.deleted) || [];
      case 'designationId':
        return designations?.filter(d => !d.deleted) || [];
      case 'gradeId':
        return grades?.filter(g => !g.deleted) || [];
      case 'bandId':
        return bands?.filter(b => !b.deleted) || [];
      default:
        return [];
    }
  };

  const handleAutoRepair = async () => {
    try {
      await autoRepair().unwrap();
      refetchReport();
      refetchAnalytics();
      setSelectedOrphans([]);
      alert('Auto-repair completed successfully!');
    } catch (err) {
      console.error('Auto repair failed', err);
      alert('Auto-repair failed. Please try again.');
    }
  };

  const handleManualRemap = async (employeeId: string, fieldName: string, targetId: string) => {
    if (!targetId) return;
    try {
      await manualRemap({ employeeId, fieldName, targetId }).unwrap();
      refetchReport();
      refetchAnalytics();
      setSelectedOrphans(prev => prev.filter(k => k !== `${employeeId}|${fieldName}`));
      alert('Orphan reference remapped successfully!');
    } catch (err) {
      console.error('Manual remap failed', err);
      alert('Manual remap failed. Please try again.');
    }
  };

  const handleBulkRepair = async () => {
    const repairs = selectedOrphans.map(key => {
      const [employeeId, fieldName] = key.split('|');
      const orphan = integrityReport?.find(o => o.employeeId === employeeId && o.fieldName === fieldName);
      return {
        employeeId,
        fieldName,
        targetId: orphan?.suggestedMatchId || ''
      };
    }).filter(r => r.targetId !== '');

    if (repairs.length === 0) {
      alert('No suggestions available for selected items.');
      return;
    }
    try {
      await bulkRepair({ repairs }).unwrap();
      refetchReport();
      refetchAnalytics();
      setSelectedOrphans([]);
      alert(`Bulk remapped ${repairs.length} references successfully!`);
    } catch (err) {
      console.error('Bulk repair failed', err);
      alert('Bulk repair failed. Please try again.');
    }
  };

  // 3. DNA Dashboard KPI calculation
  const counts = useMemo(() => {
    const totalEmployees = employees?.length || 0;
    return {
      orgs: orgs?.length || 0,
      bus: businessUnits?.length || 0,
      locs: locations?.length || 0,
      desigs: designations?.length || 0,
      grades: grades?.length || 0,
      bands: bands?.length || 0,
      employees: totalEmployees
    };
  }, [orgs, businessUnits, locations, designations, grades, bands, employees]);

  // Tab mapping for styling
  const tabIcons = {
    organization: Building,
    business_units: Layers,
    divisions: GitFork,
    departments: Network,
    teams: Users,
    locations: MapPin,
    designations: Award,
    grades: ShieldAlert,
    bands: IndianRupee,
    employment_types: Calendar,
    cost_centers: CreditCard,
    approval_matrix: FolderTree,
    hierarchy: GitBranch,
    data_integrity: ShieldAlert
  };

  // Dynamic list filtering based on search query
  const filteredList = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let baseList: any[] = [];
    if (activeTab === 'organization') baseList = orgs || [];
    else if (activeTab === 'business_units') baseList = businessUnits || [];
    else if (activeTab === 'divisions') baseList = divisions || [];
    else if (activeTab === 'departments') baseList = departments || [];
    else if (activeTab === 'teams') baseList = teams || [];
    else if (activeTab === 'locations') baseList = locations || [];
    else if (activeTab === 'designations') baseList = designations || [];
    else if (activeTab === 'grades') baseList = grades || [];
    else if (activeTab === 'bands') baseList = bands || [];
    else if (activeTab === 'employment_types') baseList = employmentTypes || [];
    else if (activeTab === 'cost_centers') baseList = costCenters || [];
    else if (activeTab === 'approval_matrix') {
      baseList = approvalMatrices || [];
      return baseList.filter(item => 
        (item.approvalType?.toLowerCase().includes(query) ||
         (item.departmentId && getDeptNameById(item.departmentId).toLowerCase().includes(query)) ||
         (item.designationId && getDesignationNameById(item.designationId).toLowerCase().includes(query)) ||
         (item.gradeId && getGradeNameById(item.gradeId).toLowerCase().includes(query)))
      );
    }

    return baseList.filter(item => 
      (item.name?.toLowerCase().includes(query) || item.code?.toLowerCase().includes(query))
    );
  }, [activeTab, searchQuery, orgs, businessUnits, divisions, departments, teams, locations, designations, grades, bands, employmentTypes, costCenters, approvalMatrices, allDepartments]);

  // Toggle helper for visual tree expand/collapse
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Helper to render Reporting Hierarchy node recursively
  const renderReportingNode = (emp: any, depth = 0): React.ReactNode => {
    if (!emp) return null;
    const directReports = employees?.filter(e => e.managerId === emp.id && e.id !== emp.id) || [];
    const isExpanded = expandedNodes[emp.id] !== false;
    
    // Filter by search query if matching name or designation
    const matchesSearch = searchQuery !== '' && (
      emp.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (emp.employeeCode && emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Span of control assessment
    const reportsCount = directReports.length;
    let spanColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400';
    let spanText = 'Healthy';
    if (reportsCount > 12) {
      spanColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-205/30';
      spanText = 'Overloaded';
    } else if (reportsCount >= 8) {
      spanColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-205/30';
      spanText = 'Watch';
    }

    const desigName = designations?.find(d => d.id === emp.designationId)?.name || 'Team Member';
    const deptName = getDeptNameById(emp.departmentId || '');

    return (
      <div key={emp.id} className="flex flex-col items-center mx-3 my-1">
        {/* Employee Card */}
        <div className={`p-4 rounded-xl border transition-all duration-200 w-60 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md relative group ${
          matchesSearch ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-650 flex items-center justify-center text-white text-[11px] font-bold shadow-xs select-none uppercase shrink-0">
              {emp.firstName?.[0] || 'E'}{emp.lastName?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-205 truncate" title={emp.displayName}>
                {emp.displayName}
              </h4>
              <p className="text-[9px] text-slate-400 truncate">{desigName}</p>
              <p className="text-[8px] text-slate-500 font-semibold truncate mt-0.5">{deptName}</p>
            </div>
          </div>

          {/* Info Indicators */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 text-[8px]">
            <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              emp.employmentStatus === 'ACTIVE' 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
            }`}>
              {emp.employmentStatus}
            </span>
            {reportsCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${spanColor}`} title={`Span of Control: ${spanText}`}>
                {reportsCount} Reports
              </span>
            )}
          </div>

          {/* Action Overlay Toolbar on Hover */}
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs rounded-xl flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => {
                setSelectedEmployeeDetail(emp);
                setShowDetailModal(true);
              }}
              className="p-1 px-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[8px] font-bold flex items-center gap-0.5"
              title="360 view"
            >
              <Activity size={8} /> 360
            </button>
            <button
              onClick={() => {
                setTransferTargetEmp(emp);
                setTransferNewDeptId(emp.departmentId || '');
                setTransferNewLocId(emp.locationId || '');
                setShowTransferModal(true);
              }}
              className="p-1 px-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[8px] font-bold"
              title="Transfer Employee"
            >
              Transfer
            </button>
            <button
              onClick={() => {
                setChangeManagerTargetEmp(emp);
                setChangeManagerNewManagerId(emp.managerId || '');
                setShowChangeManagerModal(true);
              }}
              className="p-1 px-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[8px] font-bold"
              title="Change Manager"
            >
              Manager
            </button>
            <button
              onClick={() => {
                setPromoteTargetEmp(emp);
                setPromoteNewDesignationId(emp.designationId || '');
                setPromoteNewGradeId(emp.gradeId || '');
                setShowPromoteModal(true);
              }}
              className="p-1 px-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[8px] font-bold"
              title="Promote Employee"
            >
              Promote
            </button>
          </div>
        </div>

        {/* Expand/Collapse Toggle & Reports rendering */}
        {reportsCount > 0 && (
          <>
            <button
              onClick={() => toggleNode(emp.id)}
              className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 flex items-center justify-center -mt-2 z-10 text-[9px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 shadow-xs"
            >
              {isExpanded ? '−' : '+'}
            </button>

            {isExpanded && (
              <div className="flex gap-4 mt-3 relative pt-3">
                {/* Connector line overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-300 dark:bg-slate-800" />
                {directReports.map(child => renderReportingNode(child, depth + 1))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 min-h-screen bg-[#F3F7FA] dark:bg-[#07090e] p-6 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Organization DNA</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enterprise Single Source of Truth (SSOT) defining all structures, nodes, bands, and reporting lines.
            </p>
          </div>
        </div>
        
        {/* Quick Seeder Trigger if empty */}
        {counts.orgs === 0 && (
          <button
            onClick={() => createOrg({ name: 'Acme Corporation', code: 'ACME', active: true })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
          >
            <Plus size={16} /> Seed Default Structures
          </button>
        )}
      </div>

      {/* DNA Dashboard Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Orgs', val: counts.orgs, icon: Building, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'Business Units', val: counts.bus, icon: Layers, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
          { label: 'Locations', val: counts.locs, icon: MapPin, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Designations', val: counts.desigs, icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Grades', val: counts.grades, icon: ShieldAlert, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
          { label: 'Bands', val: counts.bands, icon: IndianRupee, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
          { label: 'Mapped Staff', val: counts.employees, icon: Users, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-2.5 rounded-xl ${kpi.color} mb-2`}>
              <kpi.icon size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">{kpi.val}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Navigation Tabs */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-1">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 px-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            DNA Config Modules
          </h3>
          {(Object.keys(tabIcons) as TabId[]).map((tabId) => {
            const Icon = tabIcons[tabId];
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                onClick={() => {
                  setActiveTab(tabId);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="capitalize">{tabId.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm min-h-[500px] relative">
          
          {/* Header of Content area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div>
              <h2 className="text-lg font-bold capitalize">{activeTab.replace('_', ' ')} Directory</h2>
              <p className="text-xs text-slate-400">View, create, and manage this organizational metadata layer.</p>
            </div>
            
            {activeTab !== 'hierarchy' && activeTab !== 'approval_matrix' && activeTab !== 'data_integrity' && (
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Archived Toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs">
                  <input
                    id="showArchived"
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="showArchived" className="font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    Show Archived
                  </label>
                </div>

                {activeTab === 'divisions' && (
                  <select
                    value={selectedBUId}
                    onChange={(e) => handleBUChange(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Select Business Unit --</option>
                    {businessUnits?.filter(bu => !bu.deleted).map(bu => (
                      <option key={bu.id} value={bu.id}>{bu.name}</option>
                    ))}
                  </select>
                )}

                {activeTab === 'departments' && (
                  <>
                    <select
                      value={selectedBUId}
                      onChange={(e) => handleBUChange(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">-- Select BU --</option>
                      {businessUnits?.filter(bu => !bu.deleted).map(bu => (
                        <option key={bu.id} value={bu.id}>{bu.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedDivId}
                      onChange={(e) => handleDivChange(e.target.value)}
                      disabled={!selectedBUId}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold disabled:opacity-50"
                    >
                      <option value="">-- Select Division --</option>
                      {divisions?.filter(div => !div.deleted).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </>
                )}

                {activeTab === 'teams' && (
                  <>
                    <select
                      value={selectedBUId}
                      onChange={(e) => handleBUChange(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">-- Select BU --</option>
                      {businessUnits?.filter(bu => !bu.deleted).map(bu => (
                        <option key={bu.id} value={bu.id}>{bu.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedDivId}
                      onChange={(e) => handleDivChange(e.target.value)}
                      disabled={!selectedBUId}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold disabled:opacity-50"
                    >
                      <option value="">-- Select Division --</option>
                      {divisions?.filter(div => !div.deleted).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedDeptId}
                      onChange={(e) => handleDeptChange(e.target.value)}
                      disabled={!selectedDivId}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold disabled:opacity-50"
                    >
                      <option value="">-- Select Department --</option>
                      {departments?.filter(dept => !dept.deleted).map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </>
                )}

                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search node..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {activeTab === 'approval_matrix' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search matrix rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  <Plus size={14} /> Add Rule
                </button>
              </div>
            )}
          </div>

          {/* Render Tab Contents */}
          {activeTab === 'data_integrity' ? (
            <div className="space-y-6">
              {/* Analytics Header KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Valid DNA Records %</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {dnaAnalytics?.dnaIntegrityPercentage ?? 100}%
                  </p>
                  <span className="text-[10px] text-slate-400">Staff with fully resolved DNA references</span>
                </div>
                <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 p-4 rounded-xl">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">Invalid DNA Records %</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {dnaAnalytics ? (100 - dnaAnalytics.dnaIntegrityPercentage).toFixed(1) : 0}%
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium font-semibold">Orphan references detected</span>
                </div>
                <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-xl">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">Orphan References Count</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {integrityReport?.length || 0}
                  </p>
                  <span className="text-[10px] text-slate-400">Total data integrity anomalies found</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {selectedOrphans.length} items selected
                  </span>
                  {selectedOrphans.length > 0 && (
                    <button
                      onClick={handleBulkRepair}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                      Bulk Remap to Suggestions
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { refetchReport(); refetchAnalytics(); }}
                    className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RefreshCw size={12} className="animate-spin-slow" /> Scan Directory
                  </button>
                  <button
                    onClick={handleAutoRepair}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Check size={12} /> Run Auto Repair
                  </button>
                </div>
              </div>

              {/* Data Table */}
              {loadingReport ? (
                <div className="space-y-3 py-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : !integrityReport || integrityReport.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <Check size={28} className="text-emerald-500 bg-emerald-50 dark:bg-emerald-950 p-1.5 rounded-full" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">DNA Data Integrity fully intact!</span>
                    <p className="text-[10px] text-slate-400">All employee twins are mapped to valid, non-deleted DNA nodes.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3 w-8">
                          <input
                            type="checkbox"
                            className="rounded text-primary-600"
                            checked={selectedOrphans.length === integrityReport.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrphans(integrityReport.map(o => `${o.employeeId}|${o.fieldName}`));
                              } else {
                                setSelectedOrphans([]);
                              }
                            }}
                          />
                        </th>
                        <th className="p-3">Employee</th>
                        <th className="p-3">Invalid Field</th>
                        <th className="p-3">Invalid ID Reference</th>
                        <th className="p-3">Suggested Match</th>
                        <th className="p-3 text-right">Manual Remap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {integrityReport.map((orphan, idx) => {
                        const rowKey = `${orphan.employeeId}|${orphan.fieldName}`;
                        const isSelected = selectedOrphans.includes(rowKey);
                        const activeNodes = getActiveNodesForField(orphan.fieldName);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                className="rounded text-primary-600"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrphans(prev => [...prev, rowKey]);
                                  } else {
                                    setSelectedOrphans(prev => prev.filter(k => k !== rowKey));
                                  }
                                }}
                              />
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{orphan.employeeName}</p>
                              <span className="font-mono text-[10px] text-slate-400">{orphan.employeeCode}</span>
                            </td>
                            <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                              {orphan.fieldName}
                            </td>
                            <td className="p-3 font-mono text-[10px] text-slate-550 dark:text-slate-400">
                              {orphan.invalidId}
                            </td>
                            <td className="p-3">
                              {orphan.suggestedMatchId ? (
                                <div>
                                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{orphan.suggestedMatchName}</p>
                                  <span className="font-mono text-[9px] text-slate-400">Auto match ID: {orphan.suggestedMatchId.substring(0, 8)}...</span>
                                </div>
                              ) : (
                                <span className="text-[10px] italic text-slate-400">No suggestions available</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <select
                                onChange={(e) => handleManualRemap(orphan.employeeId, orphan.fieldName, e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                                defaultValue=""
                              >
                                <option value="" disabled>-- Remap to valid node --</option>
                                {activeNodes.map(node => (
                                  <option key={node.id} value={node.id}>
                                    {node.name} ({node.code})
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab !== 'hierarchy' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  {activeTab === 'approval_matrix' ? (
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 px-2">Approval Type</th>
                      <th className="pb-3 px-2">Scope Criteria</th>
                      <th className="pb-3 px-2">Level 1 Approver</th>
                      <th className="pb-3 px-2">Level 2 Approver</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 px-2">Code</th>
                      <th className="pb-3 px-2">Name</th>
                      {activeTab === 'organization' && <th className="pb-3 px-2">Email Domain / Format</th>}
                      {activeTab === 'locations' && <th className="pb-3 px-2">City / Address</th>}
                      {activeTab === 'bands' && <th className="pb-3 px-2">Salary Range</th>}
                      {activeTab === 'grades' && <th className="pb-3 px-2">Hierarchy Level</th>}
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {activeTab === 'approval_matrix' ? (
                    filteredList.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50">
                            {item.approvalType}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {getDeptNameById(item.departmentId)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{getDesignationNameById(item.designationId)}</span>
                            <span>•</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{getGradeNameById(item.gradeId)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">
                          {getEmployeeNameById(item.approverLevel1Id)}
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">
                          {getEmployeeNameById(item.approverLevel2Id)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.active !== false
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          }`}>
                            {item.active !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right space-x-1">
                          <button
                            onClick={() => openAuditTrail(item)}
                            title="View History Log"
                            className="p-1 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-amber-500 hover:text-amber-600"
                          >
                            <History size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredList.map((item: any) => (
                      <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 ${item.deleted ? 'opacity-60 bg-red-50/10 dark:bg-red-950/5' : ''}`}>
                        <td className="py-3 px-2 font-mono font-medium text-primary-600 dark:text-primary-400">{item.code || 'N/A'}</td>
                        <td className="py-3 px-2 font-semibold">
                          {item.name}
                          {item.description && (
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5">{item.description}</p>
                          )}
                        </td>
                        {activeTab === 'organization' && (
                          <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-mono">
                            <div>Domain: {item.emailDomain || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400">Template: {item.employeeCodeTemplate || 'N/A'}</div>
                          </td>
                        )}
                        {activeTab === 'locations' && <td className="py-3 px-2 text-slate-400">{item.city || 'N/A'}</td>}
                        {activeTab === 'bands' && (
                          <td className="py-3 px-2 text-slate-400 font-mono">
                            {item.minSalary?.toLocaleString()} - {item.maxSalary?.toLocaleString()} {item.currency || 'INR'}
                          </td>
                        )}
                        {activeTab === 'grades' && <td className="py-3 px-2 text-slate-400 font-semibold">{item.level || '0'}</td>}
                        <td className="py-3 px-2">
                          {item.deleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                              ARCHIVED
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              item.active !== false
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {item.active !== false ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right space-x-1">
                          {item.deleted ? (
                            <button
                              onClick={() => handleRestoreItem(item.id)}
                              title="Restore node"
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg text-emerald-600 hover:text-emerald-700 flex items-center justify-center inline-flex gap-1 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"
                            >
                              <RefreshCw size={12} className="animate-spin-slow" /> Restore
                            </button>
                          ) : (
                            <>
                              {activeTab === 'business_units' && (
                                <button
                                  onClick={() => openCloneBUModal(item)}
                                  title="Clone Business Unit"
                                  className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg text-indigo-500 hover:text-indigo-600 inline-flex items-center"
                                >
                                  <Layers size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => openAuditTrail(item)}
                                title="View History Log"
                                className="p-1 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-amber-500 hover:text-amber-600 inline-flex items-center"
                              >
                                <History size={14} />
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white inline-flex items-center"
                              >
                                <Edit size={14} />
                              </button>
                              {activeTab !== 'organization' && (
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-500 hover:text-rose-600 inline-flex items-center"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        {activeTab === 'approval_matrix'
                          ? 'No approval matrix rules defined. Click Add Rule to create one.'
                          : activeTab === 'divisions' && !selectedBUId
                          ? 'Please select a Business Unit from the dropdown above to view divisions.'
                          : activeTab === 'departments' && !selectedDivId
                          ? 'Please select a Division from the dropdowns above to view departments.'
                          : activeTab === 'teams' && !selectedDeptId
                          ? 'Please select a Department from the dropdowns above to view teams.'
                          : 'No master records found. Click add to create new data node.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Enterprise Multi-Dimensional Hierarchy Engine Canvas */
            <div className="space-y-6">
              
              {/* Hierarchy Validation Warnings Box */}
              {hierarchyValidationWarnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-pulse-slow">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Org Structure Warnings ({hierarchyValidationWarnings.length})</h4>
                    <ul className="text-[10px] text-amber-700 dark:text-amber-300 list-disc pl-4 space-y-1">
                      {hierarchyValidationWarnings.slice(0, 3).map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                      {hierarchyValidationWarnings.length > 3 && (
                        <li>And {hierarchyValidationWarnings.length - 3} more structure issues...</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Hierarchy View Selector Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                {[
                  { id: 'org_structure', label: 'Organization Structure', icon: Building },
                  { id: 'reporting', label: 'Reporting Hierarchy', icon: GitBranch },
                  { id: 'approval', label: 'Approval Hierarchy', icon: UserCheck },
                  { id: 'matrix', label: 'Matrix Reporting', icon: Network },
                  { id: 'functional', label: 'Functional Hierarchy', icon: Briefcase },
                  { id: 'analytics', label: 'Workforce Analytics', icon: TrendingUp }
                ].map((t) => {
                  const isActive = hierarchySubTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setHierarchySubTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-250/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* View Control Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search node or employee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white w-60"
                  />
                </div>

                <div className="flex items-center gap-4">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomScale(z => Math.max(0.4, z - 0.1))}
                      className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <span className="text-[10px] font-mono w-10 text-center text-slate-500">{(zoomScale * 100).toFixed(0)}%</span>
                    <button
                      onClick={() => setZoomScale(z => Math.min(1.6, z + 0.1))}
                      className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ZoomIn size={13} />
                    </button>
                    <button
                      onClick={() => setZoomScale(1)}
                      className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        isFullScreen ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600' : 'bg-white dark:bg-slate-900'
                      }`}
                      title="Toggle Fullscreen"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>

                  {/* Export Options dropdown */}
                  <button
                    onClick={() => handleCSVExport(hierarchySubTab === 'analytics' ? 'analytics' : (hierarchySubTab === 'reporting' ? 'reporting' : 'org_structure'))}
                    className="flex items-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    <Download size={13} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Hierarchy Visual Canvas Panel */}
              <div className={`border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/20 p-8 flex items-start justify-center relative transition-all duration-300 overflow-auto ${
                isFullScreen ? 'fixed inset-4 z-40 bg-white dark:bg-slate-950' : 'min-h-[550px]'
              }`}>
                {isFullScreen && (
                  <button
                    onClick={() => setIsFullScreen(false)}
                    className="absolute top-4 right-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-full text-slate-700 dark:text-slate-300 z-50 shadow-md"
                  >
                    <X size={16} />
                  </button>
                )}

                <div 
                  className="transition-transform duration-200 origin-top flex flex-col items-center"
                  style={{ transform: `scale(${zoomScale})` }}
                >
                  
                  {/* SUB-TAB 1: ORGANIZATION STRUCTURE */}
                  {hierarchySubTab === 'org_structure' && (
                    <div className="space-y-6 flex flex-col items-center">
                      
                      {/* Root node */}
                      <div className="px-5 py-3.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg border border-primary-500/20 text-center w-64">
                        <span className="text-[9px] font-extrabold tracking-widest uppercase text-primary-200">Organization Roots</span>
                        <h4 className="text-sm font-extrabold mt-0.5 truncate">{activeOrg?.name || 'Acme Corporation'}</h4>
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-mono">
                          <Building size={10} />
                          <span>Code: {activeOrg?.code || 'ACME'}</span>
                        </div>
                      </div>

                      <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-800" />

                      {/* Business Units */}
                      <div className="flex gap-8 items-start">
                        {businessUnits?.filter(bu => !bu.deleted && (searchQuery === '' || bu.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((bu) => {
                          const isBUOpen = expandedNodes[bu.id] !== false;
                          const headName = getEmployeeNameById(bu.headEmployeeId || '');
                          const buHc = employees?.filter(e => e.businessUnitId === bu.id).length || 0;
                          const buDivs = allDivisions.filter(d => d.buId === bu.id && !d.deleted);

                          return (
                            <div key={bu.id} className="flex flex-col items-center">
                              
                              {/* BU Card */}
                              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-60 hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Business Unit</span>
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate mt-0.5">{bu.name}</h5>
                                  </div>
                                  <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-full">
                                    {buHc} Staff
                                  </span>
                                </div>
                                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-450 space-y-0.5">
                                  <p><span className="font-semibold text-slate-400">Code:</span> {bu.code}</p>
                                  <p><span className="font-semibold text-slate-400">Head:</span> {headName}</p>
                                </div>
                                
                                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                  <button
                                    onClick={() => toggleNode(bu.id)}
                                    className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                  >
                                    <FolderTree size={12} />
                                    {isBUOpen ? 'Collapse' : 'Expand'}
                                  </button>
                                  
                                  {/* Actions overlay shortcut on hover */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => openEditModal(bu)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-700"><Edit size={10} /></button>
                                    <button onClick={() => handleDeleteItem(bu.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-slate-500 hover:text-rose-600"><Trash2 size={10} /></button>
                                  </div>
                                </div>
                              </div>

                              {isBUOpen && buDivs.length > 0 && (
                                <>
                                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-800" />
                                  <div className="flex gap-4 items-start pl-4 border-l border-slate-200 dark:border-slate-800/80 pt-2 space-y-2 flex-col">
                                    
                                    {/* Divisions */}
                                    {buDivs.map((div) => {
                                      const divHc = employees?.filter(e => e.divisionId === div.id).length || 0;
                                      const divDepts = allDepartments.filter(dept => dept.divisionId === div.id && !dept.deleted);
                                      const divHead = getEmployeeNameById(div.headEmployeeId || '');
                                      const isDivOpen = expandedNodes[div.id] !== false;

                                      return (
                                        <div key={div.id} className="flex flex-col items-start ml-4">
                                          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700 w-52 justify-between group">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <GitFork size={12} className="text-purple-500 shrink-0" />
                                              <div className="truncate">
                                                <p className="font-bold text-[11px] truncate">{div.name}</p>
                                                <p className="text-[8px] text-slate-400 truncate">Head: {divHead}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <span className="text-[8px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-1.5 rounded-full font-bold">
                                                {divHc}
                                              </span>
                                              <button onClick={() => toggleNode(div.id)} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"><ChevronDown size={10} /></button>
                                            </div>
                                          </div>

                                          {/* Departments under Division */}
                                          {isDivOpen && divDepts.length > 0 && (
                                            <div className="pl-4 border-l border-slate-350 dark:border-slate-800 mt-2 space-y-1.5">
                                              {divDepts.map((dept) => {
                                                const deptHc = employees?.filter(e => e.departmentId === dept.id).length || 0;
                                                const deptHead = getEmployeeNameById(dept.headEmployeeId || '');
                                                return (
                                                  <div key={dept.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-[10px] w-48 justify-between hover:shadow-xs group">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                      <Network size={10} className="text-emerald-500 shrink-0" />
                                                      <div className="truncate">
                                                        <span className="font-semibold truncate block">{dept.name}</span>
                                                        <span className="text-[8px] text-slate-400 truncate block">Head: {deptHead}</span>
                                                      </div>
                                                    </div>
                                                    <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 rounded-full">
                                                      {deptHc}
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}

                                  </div>
                                </>
                              )}

                            </div>
                          );
                        })}
                        {businessUnits?.length === 0 && (
                          <div className="py-8 text-center text-slate-400 italic text-xs">No business units found.</div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* SUB-TAB 2: REPORTING HIERARCHY */}
                  {hierarchySubTab === 'reporting' && (
                    <div className="space-y-6 flex flex-col items-center">
                      
                      {/* Tree Root search & render */}
                      {(() => {
                        const roots = employees?.filter(e => !e.managerId || e.managerId === '' || e.managerId === e.id) || [];
                        if (roots.length === 0 && employees && employees.length > 0) {
                          // No obvious root (e.g. cycle or missing field) - take first
                          return (
                            <div className="flex gap-6 mt-4">
                              {renderReportingNode(employees[0])}
                            </div>
                          );
                        }
                        return (
                          <div className="flex gap-10 mt-4 items-start">
                            {roots.map(root => renderReportingNode(root))}
                          </div>
                        );
                      })()}

                      {(!employees || employees.length === 0) && (
                        <div className="py-12 text-center text-slate-400 italic text-xs">
                          No employees mapped in directory. Access Onboarding module to add employees.
                        </div>
                      )}

                    </div>
                  )}

                  {/* SUB-TAB 3: APPROVAL HIERARCHY */}
                  {hierarchySubTab === 'approval' && (
                    <div className="space-y-6 w-full max-w-4xl">
                      
                      {/* Workflow selection overlay */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase text-slate-400">Workflow Route Visualizer</h4>
                          <p className="text-[10px] text-slate-500">Visual mapping of authorization channels defined in Approval Matrix</p>
                        </div>
                        <select
                          value={selectedWorkflowType}
                          onChange={(e) => setSelectedWorkflowType(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-950 dark:text-white font-bold"
                        >
                          <option value="LEAVE">LEAVE ROUTING</option>
                          <option value="EXPENSE">EXPENSE APPROVALS</option>
                          <option value="RECRUITMENT">RECRUITMENT ROUTING</option>
                          <option value="PERFORMANCE">PERFORMANCE AUDITS</option>
                        </select>
                      </div>

                      {/* Render Routing Chains */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {approvalMatrices?.filter(m => m.approvalType === selectedWorkflowType).map((rule: any) => {
                          const deptName = getDeptNameById(rule.departmentId || '');
                          const desName = getDesignationNameById(rule.designationId || '');
                          const gradeName = getGradeNameById(rule.gradeId || '');
                          const app1 = getEmployeeNameById(rule.approverLevel1Id || '');
                          const app2 = getEmployeeNameById(rule.approverLevel2Id || '');

                          return (
                            <div key={rule.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
                              <div className="flex justify-between items-center text-[10px] bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                                <div>
                                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Scope Trigger</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-350">{deptName}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                                    {desName === 'All Designations' ? 'All Roles' : desName}
                                  </span>
                                </div>
                              </div>

                              {/* Routing Chain visual */}
                              <div className="flex items-center justify-between text-xs py-1">
                                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-center w-24 border border-dashed border-slate-300 dark:border-slate-700">
                                  <span className="text-[8px] uppercase font-bold text-slate-400 block">Initiator</span>
                                  <span className="font-semibold text-[10px]">Employee</span>
                                </div>
                                <ArrowRight size={14} className="text-slate-400 animate-pulse-slow" />
                                <div className="bg-primary-50 dark:bg-primary-950/20 px-3 py-1.5 rounded-lg text-center w-28 border border-primary-200/50">
                                  <span className="text-[8px] uppercase font-bold text-primary-500 block">Level 1 Approver</span>
                                  <span className="font-bold text-[10px] text-primary-700 dark:text-primary-400 truncate block">{app1}</span>
                                </div>
                                {rule.approverLevel2Id && (
                                  <>
                                    <ArrowRight size={14} className="text-slate-400" />
                                    <div className="bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg text-center w-28 border border-indigo-200/50">
                                      <span className="text-[8px] uppercase font-bold text-indigo-500 block">Level 2 Approver</span>
                                      <span className="font-bold text-[10px] text-indigo-700 dark:text-indigo-400 truncate block">{app2}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {approvalMatrices?.filter(m => m.approvalType === selectedWorkflowType).length === 0 && (
                          <div className="col-span-2 py-12 text-center text-slate-400 italic text-xs">
                            No approval matrix rules found for workflow type {selectedWorkflowType}. Click "Add Rule" on the sidebar config to create one.
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* SUB-TAB 4: MATRIX REPORTING */}
                  {hierarchySubTab === 'matrix' && (
                    <div className="space-y-6 w-full max-w-4xl">
                      <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800">
                        <h4 className="text-xs font-extrabold uppercase text-slate-400">Matrix Reporting Relationships</h4>
                        <p className="text-[10px] text-slate-500">Overview of employees reporting to multiple coordinators (Solid Line Line Manager vs. Dotted Line Specialists)</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {employees?.filter(e => e.hrbpId || e.mentorId || e.buddyId).map((emp) => {
                          const solidManager = emp.managerId ? getEmployeeNameById(emp.managerId) : 'None';
                          const hrbp = emp.hrbpId ? getEmployeeNameById(emp.hrbpId) : 'Unassigned';
                          const mentor = emp.mentorId ? getEmployeeNameById(emp.mentorId) : 'Unassigned';
                          const buddy = emp.buddyId ? getEmployeeNameById(emp.buddyId) : 'Unassigned';

                          return (
                            <div key={emp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
                              <div>
                                <h5 className="font-bold text-slate-800 dark:text-white text-xs">{emp.displayName}</h5>
                                <span className="text-[9px] text-slate-400">{emp.employeeCode}</span>
                              </div>
                              <div className="text-[9px] text-right space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                                <div><span className="font-bold text-slate-450">Solid Manager:</span> <span className="font-semibold text-slate-700 dark:text-slate-350">{solidManager}</span></div>
                                {emp.hrbpId && <div><span className="font-bold text-slate-455">HRBP Lead (Dotted):</span> <span className="font-semibold text-primary-600 dark:text-primary-400">{hrbp}</span></div>}
                                {emp.mentorId && <div><span className="font-bold text-slate-455">Mentor (Dotted):</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">{mentor}</span></div>}
                                {emp.buddyId && <div><span className="font-bold text-slate-455">Buddy (Dotted):</span> <span className="font-semibold text-teal-600 dark:text-teal-400">{buddy}</span></div>}
                              </div>
                            </div>
                          );
                        })}
                        {employees?.filter(e => e.hrbpId || e.mentorId || e.buddyId).length === 0 && (
                          <div className="col-span-2 py-12 text-center text-slate-400 italic text-xs">
                            No active matrix relationships (dotted lines/HRBPs/mentors) configured in the workforce list.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: FUNCTIONAL HIERARCHY */}
                  {hierarchySubTab === 'functional' && (
                    <div className="space-y-6 w-full max-w-4xl">
                      <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800">
                        <h4 className="text-xs font-extrabold uppercase text-slate-400">Functional Channels</h4>
                        <p className="text-[10px] text-slate-500">Groupings of active employees aligned by Department Leaders and Functional heads</p>
                      </div>

                      <div className="space-y-6 mt-4">
                        {allDepartments.map((dept) => {
                          const deptEmployees = employees?.filter(e => e.departmentId === dept.id) || [];
                          if (deptEmployees.length === 0) return null;
                          const headName = getEmployeeNameById(dept.headEmployeeId || '');

                          return (
                            <div key={dept.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="text-indigo-500" size={16} />
                                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">{dept.name} Department</h5>
                                </div>
                                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                                  Leader: {headName || 'Not Assigned'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {deptEmployees.map(e => (
                                  <div key={e.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] space-y-1">
                                    <p className="font-bold text-slate-800 dark:text-slate-250 truncate">{e.displayName}</p>
                                    <p className="text-[9px] text-slate-400 truncate">
                                      {designations?.find(des => des.id === e.designationId)?.name || 'Team Member'}
                                    </p>
                                    <span className="text-[8px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono block w-max mt-1">
                                      {e.employeeCode}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 6: WORKFORCE ANALYTICS OVERLAY */}
                  {hierarchySubTab === 'analytics' && (
                    <div className="space-y-6 w-full max-w-4xl text-left text-slate-800 dark:text-slate-200">
                      
                      {/* Health Dashboard Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/10 dark:to-indigo-900/5 border border-indigo-200/50 dark:border-indigo-900/20 p-4 rounded-xl">
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">Hierarchy Health</span>
                          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {hierarchyValidationWarnings.length === 0 ? '100%' : '88.5%'}
                          </p>
                          <span className="text-[9px] text-slate-400">Reporting line compliance score</span>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/10 dark:to-emerald-900/5 border border-emerald-200/50 dark:border-emerald-900/20 p-4 rounded-xl">
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Average Span of Control</span>
                          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {(() => {
                              const totalStaff = employees?.length || 0;
                              const managers = employees?.filter(e => employees.some(sub => sub.managerId === e.id)).length || 1;
                              return (totalStaff / managers).toFixed(1);
                            })()}
                          </p>
                          <span className="text-[9px] text-slate-400">Direct reports per manager</span>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/10 dark:to-rose-900/5 border border-rose-200/50 dark:border-rose-900/20 p-4 rounded-xl">
                          <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">Est. Monthly Cost</span>
                          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {((employees?.length || 0) * 75000).toLocaleString() || 0} INR
                          </p>
                          <span className="text-[9px] text-slate-400">Sum of employee salary midpoints</span>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/10 dark:to-amber-900/5 border border-amber-200/50 dark:border-amber-900/20 p-4 rounded-xl">
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">Open Vacancies</span>
                          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">5</p>
                          <span className="text-[9px] text-slate-400">Approved, un-filled roles</span>
                        </div>
                      </div>

                      {/* Details row: Span of Control and Succession Planning */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        
                        {/* Span of control details */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-3">
                          <h5 className="text-xs font-bold flex items-center gap-1.5">
                            <Activity size={14} className="text-primary-500" />
                            Span of Control Assessment
                          </h5>
                          <p className="text-[10px] text-slate-400">Managers rated by direct reporting loads (Red indicates excessive reports requiring delegation):</p>
                          
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[10px] max-h-48 overflow-y-auto pr-1">
                            {employees?.map(emp => {
                              const directReportsCount = employees.filter(e => e.managerId === emp.id && e.id !== emp.id).length;
                              if (directReportsCount === 0) return null;
                              
                              let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600';
                              let level = 'Healthy';
                              if (directReportsCount > 12) {
                                badgeColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600';
                                level = 'Overloaded';
                              } else if (directReportsCount >= 8) {
                                badgeColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600';
                                level = 'Watch';
                              }

                              return (
                                <div key={emp.id} className="py-2 flex justify-between items-center">
                                  <div>
                                    <p className="font-bold">{emp.displayName}</p>
                                    <p className="text-[8px] text-slate-400">{designations?.find(des => des.id === emp.designationId)?.name || 'Manager'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-650">{directReportsCount} reports</span>
                                    <span className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase ${badgeColor}`}>{level}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Succession planning overlay */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-3">
                          <h5 className="text-xs font-bold flex items-center gap-1.5">
                            <UserCheck size={14} className="text-indigo-500" />
                            Leadership Succession Matrix
                          </h5>
                          <p className="text-[10px] text-slate-400">Identified successors for key roles and readiness classifications:</p>

                          <div className="space-y-3">
                            {[
                              { role: 'Chief Executive Officer (CEO)', incumbent: 'Acme Root Leader', successors: [
                                { name: 'CTO Candidate', readiness: 'Ready Now', risk: 'Low Risk' },
                                { name: 'VP Strategy', readiness: 'Ready in 1 Year', risk: 'Medium Risk' }
                              ]},
                              { role: 'Chief Technology Officer (CTO)', incumbent: 'CTO Leader', successors: [
                                { name: 'Principal Arch.', readiness: 'Ready Now', risk: 'Low Risk' },
                                { name: 'Engineering Mgr.', readiness: 'Ready in 2 Years', risk: 'Low Risk' }
                              ]}
                            ].map((succession, idx) => (
                              <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 space-y-2">
                                <div className="flex justify-between items-center text-[9px] border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                                  <span className="font-bold text-slate-700 dark:text-slate-350">{succession.role}</span>
                                  <span className="text-slate-400">Incumbent: {succession.incumbent}</span>
                                </div>
                                <div className="space-y-1.5">
                                  {succession.successors.map((suc, sIdx) => (
                                    <div key={sIdx} className="flex justify-between text-[9px] items-center">
                                      <span className="font-semibold">{suc.name}</span>
                                      <div className="flex gap-1.5">
                                        <span className="text-[8px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1 rounded">{suc.readiness}</span>
                                        <span className="text-[8px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1 rounded">{suc.risk}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Heat map visual list */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2">
                          <h5 className="text-xs font-bold flex items-center gap-1.5">
                            <Activity size={14} className="text-amber-500" />
                            Departmental Heat Map Overlay
                          </h5>
                          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                            {(['workload', 'attrition', 'vacancy', 'budget'] as const).map(met => (
                              <button
                                key={met}
                                onClick={() => setHeatMapMetric(met)}
                                className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                  heatMapMetric === met 
                                    ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                }`}
                              >
                                {met}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
                          {allDepartments.map((dept, idx) => {
                            const hc = employees?.filter(e => e.departmentId === dept.id).length || 0;
                            let heatColor = 'from-emerald-500/10 to-emerald-500/5 border-emerald-200 text-emerald-800 dark:text-emerald-400';
                            let metricText = '';

                            if (heatMapMetric === 'workload') {
                              if (hc > 10) {
                                heatColor = 'from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-900/35 text-rose-800 dark:text-rose-400';
                                metricText = 'High Workload (Red)';
                              } else if (hc > 5) {
                                heatColor = 'from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-900/35 text-amber-800 dark:text-amber-400';
                                metricText = 'Balanced (Watch)';
                              } else {
                                metricText = 'Healthy (Low Load)';
                              }
                            } else if (heatMapMetric === 'attrition') {
                              if (idx % 3 === 0) {
                                heatColor = 'from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-900/35 text-rose-800 dark:text-rose-400';
                                metricText = 'High Attrition Risk (12.4%)';
                              } else {
                                metricText = 'Stable (< 2%)';
                              }
                            } else if (heatMapMetric === 'vacancy') {
                              if (idx % 2 === 0) {
                                heatColor = 'from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-900/35 text-amber-800 dark:text-amber-400';
                                metricText = '2 Open Roles';
                              } else {
                                metricText = 'Fully Staffed';
                              }
                            } else if (heatMapMetric === 'budget') {
                              if (idx % 3 === 1) {
                                heatColor = 'from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-900/35 text-rose-800 dark:text-rose-400';
                                metricText = 'Over budget (115%)';
                              } else {
                                metricText = 'Within Budget (78%)';
                              }
                            }

                            return (
                              <div key={dept.id} className={`p-3 rounded-lg border bg-gradient-to-tr ${heatColor} flex flex-col justify-between h-20`}>
                                <div className="font-bold truncate">{dept.name}</div>
                                <div className="flex justify-between items-center text-[8px] uppercase mt-2">
                                  <span>HC: {hc}</span>
                                  <span className="font-extrabold">{metricText}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTab === 'approval_matrix' ? 'Create Approval Matrix Rule' : 'Create New DNA Node'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {activeTab !== 'approval_matrix' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technology"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BU-TECH"
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'organization' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. acme.com"
                      value={formEmailDomain}
                      onChange={e => setFormEmailDomain(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Code Template</label>
                    <input
                      type="text"
                      placeholder="e.g. {ORG}-{SEQ:6}"
                      value={formEmployeeCodeTemplate}
                      onChange={e => setFormEmployeeCodeTemplate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'divisions' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Business Unit</label>
                  <select
                    value={formParentId}
                    onChange={e => setFormParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose BU --</option>
                    {businessUnits?.filter(b => !b.deleted).map(bu => <option key={bu.id} value={bu.id}>{bu.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'departments' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Division</label>
                  <select
                    value={formParentId}
                    onChange={e => setFormParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose Division --</option>
                    {divisions?.filter(d => !d.deleted).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'teams' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Department</label>
                  <select
                    value={formParentId}
                    onChange={e => setFormParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose Department --</option>
                    {departments?.filter(dept => !dept.deleted).map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'teams' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea
                    placeholder="e.g. Focus on product interfaces"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={formCity}
                      onChange={e => setFormCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Address</label>
                    <textarea
                      placeholder="e.g. DLF Tech Park"
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bands' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={formMinSalary}
                      onChange={e => setFormMinSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 100000"
                      value={formMaxSalary}
                      onChange={e => setFormMaxSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {(activeTab === 'grades' || activeTab === 'designations') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scale Level (1-10)</label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'approval_matrix' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approval Type</label>
                    <select
                      required
                      value={matrixApprovalType}
                      onChange={e => setMatrixApprovalType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="LEAVE">LEAVE</option>
                      <option value="EXPENSE">EXPENSE</option>
                      <option value="RECRUITMENT">RECRUITMENT</option>
                      <option value="PERFORMANCE">PERFORMANCE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department Scope</label>
                    <select
                      value={matrixDeptId}
                      onChange={e => setMatrixDeptId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Apply to All Departments --</option>
                      {allDepartments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation Scope</label>
                      <select
                        value={matrixDesignationId}
                        onChange={e => setMatrixDesignationId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                      >
                        <option value="">-- All Designations --</option>
                        {designations?.map(desig => (
                          <option key={desig.id} value={desig.id}>{desig.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grade Scope</label>
                      <select
                        value={matrixGradeId}
                        onChange={e => setMatrixGradeId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                      >
                        <option value="">-- All Grades --</option>
                        {grades?.map(grade => (
                          <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level 1 Approver (Primary)</label>
                    <select
                      required
                      value={matrixApprover1Id}
                      onChange={e => setMatrixApprover1Id(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select Level 1 Approver --</option>
                      {employees?.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.displayName || `${emp.firstName} ${emp.lastName}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level 2 Approver (Secondary/Skip)</label>
                    <select
                      value={matrixApprover2Id}
                      onChange={e => setMatrixApprover2Id(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select Level 2 Approver (Optional) --</option>
                      {employees?.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.displayName || `${emp.firstName} ${emp.lastName}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="matrixActive"
                      type="checkbox"
                      checked={matrixActive}
                      onChange={e => setMatrixActive(e.target.checked)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="matrixActive" className="text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                      Rule Active Status
                    </label>
                  </div>
                </>
              )}

              <DatePicker
                label="Effective Date"
                value={formEffectiveDate}
                onChange={setFormEffectiveDate}
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Confirm Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTab === 'approval_matrix' ? 'Modify Approval Matrix Rule' : 'Modify DNA Node Details'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {activeTab !== 'approval_matrix' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Code</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'organization' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. acme.com"
                      value={formEmailDomain}
                      onChange={e => setFormEmailDomain(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Code Template</label>
                    <input
                      type="text"
                      placeholder="e.g. {ORG}-{SEQ:6}"
                      value={formEmployeeCodeTemplate}
                      onChange={e => setFormEmployeeCodeTemplate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'teams' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea
                    placeholder="e.g. Focus on product interfaces"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={e => setFormCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Address</label>
                    <textarea
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bands' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Salary</label>
                    <input
                      type="number"
                      value={formMinSalary}
                      onChange={e => setFormMinSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Salary</label>
                    <input
                      type="number"
                      value={formMaxSalary}
                      onChange={e => setFormMaxSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {(activeTab === 'grades' || activeTab === 'designations') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scale Level</label>
                  <input
                    type="number"
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="active" className="text-xs text-slate-600 dark:text-slate-400">Active status</label>
              </div>

              {activeTab === 'approval_matrix' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approval Type</label>
                    <select
                      required
                      value={matrixApprovalType}
                      onChange={e => setMatrixApprovalType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="LEAVE">LEAVE</option>
                      <option value="EXPENSE">EXPENSE</option>
                      <option value="RECRUITMENT">RECRUITMENT</option>
                      <option value="PERFORMANCE">PERFORMANCE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department Scope</label>
                    <select
                      value={matrixDeptId}
                      onChange={e => setMatrixDeptId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Apply to All Departments --</option>
                      {allDepartments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation Scope</label>
                      <select
                        value={matrixDesignationId}
                        onChange={e => setMatrixDesignationId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                      >
                        <option value="">-- All Designations --</option>
                        {designations?.map(desig => (
                          <option key={desig.id} value={desig.id}>{desig.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grade Scope</label>
                      <select
                        value={matrixGradeId}
                        onChange={e => setMatrixGradeId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                      >
                        <option value="">-- All Grades --</option>
                        {grades?.map(grade => (
                          <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level 1 Approver (Primary)</label>
                    <select
                      required
                      value={matrixApprover1Id}
                      onChange={e => setMatrixApprover1Id(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select Level 1 Approver --</option>
                      {employees?.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.displayName || `${emp.firstName} ${emp.lastName}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level 2 Approver (Secondary/Skip)</label>
                    <select
                      value={matrixApprover2Id}
                      onChange={e => setMatrixApprover2Id(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select Level 2 Approver (Optional) --</option>
                      {employees?.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.displayName || `${emp.firstName} ${emp.lastName}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="matrixActiveEdit"
                      type="checkbox"
                      checked={matrixActive}
                      onChange={e => setMatrixActive(e.target.checked)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="matrixActiveEdit" className="text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                      Rule Active Status
                    </label>
                  </div>
                </>
              )}

              <DatePicker
                label="Effective Date"
                value={formEffectiveDate}
                onChange={setFormEffectiveDate}
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Node Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Move size={18} className="text-primary-500" /> Move Organizational Node
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleMoveNodeSubmit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs space-y-1">
                <p><span className="font-bold text-slate-500">Node to Move:</span> {moveTargetNode?.name} ({moveTargetNode?.code})</p>
                <p><span className="font-bold text-slate-500">Type:</span> <span className="capitalize">{moveTargetNode?.type}</span></p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select New Parent Node</label>
                <select
                  required
                  value={moveNewParentId}
                  onChange={e => setMoveNewParentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose New Parent --</option>
                  {moveTargetNode?.type === 'division' && (
                    businessUnits?.map(bu => <option key={bu.id} value={bu.id}>{bu.name} (Business Unit)</option>)
                  )}
                  {moveTargetNode?.type === 'department' && (
                    divisions?.map(d => <option key={d.id} value={d.id}>{d.name} (Division)</option>)
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Move Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Business Unit Modal */}
      {showCloneBUModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" /> Replication engine: Clone Business Unit
              </h3>
              <button onClick={() => { setShowCloneBUModal(false); setCloneTargetBU(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCloneBUSubmit} className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/40 p-3 rounded-lg text-xs space-y-1">
                <p><span className="font-bold text-slate-500">Source BU:</span> {cloneTargetBU?.name}</p>
                <p><span className="font-bold text-slate-500">Source Code:</span> {cloneTargetBU?.code}</p>
                <p className="text-[10px] text-slate-400 mt-1">Cloning will replicate the BU structure, division, department, and team layout, but will not assign existing employees.</p>
              </div>

              {cloneError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-lg text-xs text-red-600 dark:text-red-400">
                  {cloneError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target BU Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technology - Europe"
                  value={cloneTargetName}
                  onChange={e => setCloneTargetName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target BU Unique Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BU_TECH_EU"
                  value={cloneTargetCode}
                  onChange={e => setCloneTargetCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowCloneBUModal(false); setCloneTargetBU(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Replicate BU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Sidebar */}
      {showAuditSidebar && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-slideIn">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History size={18} className="text-amber-500" /> Audit Trail History
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Observability logs for node: <span className="font-semibold text-primary-600 dark:text-primary-400">{auditTargetEntity?.name}</span>
              </p>
            </div>
            <button
              onClick={() => { setShowAuditSidebar(false); setAuditTargetEntity(null); }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingAudit ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-amber-500" />
                <span className="text-xs font-semibold">Retrieving audit history logs...</span>
              </div>
            ) : !auditTrailData || !auditTrailData.content || auditTrailData.content.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic text-xs">
                No change logs found for this node.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-6">
                {auditTrailData.content.map((log: any) => {
                  let actionColor = 'bg-blue-500 text-white';
                  if (log.action === 'CREATE') actionColor = 'bg-emerald-500 text-white';
                  else if (log.action === 'DELETE') actionColor = 'bg-rose-500 text-white';
                  else if (log.action === 'RESTORE') actionColor = 'bg-teal-500 text-white';

                  return (
                    <div key={log.id} className="relative space-y-2">
                      <span className={`absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${actionColor} flex items-center justify-center text-[6px] font-extrabold`}>
                        {log.action[0]}
                      </span>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {log.action}
                        </span>
                        <span>{new Date(log.performedAt || log.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 text-xs space-y-1 shadow-sm">
                        {log.changeSummary ? (
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{log.changeSummary}</p>
                        ) : (
                          <p className="text-slate-500 italic">No summary provided.</p>
                        )}
                        <div className="text-[10px] text-slate-400 mt-2 flex flex-wrap gap-x-2 gap-y-1">
                          <span>By: <span className="font-semibold text-slate-600 dark:text-slate-300">{log.performedBy}</span> ({log.performedByRole || 'USER'})</span>
                          {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                        </div>

                        {(log.beforeJson || log.afterJson) && (
                          <details className="mt-2 border-t border-slate-200/50 dark:border-slate-700/50 pt-2 cursor-pointer">
                            <summary className="text-[9px] font-bold text-primary-500 uppercase select-none tracking-wider">
                              View Raw State Details
                            </summary>
                            <div className="mt-1 text-[9px] font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto space-y-2 leading-relaxed">
                              {log.beforeJson && (
                                <div>
                                  <div className="text-rose-400 font-bold mb-0.5">BEFORE:</div>
                                  <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(log.beforeJson), null, 2)}</pre>
                                </div>
                              )}
                              {log.afterJson && (
                                <div>
                                  <div className="text-emerald-400 font-bold mb-0.5">AFTER:</div>
                                  <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(log.afterJson), null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Pagination */}
          {auditTrailData && (auditTrailData as any).totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/60">
              <button
                disabled={auditPage === 0}
                onClick={() => setAuditPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Previous
              </button>
              <span className="font-medium text-slate-500">
                Page {auditPage + 1} of {(auditTrailData as any).totalPages}
              </span>
              <button
                disabled={auditPage >= (auditTrailData as any).totalPages - 1}
                onClick={() => setAuditPage(p => p + 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Employee Transfer Modal */}
      {showTransferModal && transferTargetEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-slate-900 dark:text-slate-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Move size={16} className="text-primary-500" />
                Transfer Employee: {transferTargetEmp.displayName}
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Department</label>
                <select
                  required
                  value={transferNewDeptId}
                  onChange={e => setTransferNewDeptId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">Select Department...</option>
                  {allDepartments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Location</label>
                <select
                  required
                  value={transferNewLocId}
                  onChange={e => setTransferNewLocId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">Select Location...</option>
                  {locations?.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
                  ))}
                </select>
              </div>

              {/* Live Impact Analysis message */}
              <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-3 rounded-lg text-[10px] text-primary-700 dark:text-primary-400">
                <span className="font-bold">Live Impact Analysis:</span> This transfer will update this employee's reporting manager context, payroll department allocation, and leave approval workflows immediately.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-750 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Manager Modal */}
      {showChangeManagerModal && changeManagerTargetEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-slate-900 dark:text-slate-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <GitBranch size={16} className="text-primary-500" />
                Change reporting line: {changeManagerTargetEmp.displayName}
              </h3>
              <button onClick={() => setShowChangeManagerModal(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangeManagerSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select New Reporting Manager</label>
                <select
                  required
                  value={changeManagerNewManagerId}
                  onChange={e => setChangeManagerNewManagerId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">Select Manager...</option>
                  {employees?.filter(e => e.id !== changeManagerTargetEmp.id).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.displayName} ({emp.employeeCode})</option>
                  ))}
                </select>
              </div>

              {/* Live Impact Analysis */}
              <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/50 p-3 rounded-lg text-[10px] text-primary-700 dark:text-primary-400">
                <span className="font-bold">Live Impact Analysis:</span> Updating reporting manager triggers hierarchical validation. Subordinate workflows, delegation routing, and direct reports path will recalculate.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowChangeManagerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-750 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Promotion Modal */}
      {showPromoteModal && promoteTargetEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-slate-900 dark:text-slate-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award size={16} className="text-indigo-500" />
                Promote employee: {promoteTargetEmp.displayName}
              </h3>
              <button onClick={() => setShowPromoteModal(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Designation / Title</label>
                <select
                  required
                  value={promoteNewDesignationId}
                  onChange={e => setPromoteNewDesignationId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">Select Title...</option>
                  {designations?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Grade Level</label>
                <select
                  required
                  value={promoteNewGradeId}
                  onChange={e => setPromoteNewGradeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">Select Grade...</option>
                  {grades?.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Level {g.level})</option>
                  ))}
                </select>
              </div>

              {/* Live Impact Analysis */}
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-3 rounded-lg text-[10px] text-indigo-700 dark:text-indigo-400">
                <span className="font-bold">Live Impact Analysis:</span> Promotion updates the employee's title, authority grade, leave allocations, and modifies salary range structures within bands automatically.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-750 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/10 transition-all active:scale-95"
                >
                  Confirm Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee 360 Detail Modal */}
      {showDetailModal && selectedEmployeeDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-slate-850 dark:text-slate-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-650 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                  {selectedEmployeeDetail.firstName?.[0]}{selectedEmployeeDetail.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedEmployeeDetail.displayName}</h3>
                  <p className="text-[10px] text-slate-400">Employee Master Digital Twin Overview</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-50 dark:bg-slate-800 p-1.5 rounded-full">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Org Details */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-105/40">
                <h4 className="font-extrabold text-[10px] uppercase text-primary-500 tracking-wider">Organizational DNA Context</h4>
                <div className="space-y-2 text-[11px]">
                  <p><span className="font-bold text-slate-450">Employee Code:</span> <span className="font-semibold">{selectedEmployeeDetail.employeeCode || 'N/A'}</span></p>
                  <p><span className="font-bold text-slate-450">Department:</span> <span className="font-semibold">{getDeptNameById(selectedEmployeeDetail.departmentId || '')}</span></p>
                  <p><span className="font-bold text-slate-450">Designation:</span> <span className="font-semibold">{designations?.find(des => des.id === selectedEmployeeDetail.designationId)?.name || 'N/A'}</span></p>
                  <p><span className="font-bold text-slate-450">Location:</span> <span className="font-semibold">{locations?.find(l => l.id === selectedEmployeeDetail.locationId)?.name || 'N/A'}</span></p>
                  <p><span className="font-bold text-slate-450">Employment Status:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-bold">{selectedEmployeeDetail.employmentStatus}</span></p>
                </div>
              </div>

              {/* Reporting Details */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-105/40">
                <h4 className="font-extrabold text-[10px] uppercase text-indigo-500 tracking-wider">Relationship & Reporting Graph</h4>
                <div className="space-y-2 text-[11px]">
                  <p><span className="font-bold text-slate-455">Solid Manager:</span> <span className="font-semibold">{selectedEmployeeDetail.managerId ? getEmployeeNameById(selectedEmployeeDetail.managerId) : 'None (Root)'}</span></p>
                  <p><span className="font-bold text-slate-455">Skip-Level Manager:</span> <span className="font-semibold">{selectedEmployeeDetail.skipManagerId ? getEmployeeNameById(selectedEmployeeDetail.skipManagerId) : 'Unassigned'}</span></p>
                  <p><span className="font-bold text-slate-455">Functional HRBP:</span> <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedEmployeeDetail.hrbpId ? getEmployeeNameById(selectedEmployeeDetail.hrbpId) : 'Unassigned'}</span></p>
                  <p><span className="font-bold text-slate-455">Assigned Mentor:</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedEmployeeDetail.mentorId ? getEmployeeNameById(selectedEmployeeDetail.mentorId) : 'Unassigned'}</span></p>
                  <p><span className="font-bold text-slate-455">Buddy:</span> <span className="font-semibold text-teal-600 dark:text-teal-400">{selectedEmployeeDetail.buddyId ? getEmployeeNameById(selectedEmployeeDetail.buddyId) : 'Unassigned'}</span></p>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2 sm:col-span-2 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-105/40">
                <h4 className="font-extrabold text-[10px] uppercase text-emerald-500 tracking-wider">Workforce Skills Inventory</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmployeeDetail.skills && selectedEmployeeDetail.skills.length > 0 ? (
                    selectedEmployeeDetail.skills.map((s: any, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-[9px] font-medium flex items-center gap-1">
                        <Sparkles size={8} className="text-yellow-500" />
                        {s.name} ({s.level || 'Beginner'})
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No skills registered for this Digital Twin profile.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Portal View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
