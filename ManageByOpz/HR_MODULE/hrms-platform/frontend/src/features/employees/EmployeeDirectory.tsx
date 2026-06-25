import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from './PhoneInput';
import { DatePicker } from './DatePicker';
import { downloadExport, type ExportFormat } from './exportUtils';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  setSearchTerm,
  setStatusFilter,
  setLocationFilter,
  setDeptFilter,
  setTypeFilter,
  setSortBy,
  setCurrentPage,
  resetFilters
} from './employeesSlice';
import { UserAccountTab } from './UserAccountTab';
import {
  Search, SlidersHorizontal, MapPin, Building, ShieldCheck, Shield,
  Award, FileText, Network, Clock, Plus, Edit2, Key, CheckCircle,
  Mail, Briefcase, AlertCircle, Eye, EyeOff, LayoutGrid, List,
  FileSpreadsheet, Trash2, Calendar, UserPlus, LogOut, CheckCircle2,
  ChevronRight, ChevronDown, User, Trash, Users, ArrowLeft, PlusCircle, ShieldAlert,
  GraduationCap, BriefcaseIcon, FileWarning, HelpCircle,
  Copy, ArrowUp, UserMinus, ArrowLeftRight, Activity, Download
} from 'lucide-react';
import {
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  useTransferEmployeeMutation,
  usePromoteEmployeeMutation,
  useChangeManagerMutation,
  useTerminateEmployeeMutation,
  useArchiveEmployeeMutation,
  useRestoreEmployeeMutation,
  useBulkArchiveEmployeesMutation,
  useBulkReassignManagerMutation,
  useBulkTerminateEmployeesMutation,
  useDeleteEmployeeMutation,
  useGetCompletionScoreQuery
} from './employeesApi';
import { useHasPermission } from '../auth/RoleGuard';
import {
  useGetOrganizationsQuery,
  useGetBusinessUnitsQuery,
  useGetDivisionsQuery,
  useGetDepartmentsQuery,
  useGetLocationsQuery,
  useGetGradesQuery,
  useGetBandsQuery,
  useGetDesignationsQuery
} from '../org-dna/orgDnaApi';

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const { data: liveEmployees, isLoading, error, refetch } = useGetEmployeesQuery(showArchived);

  const calculateTenure = (dojStr: string) => {
    if (!dojStr) return "0 Years, 0 Months";
    try {
      const doj = new Date(dojStr);
      const now = new Date();
      let years = now.getFullYear() - doj.getFullYear();
      let months = now.getMonth() - doj.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      return `${years} Years, ${months} Months`;
    } catch (e) {
      return "0 Years, 0 Months";
    }
  };

  const getProbationEndDate = (dojStr: string) => {
    if (!dojStr) return '2026-09-20';
    try {
      const d = new Date(dojStr);
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '2026-09-20';
    }
  };

  // State variables
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const {
    searchTerm,
    statusFilter,
    locationFilter,
    deptFilter,
    typeFilter,
    sortBy,
    currentPage
  } = useAppSelector((state) => state.employees);

  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [maskSensitive, setMaskSensitive] = useState(true);
  const isMasked = maskSensitive || !(currentUser && ['ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(currentUser.role));
  const [activeTab, setActiveTab] = useState<'overview' | 'identity' | 'dna' | 'skills' | 'certs' | 'docs' | 'relations' | 'timeline' | 'audit' | 'account'>('overview');
  const itemsPerPage = 6;

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Export state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showBulkExportDropdown, setShowBulkExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingLabel, setExportingLabel] = useState('');
  const token = useAppSelector((state) => state.auth.accessToken);
  const tenantId = useAppSelector((state) => state.auth.tenant);

  // Click outside handler for export dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.export-dropdown-container')) setShowExportDropdown(false);
      if (!target.closest('.bulk-export-dropdown-container')) setShowBulkExportDropdown(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Modals state
  const [activeModal, setActiveModal] = useState<'transfer' | 'promote' | 'manager' | 'terminate' | 'archive' | 'restore' | 'bulkArchive' | 'bulkReassignManager' | 'bulkTerminate' | 'delete' | 'editIdentity' | 'addSkill' | 'addCert' | 'addDoc' | 'addRelation' | 'none'>('none');

  // Form states
  const [transferDept, setTransferDept] = useState('');
  const [transferLoc, setTransferLoc] = useState('');

  const [promoteDesignation, setPromoteDesignation] = useState('');
  const [promoteGrade, setPromoteGrade] = useState('');

  const [newManagerId, setNewManagerId] = useState('');

  const [terminateDate, setTerminateDate] = useState('');
  const [terminateReason, setTerminateReason] = useState('');

  const [archiveReason, setArchiveReason] = useState('');
  const [bulkArchiveReason, setBulkArchiveReason] = useState('');

  // Bulk reassign manager states
  const [bulkManagerId, setBulkManagerId] = useState('');
  const [bulkManagerEffectiveDate, setBulkManagerEffectiveDate] = useState('');
  const [bulkManagerReason, setBulkManagerReason] = useState('');
  const [bulkManagerError, setBulkManagerError] = useState('');

  // Bulk terminate states
  const [bulkTerminateDate, setBulkTerminateDate] = useState('');
  const [bulkFinalWorkingDay, setBulkFinalWorkingDay] = useState('');
  const [bulkTerminateReason, setBulkTerminateReason] = useState('');
  const [bulkTerminateError, setBulkTerminateError] = useState('');

  // Skills / Certs / Docs Form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'TECHNICAL' | 'FUNCTIONAL' | 'SOFT' | 'LANGUAGE'>('TECHNICAL');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillRating, setNewSkillRating] = useState(7);
  const [newSkillExp, setNewSkillExp] = useState(3);

  const [newCertName, setNewCertName] = useState('');
  const [newCertAuthority, setNewCertAuthority] = useState('');
  const [newCertId, setNewCertId] = useState('');
  const [newCertIssueDate, setNewCertIssueDate] = useState('');
  const [newCertExpiryDate, setNewCertExpiryDate] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');

  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('IDENTITY');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  const [newRelType, setNewRelType] = useState<'MANAGER' | 'BUDDY' | 'MENTOR' | 'REVIEWER' | 'HRBP' | 'PROJECT_MANAGER' | 'DOTTED_LINE_MANAGER' | 'SKIP_LEVEL_MANAGER'>('BUDDY');
  const [newRelEmpId, setNewRelEmpId] = useState('');
  const [newRelNotes, setNewRelNotes] = useState('');

  // Edit Identity state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editMaritalStatus, setEditMaritalStatus] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editPreferredLang, setEditPreferredLang] = useState('');
  const [editPersonalEmail, setEditPersonalEmail] = useState('');
  const [editWorkPhone, setEditWorkPhone] = useState('');
  const [editPersonalPhone, setEditPersonalPhone] = useState('');
  const [editWorkPhoneError, setEditWorkPhoneError] = useState<string | null>(null);
  const [editPersonalPhoneError, setEditPersonalPhoneError] = useState<string | null>(null);
  const [editEmergencyPhoneError, setEditEmergencyPhoneError] = useState<string | null>(null);
  const [editCurrentAddress, setEditCurrentAddress] = useState('');
  const [editPermanentAddress, setEditPermanentAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');

  // DNA mapping queries
  const { data: orgs } = useGetOrganizationsQuery();
  const activeOrgId = selectedEmployee?.organizationId || orgs?.[0]?.id || '';
  const { data: allBUs } = useGetBusinessUnitsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allLocations } = useGetLocationsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allGrades } = useGetGradesQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allBands } = useGetBandsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allDesignations } = useGetDesignationsQuery(activeOrgId, { skip: !activeOrgId });

  // Eager child DNA endpoints scoped to employee selection
  const { data: employeeDivs } = useGetDivisionsQuery(selectedEmployee?.businessUnitId || '', { skip: !selectedEmployee?.businessUnitId });
  const { data: employeeDepts } = useGetDepartmentsQuery(selectedEmployee?.divisionId || '', { skip: !selectedEmployee?.divisionId });

  // Completion score
  const { data: completionScore = 70 } = useGetCompletionScoreQuery(selectedEmployee?.id || '', { skip: !selectedEmployee?.id });

  // Mutations
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [transferEmployee] = useTransferEmployeeMutation();
  const [promoteEmployee] = usePromoteEmployeeMutation();
  const [changeManager] = useChangeManagerMutation();
  const [terminateEmployee] = useTerminateEmployeeMutation();
  const [archiveEmployee] = useArchiveEmployeeMutation();
  const [restoreEmployee] = useRestoreEmployeeMutation();
  const [bulkArchiveEmployees] = useBulkArchiveEmployeesMutation();
  const [bulkReassignManager, { isLoading: isReassigning }] = useBulkReassignManagerMutation();
  const [bulkTerminateEmployees, { isLoading: isTerminating }] = useBulkTerminateEmployeesMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  // Permissions
  const canView = useHasPermission('EMPLOYEE_VIEW');
  const canEdit = useHasPermission('EMPLOYEE_EDIT');
  const canTerminate = useHasPermission('EMPLOYEE_TERMINATE');
  const canArchive = useHasPermission('EMPLOYEE_ARCHIVE');
  const canRestore = useHasPermission('EMPLOYEE_RESTORE');
  const canPerformBulk = currentUser && ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN'].includes(currentUser.role);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getBUName = (id: string) => allBUs?.find(b => b.id === id)?.name || 'General Software Engineering';
  const getDivName = (id: string) => employeeDivs?.find(d => d.id === id)?.name || 'Technology Infrastructure';
  const getDeptName = (id: string) => employeeDepts?.find(d => d.id === id)?.name || 'Platform Engineering';
  const getLocName = (id: string) => allLocations?.find(l => l.id === id)?.name || 'San Francisco, CA';
  const getGradeName = (id: string) => allGrades?.find(g => g.id === id)?.name || 'Grade 4 (E4)';
  const getBandName = (id: string) => allBands?.find(b => b.id === id)?.name || 'Level 2 Band';
  const getDesigName = (id: string) => allDesignations?.find(d => d.id === id)?.name || 'Senior Staff Engineer';

  // Normalize employees
  const employees = (liveEmployees || []).map((emp: any) => {
    const des = allDesignations?.find(d => d.id === emp.designationId)?.name || emp.designation || 'Staff Engineer';
    const loc = allLocations?.find(l => l.id === emp.locationId)?.name || emp.location || 'San Francisco, CA';
    const dept = employeeDepts?.find(d => d.id === emp.departmentId)?.name || emp.department || 'Engineering';
    return {
      ...emp,
      displayName: emp.displayName || `${emp.firstName} ${emp.lastName}`,
      department: dept,
      location: loc,
      designation: des,
      skills: emp.skills || [],
      certifications: emp.certifications || [],
      documents: emp.documents || [],
      relationships: emp.relationships || [],
      timeline: emp.timeline || [],
      customFields: emp.customFields || []
    };
  });

  const getEmployeeNameById = (id: string) => {
    if (!id) return 'Not Assigned';
    const found = employees.find((e: any) => e.id === id);
    return found ? found.displayName : 'Not Assigned';
  };

  // Filtering, sorting and search
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? emp.employmentStatus === statusFilter : true;
    const matchesLocation = locationFilter ? emp.locationId === locationFilter : true;
    const matchesDept = deptFilter ? emp.departmentId === deptFilter : true;
    const matchesType = typeFilter ? emp.employmentTypeId === typeFilter : true;

    return matchesSearch && matchesStatus && matchesLocation && matchesDept && matchesType;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === 'name') {
      return a.displayName.localeCompare(b.displayName);
    } else if (sortBy === 'code') {
      return a.employeeCode.localeCompare(b.employeeCode);
    } else if (sortBy === 'doj') {
      const dateA = a.dateOfJoining ? new Date(a.dateOfJoining).getTime() : 0;
      const dateB = b.dateOfJoining ? new Date(b.dateOfJoining).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = sortedEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentEmployees.map(emp => emp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  // Export action (CSV, Excel, PDF)
  const triggerExport = async (format: ExportFormat, scope: 'filtered' | 'selected' | 'all') => {
    const labels: Record<ExportFormat, string> = { csv: 'CSV', excel: 'Excel', pdf: 'PDF' };
    setIsExporting(true);
    setExportingLabel(`Generating ${labels[format]}...`);
    setShowExportDropdown(false);
    setShowBulkExportDropdown(false);

    try {
      const result = await downloadExport({
        format,
        scope,
        selectedIds: scope === 'selected' ? (selectedEmployee ? [selectedEmployee.id] : selectedIds) : undefined,
        searchTerm,
        statusFilter,
        locationFilter,
        deptFilter,
        typeFilter,
        sortBy,
        showArchived,
        token: token || '',
        tenantId: tenantId || 'default',
      });

      if (result.success) {
        triggerToast(`Exported to ${labels[format]} successfully → ${result.filename}`);
      } else {
        triggerToast(result.error || 'Export failed.');
      }
    } catch (err: any) {
      console.error('[Export] Error:', err);
      triggerToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportingLabel('');
    }
  };

  // Bulk actions
  const handleBulkTerminate = () => {
    if (selectedIds.length === 0) return;
    setBulkTerminateDate('');
    setBulkFinalWorkingDay('');
    setBulkTerminateReason('');
    setBulkTerminateError('');
    setActiveModal('bulkTerminate');
  };

  const handleBulkChangeManager = () => {
    if (selectedIds.length === 0) return;
    setBulkManagerId('');
    setBulkManagerEffectiveDate('');
    setBulkManagerReason('');
    setBulkManagerError('');
    setActiveModal('bulkReassignManager');
  };

  const submitBulkTerminate = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkTerminateDate) {
      setBulkTerminateError('Termination Date is required.');
      return;
    }
    if (!bulkFinalWorkingDay) {
      setBulkTerminateError('Final Working Day is required.');
      return;
    }
    if (!bulkTerminateReason || !bulkTerminateReason.trim()) {
      setBulkTerminateError('Termination Reason is required.');
      return;
    }

    try {
      setBulkTerminateError('');
      await bulkTerminateEmployees({
        employeeIds: selectedIds,
        terminationDate: bulkTerminateDate,
        finalWorkingDay: bulkFinalWorkingDay,
        reason: bulkTerminateReason
      }).unwrap();

      setSelectedIds([]);
      setActiveModal('none');
      refetch();
      triggerToast(`Successfully terminated the selected employees.`);
    } catch (err: any) {
      console.error(err);
      setBulkTerminateError(err?.data?.message || 'Failed to bulk terminate selected employees.');
    }
  };

  const submitBulkReassignManager = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkManagerId) {
      setBulkManagerError('Please select a manager.');
      return;
    }
    if (!bulkManagerEffectiveDate) {
      setBulkManagerError('Effective Date is required.');
      return;
    }
    if (!bulkManagerReason || !bulkManagerReason.trim()) {
      setBulkManagerError('Reason is required.');
      return;
    }
    if (selectedIds.includes(bulkManagerId)) {
      setBulkManagerError('An employee cannot report to themselves.');
      return;
    }

    try {
      setBulkManagerError('');
      await bulkReassignManager({
        employeeIds: selectedIds,
        managerId: bulkManagerId,
        effectiveDate: bulkManagerEffectiveDate,
        reason: bulkManagerReason
      }).unwrap();

      setSelectedIds([]);
      setActiveModal('none');
      refetch();
      triggerToast(`Successfully reassigned manager for the selected employees.`);
    } catch (err: any) {
      console.error(err);
      setBulkManagerError(err?.data?.message || 'Failed to bulk reassign manager.');
    }
  };

  // Profile completion recommendations
  const getRecommendations = (emp: any) => {
    const list: string[] = [];
    if (!emp.panNumber) list.push("Add Tax ID (PAN) (+15%)");
    if (!emp.aadhaarNumber) list.push("Add National ID (Aadhaar) (+15%)");
    if (!emp.bankAccountNumber) list.push("Setup Banking Details (+10%)");
    if (emp.skills.length === 0) list.push("Register Skills Competency (+5%)");
    if (emp.documents.length === 0) list.push("Upload Compliance Documents (+10%)");
    if (!emp.emergencyContactPhone) list.push("Register Emergency Contacts (+15%)");
    return list;
  };

  // Action submissions
  const submitTransfer = async () => {
    if (!selectedEmployee || !transferDept || !transferLoc) return;
    try {
      const res = await transferEmployee({
        id: selectedEmployee.id,
        departmentId: transferDept,
        locationId: transferLoc
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee transferred successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to complete transfer.");
    }
  };

  const submitPromotion = async () => {
    if (!selectedEmployee || !promoteDesignation || !promoteGrade) return;
    try {
      const res = await promoteEmployee({
        id: selectedEmployee.id,
        designationId: promoteDesignation,
        gradeId: promoteGrade
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee promoted successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to complete promotion.");
    }
  };

  const submitChangeManager = async () => {
    if (!selectedEmployee || !newManagerId) return;
    try {
      const res = await changeManager({
        id: selectedEmployee.id,
        managerId: newManagerId
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Manager changed successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update manager.");
    }
  };

  const submitTermination = async () => {
    if (!selectedEmployee || !terminateDate || !terminateReason) return;
    try {
      const res = await terminateEmployee({
        id: selectedEmployee.id,
        exitDate: terminateDate,
        reason: terminateReason
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee termination processed.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to terminate employee.");
    }
  };

  const submitArchive = async () => {
    if (!selectedEmployee || !archiveReason) return;
    try {
      const res = await archiveEmployee({
        id: selectedEmployee.id,
        reason: archiveReason
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee archived successfully.");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.data?.message || "Failed to archive employee.";
      triggerToast(errMsg);
    }
  };

  const submitRestore = async () => {
    if (!selectedEmployee) return;
    try {
      const res = await restoreEmployee(selectedEmployee.id).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee restored successfully.");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.data?.message || "Failed to restore employee.";
      triggerToast(errMsg);
    }
  };

  const submitBulkArchive = async () => {
    if (selectedIds.length === 0 || !bulkArchiveReason) return;
    try {
      await bulkArchiveEmployees({
        ids: selectedIds,
        reason: bulkArchiveReason
      }).unwrap();
      setSelectedIds([]);
      setActiveModal('none');
      triggerToast("Selected employees archived successfully.");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.data?.message || "Failed to bulk archive employees.";
      triggerToast(errMsg);
    }
  };

  const submitDelete = async () => {
    if (!selectedEmployee) return;
    if (!confirm("Are you sure you want to permanently delete this digital twin? This action is irreversible.")) return;
    try {
      await deleteEmployee(selectedEmployee.id).unwrap();
      setSelectedEmployee(null);
      setActiveModal('none');
      triggerToast("Employee permanently deleted.");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.data?.message || "Failed to delete employee.";
      triggerToast(errMsg);
    }
  };

  const openEditIdentityModal = () => {
    setEditFirstName(selectedEmployee.firstName || '');
    setEditLastName(selectedEmployee.lastName || '');
    setEditMiddleName(selectedEmployee.middleName || '');
    setEditDOB(selectedEmployee.dateOfBirth || '');
    setEditGender(selectedEmployee.gender || 'MALE');
    setEditNationality(selectedEmployee.nationality || '');
    setEditMaritalStatus(selectedEmployee.maritalStatus || 'SINGLE');
    setEditBloodGroup(selectedEmployee.bloodGroup || '');
    setEditPreferredLang(selectedEmployee.preferredLanguage || '');
    setEditPersonalEmail(selectedEmployee.personalEmail || '');
    setEditWorkPhone(selectedEmployee.workPhone || '');
    setEditPersonalPhone(selectedEmployee.personalPhone || '');
    setEditCurrentAddress(selectedEmployee.currentAddress || '');
    setEditPermanentAddress(selectedEmployee.permanentAddress || '');
    setEditEmergencyName(selectedEmployee.emergencyContactName || '');
    setEditEmergencyPhone(selectedEmployee.emergencyContactPhone || '');
    setEditEmergencyRelation(selectedEmployee.emergencyContactRelation || '');

    setActiveModal('editIdentity');
  };

  const submitEditIdentity = async () => {
    try {
      const updatedBody = {
        ...selectedEmployee,
        firstName: editFirstName,
        lastName: editLastName,
        middleName: editMiddleName,
        displayName: `${editFirstName} ${editLastName}`,
        dateOfBirth: editDOB || undefined,
        gender: editGender,
        nationality: editNationality,
        maritalStatus: editMaritalStatus,
        bloodGroup: editBloodGroup,
        preferredLanguage: editPreferredLang,
        personalEmail: editPersonalEmail || undefined,
        workPhone: editWorkPhone || undefined,
        personalPhone: editPersonalPhone || undefined,
        currentAddress: editCurrentAddress || undefined,
        permanentAddress: editPermanentAddress || undefined,
        emergencyContactName: editEmergencyName || undefined,
        emergencyContactPhone: editEmergencyPhone || undefined,
        emergencyContactRelation: editEmergencyRelation || undefined
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Identity information updated successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save changes.");
    }
  };

  const submitAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const newSkill = {
        skillName: newSkillName,
        skillCategory: newSkillCategory,
        proficiencyLevel: newSkillLevel,
        yearsOfExperience: newSkillExp,
        selfRating: newSkillRating,
        verified: false
      };

      const currentSkills = selectedEmployee.skills || [];
      const updatedBody = {
        ...selectedEmployee,
        skills: [...currentSkills, newSkill]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewSkillName('');
      setActiveModal('none');
      triggerToast("Competency skill added to twin registry.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to add skill.");
    }
  };

  const submitAddCert = async () => {
    if (!newCertName.trim() || !newCertAuthority.trim()) return;
    try {
      const newCert = {
        certificationName: newCertName,
        issuingAuthority: newCertAuthority,
        credentialId: newCertId || undefined,
        issueDate: newCertIssueDate || undefined,
        expiryDate: newCertExpiryDate || undefined,
        credentialUrl: newCertUrl || undefined,
        verified: false
      };

      const currentCerts = selectedEmployee.certifications || [];
      const updatedBody = {
        ...selectedEmployee,
        certifications: [...currentCerts, newCert]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewCertName('');
      setNewCertAuthority('');
      setNewCertId('');
      setNewCertIssueDate('');
      setNewCertExpiryDate('');
      setNewCertUrl('');
      setActiveModal('none');
      triggerToast("Certification registered successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to register certification.");
    }
  };

  const submitAddDoc = async () => {
    if (!newDocName.trim()) return;
    try {
      const newDoc = {
        documentName: newDocName,
        documentType: newDocType,
        filePath: `docs/${selectedEmployee.id}/${newDocName}`,
        fileSize: 2048576, // 2MB
        mimeType: 'application/pdf',
        expiryDate: newDocExpiry || undefined,
        verificationStatus: 'VERIFIED'
      };

      const currentDocs = selectedEmployee.documents || [];
      const updatedBody = {
        ...selectedEmployee,
        documents: [...currentDocs, newDoc]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewDocName('');
      setNewDocExpiry('');
      setActiveModal('none');
      triggerToast("Document uploaded to secure vault.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to upload document.");
    }
  };

  const submitAddRelation = async () => {
    if (!newRelEmpId) return;
    try {
      const newRel = {
        relationshipType: newRelType,
        relatedEmployeeId: newRelEmpId,
        primary: true,
        notes: newRelNotes || undefined
      };

      const currentRels = selectedEmployee.relationships || [];
      const updatedBody = {
        ...selectedEmployee,
        relationships: [...currentRels, newRel]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewRelEmpId('');
      setNewRelNotes('');
      setActiveModal('none');
      triggerToast("Relationship mapped successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to map relationship.");
    }
  };

  // Remove collections
  const removeSkill = async (skillIdx: number) => {
    if (confirm("Are you sure you want to remove this skill?")) {
      try {
        const updatedSkills = (selectedEmployee.skills || []).filter((_: any, idx: number) => idx !== skillIdx);
        const updatedBody = { ...selectedEmployee, skills: updatedSkills };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Skill removed successfully.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to remove skill.");
      }
    }
  };

  const removeCert = async (certIdx: number) => {
    if (confirm("Are you sure you want to remove this certification?")) {
      try {
        const updatedCerts = (selectedEmployee.certifications || []).filter((_: any, idx: number) => idx !== certIdx);
        const updatedBody = { ...selectedEmployee, certifications: updatedCerts };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Certification removed.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to remove certification.");
      }
    }
  };

  const removeDoc = async (docIdx: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const updatedDocs = (selectedEmployee.documents || []).filter((_: any, idx: number) => idx !== docIdx);
        const updatedBody = { ...selectedEmployee, documents: updatedDocs };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Document deleted from vault.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to delete document.");
      }
    }
  };

  const removeRel = async (relIdx: number) => {
    if (confirm("Are you sure you want to delete this relationship edge?")) {
      try {
        const updatedRels = (selectedEmployee.relationships || []).filter((_: any, idx: number) => idx !== relIdx);
        const updatedBody = { ...selectedEmployee, relationships: updatedRels };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Relationship mapping deleted.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to delete mapping.");
      }
    }
  };

  const getRandomGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'from-[#3B82F6] to-[#2DD4BF]',
      'from-[#10B981] to-[#06B6D4]',
      'from-[#8B5CF6] to-[#6366F1]',
      'from-[#F43F5E] to-[#F59E0B]',
      'from-[#4F46E5] to-[#3730A3]'
    ];
    return colors[hash % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6 p-6 w-full max-w-none text-slate-900 dark:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-indigo-650 text-white px-5 py-3 rounded-xl shadow-2xl z-55 flex items-center gap-2 border border-indigo-505 animate-slide-in text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Directory View */}
      {!selectedEmployee ? (
        <div className="space-y-6 animate-fade-in">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Employee Master Workspace</h1>
              <p className="text-xs text-slate-405 mt-1 font-semibold">
                Single Source of Truth (SSOT) database for all organizational Digital Twins.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative export-dropdown-container">
                <button
                  disabled={isExporting}
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-[#151D30] px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <><span className="inline-block w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> {exportingLabel}</>
                  ) : (
                    <><Download className="w-3.5 h-3.5 text-emerald-500" /> Export <ChevronDown className="w-3 h-3 ml-0.5" /></>
                  )}
                </button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 top-full w-48 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-slide-in">
                    <button onClick={() => triggerExport('csv', selectedIds.length > 0 ? 'selected' : 'filtered')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV</button>
                    <button onClick={() => triggerExport('excel', selectedIds.length > 0 ? 'selected' : 'filtered')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-blue-500" /> Export Excel</button>
                    <button onClick={() => triggerExport('pdf', selectedIds.length > 0 ? 'selected' : 'filtered')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-red-500" /> Export PDF</button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/onboarding')}
                className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-xs font-extrabold shadow-sm hover:shadow transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" /> Onboarding Pipeline
              </button>
            </div>
          </div>

          {/* Search, Sort and Layout Controls */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Digital Twins by name, code, department, role..."
                value={searchTerm}
                onChange={e => { dispatch(setSearchTerm(e.target.value)); }}
                className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-indigo-550 dark:focus:border-indigo-500 transition-colors font-semibold"
              />
            </div>

            {/* Sort & View Switches */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <select
                value={sortBy}
                onChange={e => dispatch(setSortBy(e.target.value))}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-lg px-3 py-2 text-xs outline-none font-semibold text-slate-700 dark:text-slate-350"
              >
                <option value="name">Sort by: Name</option>
                <option value="code">Sort by: Code</option>
                <option value="doj">Sort by: Joining Date</option>
              </select>

              <div className="flex items-center border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 transition-all ${viewMode === 'card' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-all ${viewMode === 'table' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters Drawer */}
          <div className="bg-slate-50 dark:bg-[#090D14] border border-slate-200/60 dark:border-slate-855/60 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => { dispatch(setStatusFilter(e.target.value)); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-750 dark:text-slate-350"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_PROBATION">On Probation</option>
                <option value="ON_NOTICE">On Notice</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={e => { dispatch(setLocationFilter(e.target.value)); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-750 dark:text-slate-350"
              >
                <option value="">All Locations</option>
                {allLocations?.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Designation</label>
              <select
                value={typeFilter}
                onChange={e => { dispatch(setTypeFilter(e.target.value)); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-750 dark:text-slate-350"
              >
                <option value="">All Roles</option>
                {allDesignations?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Archived Records</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={e => { setShowArchived(e.target.checked); dispatch(setCurrentPage(1)); }}
                  className="rounded border-slate-300 dark:border-slate-800 text-indigo-650 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Show Archived</span>
              </label>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Clear Filters</label>
              <button
                onClick={() => {
                  dispatch(resetFilters());
                  setShowArchived(false);
                }}
                className="w-full border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 py-2 rounded-lg text-xs font-bold"
              >
                Reset Dashboard
              </button>
            </div>
          </div>

          {/* Bulk Action Trigger Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold animate-slide-in shadow-sm">
              <span className="text-indigo-750 dark:text-indigo-400">
                Selected {selectedIds.length} employee twins for bulk actions.
              </span>
              <div className="flex gap-3">
                <div className="relative bulk-export-dropdown-container">
                  <button
                    disabled={isExporting}
                    onClick={() => setShowBulkExportDropdown(!showBulkExportDropdown)}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isExporting ? exportingLabel : <><Download className="w-3.5 h-3.5" /> Export Selected <ChevronDown className="w-3 h-3" /></>}
                  </button>
                  {showBulkExportDropdown && (
                    <div className="absolute right-0 mt-2 top-full w-48 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-slide-in">
                      <button onClick={() => triggerExport('csv', 'selected')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> CSV</button>
                      <button onClick={() => triggerExport('excel', 'selected')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-blue-500" /> Excel (.xlsx)</button>
                      <button onClick={() => triggerExport('pdf', 'selected')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-red-500" /> PDF</button>
                    </div>
                  )}
                </div>
                {canPerformBulk ? (
                  <button
                    onClick={handleBulkChangeManager}
                    className="bg-[#27272A] hover:bg-[#3F3F46] dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg"
                  >
                    Re-assign Manager
                  </button>
                ) : (
                  <button
                    disabled
                    title="Requires Admin privileges"
                    className="bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg cursor-not-allowed"
                  >
                    Re-assign Manager
                  </button>
                )}
                {canPerformBulk ? (
                  <button
                    onClick={handleBulkTerminate}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg"
                  >
                    Bulk Terminate
                  </button>
                ) : (
                  <button
                    disabled
                    title="Requires Admin privileges"
                    className="bg-rose-100/50 dark:bg-rose-950/20 text-rose-300 dark:text-rose-900 border border-rose-200 dark:border-rose-900 px-3.5 py-2 rounded-lg cursor-not-allowed"
                  >
                    Bulk Terminate
                  </button>
                )}
                {canArchive && (
                  <button
                    onClick={() => { setBulkArchiveReason(''); setActiveModal('bulkArchive'); }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg"
                  >
                    Bulk Archive
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Directory Listings */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm space-y-4 animate-pulse">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-2/3" />
                      <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-slate-50 dark:bg-slate-900 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/85 dark:border-slate-855 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">API Sync Failure</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Could not connect to the Employee Master Aggregate registry. Please confirm that the backend services are running.
              </p>
            </div>
          ) : currentEmployees.length === 0 ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/85 dark:border-slate-855 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="text-4xl">👥</div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">No Matching Digital Twins</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                No active employee twins match your selected filter criteria. Modify your filters or search query.
              </p>
            </div>
          ) : viewMode === 'card' ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentEmployees.map(emp => {
                const isSelected = selectedIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    className={`bg-white dark:bg-[#0B0F19] rounded-xl border p-5 hover:shadow-xl hover:border-indigo-500/35 transition-all duration-300 cursor-pointer relative group flex flex-col justify-between h-[180px] ${isSelected ? 'border-indigo-650 ring-2 ring-indigo-500/10' : 'border-slate-200/80 dark:border-slate-850'
                      }`}
                  >
                    {/* Checkbox selector */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 right-4"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(emp.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-350 dark:border-slate-800 text-indigo-655 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div
                      onClick={() => setSelectedEmployee(emp)}
                      className="flex items-start gap-4 flex-1"
                    >
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={emp.displayName}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover:ring-indigo-500/20 transition-all shrink-0"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getRandomGradient(emp.displayName)} flex items-center justify-center text-white text-base font-extrabold shrink-0`}>
                          {getInitials(emp.displayName)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] font-mono font-extrabold text-indigo-650 dark:text-indigo-400">{emp.employeeCode}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${emp.employmentStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400'
                            }`}>
                            {emp.employmentStatus}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {emp.displayName}
                        </h3>
                        <p className="text-xs text-slate-450 font-semibold mt-0.5 truncate">{emp.designation}</p>
                      </div>
                    </div>

                    {/* Footer DNA details */}
                    <div
                      onClick={() => setSelectedEmployee(emp)}
                      className="border-t border-slate-100 dark:border-slate-850/60 pt-3 mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/85 dark:border-slate-855 text-slate-450 uppercase text-[9px] font-bold tracking-wider">
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedIds.length === currentEmployees.length && currentEmployees.length > 0}
                          className="rounded text-indigo-650 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Code</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Designation</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joining Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                    {currentEmployees.map(emp => {
                      const isSelected = selectedIds.includes(emp.id);
                      return (
                        <tr
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`hover:bg-slate-50/60 dark:hover:bg-slate-900/35 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}
                        >
                          <td className="p-4" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => handleSelectOne(emp.id, e.target.checked)}
                              className="rounded text-indigo-650 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.displayName} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getRandomGradient(emp.displayName)} flex items-center justify-center text-white text-[10px] font-bold`}>
                                {getInitials(emp.displayName)}
                              </div>
                            )}
                            <div>
                              <p className="font-extrabold text-slate-855 dark:text-white text-xs">{emp.displayName}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">{emp.workEmail}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{emp.employeeCode}</td>
                          <td className="p-4">{emp.department}</td>
                          <td className="p-4">{emp.designation}</td>
                          <td className="p-4">{emp.location}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${emp.employmentStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400'
                              }`}>
                              {emp.employmentStatus}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-500">{emp.dateOfJoining || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination bar */}
          <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-850 pt-4 text-xs font-semibold">
            <span className="text-slate-450">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedEmployees.length)} of {sortedEmployees.length} employee twins
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-bold"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${currentPage === i + 1
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Employee 360 Workspace Cockpit View ───────────────── */
        <div className="space-y-6 animate-fade-in text-slate-850 dark:text-white">
          {/* Header Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
            <button
              onClick={() => { setSelectedEmployee(null); setActiveTab('overview'); }}
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-indigo-650 dark:hover:text-indigo-400 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Master Directory
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {currentUser && ['ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(currentUser.role) && (
                <button
                  onClick={() => setMaskSensitive(!maskSensitive)}
                  className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg text-xs text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold"
                >
                  {maskSensitive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {maskSensitive ? 'Reveal Compliance Keys' : 'Mask Compliance Keys'}
                </button>
              )}

              <div className="relative export-dropdown-container">
                <button
                  disabled={isExporting}
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-[#151D30] px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-slate-650 dark:text-slate-300"
                >
                  {isExporting ? (
                    <><span className="inline-block w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> {exportingLabel}</>
                  ) : (
                    <><Download className="w-3.5 h-3.5 text-emerald-500" /> Export <ChevronDown className="w-3 h-3 ml-0.5" /></>
                  )}
                </button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 top-full w-48 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-slide-in">
                    <button onClick={() => triggerExport('csv', 'selected')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV</button>
                    <button onClick={() => triggerExport('excel', 'selected')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-blue-500" /> Export Excel</button>
                    <button onClick={() => triggerExport('pdf', 'selected')} className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-red-500" /> Export PDF</button>
                  </div>
                )}
              </div>

              <button
                onClick={openEditIdentityModal}
                className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Employee Twin Core Profile Card Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT PROFILE CARD */}
            <div className="relative overflow-hidden pt-0 px-6 pb-6 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/80 dark:border-slate-850 flex flex-col justify-between shadow-sm space-y-6">

              {/* Blue/indigo gradient top header banner */}
              <div className="bg-gradient-to-r from-blue-500 via-[#4F46E5] to-[#5D69F4] h-24 -mx-6 rounded-t-2xl relative" />

              <div className="flex flex-col items-center text-center -mt-14 relative z-10 space-y-3">
                {/* Circular Avatar with Active Availability Indicator */}
                <div className="relative">
                  {selectedEmployee.avatarUrl ? (
                    <img
                      src={selectedEmployee.avatarUrl}
                      alt={selectedEmployee.displayName}
                      className="w-22 h-22 rounded-full object-cover border-4 border-white dark:border-[#0B0F19] shadow-md"
                    />
                  ) : (
                    <div className={`w-22 h-22 rounded-full bg-gradient-to-tr ${getRandomGradient(selectedEmployee.displayName)} flex items-center justify-center text-white text-3xl font-extrabold border-4 border-white dark:border-[#0B0F19] shadow-md`}>
                      {getInitials(selectedEmployee.displayName)}
                    </div>
                  )}
                  {selectedEmployee.employmentStatus === 'ACTIVE' && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0B0F19] rounded-full" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-slate-905 dark:text-white leading-tight">{selectedEmployee.displayName}</h2>

                  {/* Copyable Employee Code Badge */}
                  <div className="flex items-center justify-center gap-1.5 mt-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30 font-mono text-[10px] font-bold cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all active:scale-95 inline-flex" onClick={() => { navigator.clipboard.writeText(selectedEmployee.employeeCode); triggerToast("Copied Employee Code: " + selectedEmployee.employeeCode); }}>
                    <span>{selectedEmployee.employeeCode}</span>
                    <Copy className="w-3 h-3 text-indigo-500" />
                  </div>

                  <div>
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 tracking-wider">
                      {selectedEmployee.employmentStatus}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-450 dark:text-slate-300 pt-1">{getDesigName(selectedEmployee.designationId)}</p>

                  <div className="flex flex-col gap-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400 w-full text-left border-t border-slate-100 dark:border-slate-850/60 pt-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{getDeptName(selectedEmployee.departmentId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{getLocName(selectedEmployee.locationId)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion Gauge */}
              <div className="border-t border-slate-100 dark:border-slate-850/60 pt-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-450">TWIN COMPLETION</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{completionScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-450 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold leading-normal">
                  Calculated using weights: ID (20%), Contact (15%), DNA (25%), Compliance (15%), Banking (10%), Docs (10%), Skills (5%).
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="border-t border-slate-100 dark:border-slate-850/60 pt-5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">QUICK ACTIONS</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    onClick={() => { setTransferDept(selectedEmployee.departmentId || ''); setTransferLoc(selectedEmployee.locationId || ''); setActiveModal('transfer'); }}
                    className="flex items-center justify-center gap-2 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2.5 rounded-xl text-center cursor-pointer text-slate-700 dark:text-slate-355 hover:border-indigo-500/30 transition-all"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transfer</span>
                  </button>

                  <button
                    onClick={() => { setPromoteDesignation(selectedEmployee.designationId || ''); setPromoteGrade(selectedEmployee.gradeId || ''); setActiveModal('promote'); }}
                    className="flex items-center justify-center gap-2 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2.5 rounded-xl text-center cursor-pointer text-slate-700 dark:text-slate-355 hover:border-indigo-500/30 transition-all"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Promote</span>
                  </button>

                  <button
                    onClick={() => { setNewManagerId(selectedEmployee.managerId || ''); setActiveModal('manager'); }}
                    className="flex items-center justify-center gap-2 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2.5 rounded-xl text-center cursor-pointer text-slate-700 dark:text-slate-355 hover:border-indigo-500/30 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Assign Manager</span>
                  </button>

                  {canTerminate && selectedEmployee.employmentStatus !== 'TERMINATED' && selectedEmployee.employmentStatus !== 'ARCHIVED' && (
                    <button
                      onClick={() => { setTerminateDate(''); setTerminateReason(''); setActiveModal('terminate'); }}
                      className="flex items-center justify-center gap-2 border border-rose-200/60 dark:border-rose-955/20 hover:bg-rose-50 dark:hover:bg-rose-955/20 p-2.5 rounded-xl text-center cursor-pointer text-rose-600 dark:text-rose-450 transition-all"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Terminate</span>
                    </button>
                  )}

                  {canArchive && selectedEmployee.employmentStatus !== 'ARCHIVED' && (
                    <button
                      onClick={() => { setArchiveReason(''); setActiveModal('archive'); }}
                      className="flex items-center justify-center gap-2 border border-amber-200/60 dark:border-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-955/20 p-2.5 rounded-xl text-center cursor-pointer text-amber-600 dark:text-amber-405 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}

                  {canRestore && (selectedEmployee.employmentStatus === 'ARCHIVED' || selectedEmployee.deleted) && (
                    <button
                      onClick={submitRestore}
                      className="flex items-center justify-center gap-2 border border-emerald-200/60 dark:border-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-955/20 p-2.5 rounded-xl text-center cursor-pointer text-emerald-650 dark:text-emerald-450 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  )}

                  {(currentUser?.role === 'ROLE_SUPER_ADMIN' || currentUser?.role === 'ROLE_ULTRA_SUPER_ADMIN') && (
                    <button
                      onClick={submitDelete}
                      className="flex items-center justify-center gap-2 border border-red-200/65 dark:border-red-950/25 hover:bg-red-50 dark:hover:bg-red-955/15 p-2 rounded-xl text-center cursor-pointer text-red-600 dark:text-red-400 transition-all col-span-2 mt-1"
                    >
                      <Trash className="w-3.5 h-3.5 text-red-550" />
                      <span>Permanently Delete Twin</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Employee Tenure Card Widget */}
              <div className="border-t border-slate-100 dark:border-slate-850/60 pt-5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">EMPLOYEE TENURE</p>
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/65 dark:border-slate-850 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4.5 h-4.5 text-indigo-655 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-none">
                      {calculateTenure(selectedEmployee.dateOfJoining)}
                    </p>
                    <p className="text-[9px] font-medium text-slate-450 dark:text-slate-500 mt-1">
                      Since {selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jun 20, 2026'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT WORKSPACE CONSOLE */}
            <div className="lg:col-span-2 flex flex-col space-y-6">

              {/* Tab Selector Navigation */}
              <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1 bg-white dark:bg-[#0B0F19] rounded-xl p-1.5 shadow-sm border border-slate-200/60 dark:border-slate-850">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutGrid },
                  { id: 'identity', label: 'Identity & Contacts', icon: User },
                  { id: 'dna', label: 'Employment DNA', icon: Briefcase },
                  { id: 'skills', label: 'Skills Cloud', icon: Award },
                  { id: 'certs', label: 'Certifications', icon: CheckCircle2 },
                  { id: 'docs', label: 'Document Vault', icon: FileText },
                  { id: 'relations', label: 'Relationship Graph', icon: Network },
                  { id: 'timeline', label: 'Timeline Log', icon: Clock },
                  { id: 'audit', label: 'Audit History', icon: ShieldCheck },
                  ...(currentUser && ['ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER'].includes(currentUser.role)
                    ? [{ id: 'account', label: 'User Account', icon: Shield }]
                    : [])
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all outline-none ${activeTab === tab.id
                      ? 'bg-[#4F46E5] text-white shadow-sm'
                      : 'text-slate-450 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Console Content Panel */}
              <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-6 min-h-[400px] shadow-sm">
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Twin Health Summary Card */}
                      <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">TWIN HEALTH SUMMARY</h4>
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-900/30">
                                Score: {completionScore}%
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Complete the following to improve profile health</p>
                          </div>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-3">
                          {[
                            { id: 'pan', label: 'Add Tax ID (PAN)', pct: '+15%', checked: !!selectedEmployee.panNumber, onClick: openEditIdentityModal },
                            { id: 'aadhaar', label: 'Add National ID (Aadhaar)', pct: '+15%', checked: !!selectedEmployee.aadhaarNumber, onClick: openEditIdentityModal },
                            { id: 'bank', label: 'Setup Banking Details', pct: '+10%', checked: !!selectedEmployee.bankAccountNumber, onClick: openEditIdentityModal },
                            { id: 'skills', label: 'Register Skills Competency', pct: '+5%', checked: selectedEmployee.skills && selectedEmployee.skills.length > 0, onClick: () => setActiveModal('addSkill') },
                            { id: 'docs', label: 'Upload Compliance Documents', pct: '+10%', checked: selectedEmployee.documents && selectedEmployee.documents.length > 0, onClick: () => setActiveModal('addDoc') },
                            { id: 'emergency', label: 'Register Emergency Contacts', pct: '+15%', checked: !!selectedEmployee.emergencyContactPhone, onClick: openEditIdentityModal },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={item.onClick}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${item.checked
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border-none'
                                    : 'bg-indigo-50 hover:bg-indigo-105 text-indigo-600 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/40 border-none'
                                    }`}
                                >
                                  {item.checked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                                <span className={item.checked ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}>{item.label}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.checked
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                                }`}>
                                {item.pct}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Employment Summary Card */}
                      <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">EMPLOYMENT SUMMARY</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Core organizational alignment details</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Joining Date</p>
                            <p className="mt-1 font-extrabold text-slate-800 dark:text-white">{selectedEmployee.dateOfJoining || '2026-06-20'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Work Mode</p>
                            <p className="mt-1 font-extrabold text-slate-800 dark:text-white uppercase">{selectedEmployee.workMode || 'HYBRID'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Manager</p>
                            <p className="mt-1 font-extrabold text-slate-800 dark:text-white">{selectedEmployee.managerId ? 'Reporting Manager' : 'None Assigned'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Grade / Band</p>
                            <p className="mt-1 font-extrabold text-slate-800 dark:text-white leading-tight">
                              {getGradeName(selectedEmployee.gradeId)} <br />
                              <span className="text-[10px] text-slate-400 font-medium">{getBandName(selectedEmployee.bandId)}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-405 uppercase font-bold tracking-wider">Employment Type</p>
                            <p className="mt-1 font-extrabold text-slate-800 dark:text-white">{selectedEmployee.employmentType || 'Full Time'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-405 uppercase font-bold tracking-wider">Probation Ends</p>
                            <p className="mt-1 font-extrabold text-slate-800 dark:text-white">{getProbationEndDate(selectedEmployee.dateOfJoining)}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Stat lists and illustrations */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                      {/* Assessed Skills Card */}
                      <div className="relative overflow-hidden bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px] group hover:border-indigo-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center shrink-0">
                            <Award className="w-4.5 h-4.5 text-purple-650 dark:text-purple-400" />
                          </div>

                          {/* Target radar/concentric circle decoration */}
                          <div className="absolute top-2 right-2 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-16 h-16 text-purple-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="50" cy="50" r="40" />
                              <circle cx="50" cy="50" r="25" />
                              <circle cx="50" cy="50" r="10" />
                              <line x1="50" y1="10" x2="50" y2="90" />
                              <line x1="10" y1="50" x2="90" y2="50" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3.5 space-y-1">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">ASSESSED SKILLS</p>
                          <p className="text-lg font-extrabold text-slate-850 dark:text-white leading-none">
                            {selectedEmployee.skills ? selectedEmployee.skills.length : 0} Total Skills
                          </p>
                          <button onClick={() => setActiveTab('skills')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold pt-1.5 block cursor-pointer">
                            View Skills Cloud &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Certifications Card */}
                      <div className="relative overflow-hidden bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px] group hover:border-indigo-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-955/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                          </div>

                          {/* Certificate/medal decoration */}
                          <div className="absolute top-2 right-2 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-16 h-16 text-emerald-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="25" y="20" width="50" height="60" rx="4" />
                              <circle cx="50" cy="50" r="12" />
                              <path d="M45 62 L40 80 L50 72 L60 80 L55 62" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3.5 space-y-1">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">CERTIFICATIONS</p>
                          <p className="text-lg font-extrabold text-slate-850 dark:text-white leading-none">
                            {selectedEmployee.certifications ? selectedEmployee.certifications.length : 0} Active Credentials
                          </p>
                          <button onClick={() => setActiveTab('certs')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold pt-1.5 block cursor-pointer">
                            View Credentials &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Vault Documents Card */}
                      <div className="relative overflow-hidden bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px] group hover:border-indigo-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                            <FileText className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                          </div>

                          {/* Folder/documents decoration */}
                          <div className="absolute top-2 right-2 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-16 h-16 text-amber-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 30 L40 30 L48 40 L80 40 L80 80 L20 80 Z" />
                              <line x1="32" y1="52" x2="68" y2="52" />
                              <line x1="32" y1="62" x2="60" y2="62" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3.5 space-y-1">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">VAULT DOCUMENTS</p>
                          <p className="text-lg font-extrabold text-slate-855 dark:text-white leading-none">
                            {selectedEmployee.documents ? selectedEmployee.documents.length : 0} Total Documents
                          </p>
                          <button onClick={() => setActiveTab('docs')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold pt-1.5 block cursor-pointer">
                            Open Vault &rarr;
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Timeline Log widget */}
                    <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                        <h4 className="text-xs font-extrabold text-slate-905 dark:text-white uppercase tracking-wider">RECENT LIFECYCLE EVENTS</h4>
                        <button onClick={() => setActiveTab('timeline')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer">
                          View Timeline Log &rarr;
                        </button>
                      </div>

                      {!selectedEmployee.timeline || selectedEmployee.timeline.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-450 dark:text-slate-500">
                          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-xs font-bold text-slate-705 dark:text-slate-305">No recorded lifecycle events</p>
                          <p className="text-[10px] mt-0.5 text-slate-400">Events like onboarding, transfers, promotions will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {selectedEmployee.timeline.slice(0, 3).map((evt: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start text-xs font-semibold border-l-2 border-indigo-100 dark:border-indigo-950 pl-3.5 ml-1.5 py-0.5">
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">{evt.date || evt.eventDate || 'N/A'}</span>
                              <div>
                                <h5 className="font-extrabold text-slate-800 dark:text-slate-200">{evt.title}</h5>
                                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">{evt.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. IDENTITY & CONTACT TAB */}
                {activeTab === 'identity' && (
                  <div className="space-y-8 animate-fade-in text-xs font-semibold text-slate-700 dark:text-slate-300">

                    {/* Personal Details */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Personal Attributes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">First Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.firstName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Middle Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.middleName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Last Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.lastName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.displayName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.dateOfBirth || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Gender</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.gender || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nationality</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.nationality || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Marital Status</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.maritalStatus || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.bloodGroup || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Language</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.preferredLanguage || 'English'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Contact DNA</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Work Email</p>
                          <p className="mt-1 font-mono text-slate-900 dark:text-white font-bold">{selectedEmployee.workEmail}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Personal Email</p>
                          <p className="mt-1 font-mono text-slate-900 dark:text-white font-bold">{selectedEmployee.personalEmail || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Work Phone</p>
                          <p className="mt-1 text-slate-900 dark:text-white font-bold">{selectedEmployee.workPhone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Personal Phone</p>
                          <p className="mt-1 text-slate-900 dark:text-white font-bold">{selectedEmployee.personalPhone || '-'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Addresses (Current & Permanent)</p>
                          <p className="mt-1 text-slate-900 dark:text-white leading-relaxed">
                            <span className="font-bold">Current:</span> {selectedEmployee.currentAddress || 'Not registered'} <br />
                            <span className="font-bold mt-1 inline-block">Permanent:</span> {selectedEmployee.permanentAddress || 'Not registered'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Emergency Contacts</h3>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-202/60 dark:border-slate-800/80 max-w-md">
                        {selectedEmployee.emergencyContactName ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Contact Name</p>
                              <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{selectedEmployee.emergencyContactName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Relationship</p>
                              <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{selectedEmployee.emergencyContactRelation}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile Number</p>
                              <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{selectedEmployee.emergencyContactPhone}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-450 py-2">No emergency contacts registered. Please add emergency details.</p>
                        )}
                      </div>
                    </div>

                    {/* Compliance & Banking Keys */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Compliance & Banking Keys</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-450 font-bold uppercase">Tax ID (PAN)</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {isMasked ? '••••••••••' : selectedEmployee.panNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-450 font-bold uppercase">National ID (Aadhaar)</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {isMasked ? '••••-••••-••••' : selectedEmployee.aadhaarNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">PF UAN Number</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {isMasked ? '••••••••••••' : selectedEmployee.uanNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">ESIC Number</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {isMasked ? '•••••••••••••••••' : selectedEmployee.esicNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">Passport Number</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {isMasked ? '••••••••' : selectedEmployee.passportNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">Passport Expiry</p>
                          <p className="mt-1 text-slate-900 dark:text-white font-bold">{selectedEmployee.passportExpiry || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-455 font-bold uppercase">Bank Account Details</p>
                          <p className="mt-1 text-slate-900 dark:text-white leading-relaxed">
                            <span className="font-bold">Bank:</span> {selectedEmployee.bankName || 'N/A'} <br />
                            <span className="font-bold">Account:</span> {isMasked ? '••••••••••••' : selectedEmployee.bankAccountNumber || 'N/A'} <br />
                            <span className="font-bold">IFSC:</span> {selectedEmployee.bankIfsc || 'N/A'} (Branch: {selectedEmployee.bankBranch || 'N/A'})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EMPLOYMENT DNA TAB */}
                {activeTab === 'dna' && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-slate-700 dark:text-slate-355">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Business Unit', val: getBUName(selectedEmployee.businessUnitId) },
                        { label: 'Division', val: getDivName(selectedEmployee.divisionId) },
                        { label: 'Department', val: getDeptName(selectedEmployee.departmentId) },
                        { label: 'Location', val: getLocName(selectedEmployee.locationId) },
                        { label: 'Designation', val: getDesigName(selectedEmployee.designationId) },
                        { label: 'Grade Level', val: getGradeName(selectedEmployee.gradeId) },
                        { label: 'Salary Band', val: getBandName(selectedEmployee.bandId) },
                        { label: 'Cost Center ID', val: selectedEmployee.costCenterId || 'CC-TECH-04' },
                        { label: 'Employment Type ID', val: selectedEmployee.employmentTypeId || 'FT-PERMANENT' },
                        { label: 'Work Mode', val: selectedEmployee.workMode || 'HYBRID' },
                        { label: 'Joining Date', val: selectedEmployee.dateOfJoining || 'Jan 15, 2024' },
                        { label: 'Manager UUID', val: selectedEmployee.managerId || 'None assigned' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-205 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-slate-202 mt-1.5">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SKILLS CLOUD TAB */}
                {activeTab === 'skills' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Assessed Skills Cloud</h3>
                      <button
                        onClick={() => setActiveModal('addSkill')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Competency Skill
                      </button>
                    </div>

                    {selectedEmployee.skills.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No skills competencies registered for this twin aggregate.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedEmployee.skills.map((skill: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-105 dark:border-slate-800 rounded-xl text-xs font-semibold">
                            <div>
                              <p className="font-extrabold text-slate-850 dark:text-white text-xs">{skill.skillName || skill.name}</p>
                              <span className="text-[9px] uppercase font-bold text-slate-455 block mt-1">{skill.skillCategory || skill.category || 'TECHNICAL'}</span>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Exp: {skill.yearsOfExperience || 3} Years • Rating: {skill.selfRating || 7}/10</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-755 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50">
                                {skill.proficiencyLevel || skill.level}
                              </span>
                              <button
                                onClick={() => removeSkill(idx)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. CERTIFICATIONS TAB */}
                {activeTab === 'certs' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider">Verification Certifications</h3>
                      <button
                        onClick={() => setActiveModal('addCert')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register Certification
                      </button>
                    </div>

                    {selectedEmployee.certifications.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-455 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No credentials registered on this twin profile.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedEmployee.certifications.map((cert: any, idx: number) => {
                          const isExpired = cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false;
                          const isExpiringSoon = cert.expiryDate
                            ? (new Date(cert.expiryDate).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000) && !isExpired
                            : false;
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl gap-4">
                              <div className="flex items-start gap-3 text-xs font-semibold">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-650 shrink-0">
                                  <Award className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-slate-850 dark:text-white text-xs">{cert.certificationName}</p>
                                  <p className="text-[10px] text-slate-450">Authority: {cert.issuingAuthority} • ID: {cert.credentialId || 'N/A'}</p>
                                  <p className="text-[10px] text-slate-400">Issue: {cert.issueDate || 'N/A'} • Expiry: {cert.expiryDate || 'Never'}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-4">
                                {isExpired && (
                                  <span className="flex items-center gap-1 text-rose-650 bg-rose-50 dark:bg-rose-955/20 px-2.5 py-0.5 rounded text-[9px] font-bold border border-rose-100 dark:border-transparent">
                                    <FileWarning className="w-3 h-3" /> Expired
                                  </span>
                                )}
                                {isExpiringSoon && (
                                  <span className="flex items-center gap-1 text-amber-650 bg-amber-50 dark:bg-amber-955/20 px-2.5 py-0.5 rounded text-[9px] font-bold border border-amber-100 dark:border-transparent">
                                    <ShieldAlert className="w-3 h-3" /> Expiring Soon
                                  </span>
                                )}
                                {!isExpired && !isExpiringSoon && (
                                  <span className="flex items-center gap-1 text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded text-[9px] font-bold border border-emerald-100 dark:border-transparent">
                                    <CheckCircle className="w-3 h-3" /> Verified Active
                                  </span>
                                )}

                                <button
                                  onClick={() => removeCert(idx)}
                                  className="text-slate-400 hover:text-rose-550 transition-colors p-1"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. DOCUMENT VAULT TAB */}
                {activeTab === 'docs' && (
                  <div className="space-y-6 animate-fade-in font-semibold text-slate-700 dark:text-slate-355">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider">Compliance Document Vault</h3>
                      <button
                        onClick={() => setActiveModal('addDoc')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Upload Document
                      </button>
                    </div>

                    {selectedEmployee.documents.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No compliance vault documents uploaded yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-600 shrink-0">
                                <FileText className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-855 dark:text-white text-xs">{doc.documentName || doc.name}</p>
                                <p className="text-[10px] text-slate-450 mt-0.5">{doc.documentType || doc.type} • {doc.mimeType || 'application/pdf'} • {(doc.fileSize / 1024 / 1024).toFixed(1)}MB</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-bold">
                              <span className="flex items-center gap-1 text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-transparent text-[10px]">
                                <CheckCircle className="w-3 h-3" /> {doc.verificationStatus || doc.status || 'PENDING'}
                              </span>
                              <span className="text-[10px] text-slate-450 hidden sm:inline">Expiry: {doc.expiryDate || doc.expiry || 'Never'}</span>
                              <button
                                onClick={() => removeDoc(idx)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. RELATIONSHIP GRAPH TAB */}
                {activeTab === 'relations' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Graph Relationship Network</h3>
                      <button
                        onClick={() => setActiveModal('addRelation')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Map Relationship Node
                      </button>
                    </div>

                    {/* Interactive Tree Graph visualization */}
                    <div className="bg-slate-50 dark:bg-slate-900/20 rounded-xl p-6 border border-slate-200/60 dark:border-slate-855 flex flex-col items-center justify-center space-y-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Workforce Reporting Lineage</p>

                      <div className="flex flex-col items-center w-full max-w-lg space-y-3">
                        {/* Department Head */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-center w-full max-w-[200px] shadow-sm">
                          <span className="text-[8px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded font-extrabold block mb-1">DEPARTMENT HEAD</span>
                          <p className="text-xs font-bold text-slate-850 dark:text-white truncate">
                            {getEmployeeNameById(selectedEmployee.departmentHeadId)}
                          </p>
                        </div>

                        {/* Line */}
                        <div className="w-0.5 h-3 bg-indigo-500" />

                        {/* Skip Manager */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-center w-full max-w-[200px] shadow-sm">
                          <span className="text-[8px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded font-extrabold block mb-1">SKIP MANAGER</span>
                          <p className="text-xs font-bold text-slate-850 dark:text-white truncate">
                            {getEmployeeNameById(selectedEmployee.skipManagerId)}
                          </p>
                        </div>

                        {/* Line */}
                        <div className="w-0.5 h-3 bg-indigo-500" />

                        {/* Reporting Manager */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-center w-full max-w-[200px] shadow-sm">
                          <span className="text-[8px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded font-extrabold block mb-1">REPORTING MANAGER</span>
                          <p className="text-xs font-bold text-slate-850 dark:text-white truncate">
                            {getEmployeeNameById(selectedEmployee.managerId)}
                          </p>
                        </div>

                        {/* Line */}
                        <div className="w-0.5 h-3 bg-indigo-500" />

                        {/* Current Employee Node */}
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 text-white p-3.5 rounded-xl text-center shadow-lg ring-4 ring-indigo-500/20 w-full max-w-[220px]">
                          <p className="text-xs font-extrabold truncate">{selectedEmployee.displayName}</p>
                          <p className="text-[9px] opacity-80 mt-1 uppercase font-bold truncate">{getDesigName(selectedEmployee.designationId)}</p>
                        </div>

                        {/* Line & Peer relationships */}
                        <div className="w-0.5 h-3 bg-indigo-500" />
                        <div className="w-full h-0.5 bg-indigo-500" />

                        <div className="grid grid-cols-3 gap-3 w-full pt-1.5">
                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-indigo-500" />
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-center w-full shadow-sm min-h-[45px] flex flex-col justify-center">
                              <span className="text-[8px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold block mb-1">HRBP</span>
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                {getEmployeeNameById(selectedEmployee.hrbpId)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-indigo-500" />
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-center w-full shadow-sm min-h-[45px] flex flex-col justify-center">
                              <span className="text-[8px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold block mb-1">BUDDY</span>
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                {getEmployeeNameById(selectedEmployee.buddyId)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-indigo-500" />
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-center w-full shadow-sm min-h-[45px] flex flex-col justify-center">
                              <span className="text-[8px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold block mb-1">MENTOR</span>
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                {getEmployeeNameById(selectedEmployee.mentorId)}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Listing of relationships */}
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All Relationship Edges</p>
                      {selectedEmployee.relationships.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-455 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          No relationship links registered.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          {selectedEmployee.relationships.map((rel: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-505 shrink-0">
                                  {getInitials(rel.name || 'Relation')}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-850 dark:text-white truncate">Target Employee ID</p>
                                  <p className="text-[10px] text-slate-405 truncate mt-0.5">{rel.relatedEmployeeId}</p>
                                  {rel.notes && <p className="text-[9px] text-indigo-505 mt-1 italic">"{rel.notes}"</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-755 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/30">
                                  {rel.relationshipType || rel.type}
                                </span>
                                <button
                                  onClick={() => removeRel(idx)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. TIMELINE LOG TAB */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Digital Twin Immutable Timeline</h3>

                    {selectedEmployee.timeline.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No lifecycle timeline entries recorded yet.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
                        {selectedEmployee.timeline.map((evt: any, idx: number) => {
                          let Icon = Clock;
                          if (evt.eventType === 'JOINING' || evt.eventType === 'JOINED') Icon = UserPlus;
                          else if (evt.eventType === 'PROMOTION') Icon = Award;
                          else if (evt.eventType === 'TRANSFER') Icon = MapPin;
                          else if (evt.eventType === 'TERMINATION') Icon = LogOut;
                          else if (evt.eventType === 'CERTIFICATION' || evt.eventType === 'DOCUMENT') Icon = FileText;

                          return (
                            <div key={idx} className="relative pl-7 text-xs font-semibold text-slate-655 dark:text-slate-350">
                              <div className="absolute -left-[15px] top-1.5 w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-indigo-550 flex items-center justify-center text-indigo-550 ring-4 ring-white dark:ring-[#0B0F19]">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold block">{evt.date || evt.eventDate || 'N/A'}</span>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">{evt.title}</h4>
                              <p className="text-xs text-slate-550 mt-1 leading-relaxed">{evt.description}</p>
                              {evt.triggeredBy && (
                                <span className="text-[9px] text-slate-400 font-semibold block mt-1">Triggered by: {evt.triggeredBy}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 9. AUDIT HISTORY TAB */}
                {activeTab === 'audit' && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold">
                    <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Platform Master Audit Logs</h3>

                    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/85 dark:border-slate-800 text-slate-400 uppercase text-[9px] font-bold">
                            <th className="p-3">Actor</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Changes Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350">
                          <tr>
                            <td className="p-3 font-bold">admin@managemytalenthive.com</td>
                            <td className="p-3 font-mono text-[10px]">2026-06-18 10:14:22</td>
                            <td className="p-3"><span className="text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded text-[10px]">UPDATE</span></td>
                            <td className="p-3">Modified contact details and emergency configurations.</td>
                          </tr>
                          {selectedEmployee.timeline.map((evt: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-3 font-bold">{evt.triggeredBy || 'system'}</td>
                              <td className="p-3 font-mono text-[10px]">{evt.date || evt.eventDate}</td>
                              <td className="p-3">
                                <span className="text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded text-[10px]">
                                  {evt.eventType || 'LIFECYCLE'}
                                </span>
                              </td>
                              <td className="p-3">{evt.title}: {evt.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 10. USER ACCOUNT TAB */}
                {activeTab === 'account' && (
                  <UserAccountTab
                    employeeId={selectedEmployee.id}
                    readOnly={currentUser?.role === 'ROLE_MANAGER'}
                  />
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── ACTION DIALOG MODALS ───────────────────────────── */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0C101B] border border-slate-202 dark:border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs font-semibold">

            {/* Transfer Modal */}
            {activeModal === 'transfer' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Transfer Employee Twin</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Department</label>
                    <select
                      value={transferDept}
                      onChange={e => setTransferDept(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Department</option>
                      {employeeDepts?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Location</label>
                    <select
                      value={transferLoc}
                      onChange={e => setTransferLoc(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Location</option>
                      {allLocations?.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitTransfer} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Apply Transfer</button>
                </div>
              </div>
            )}

            {/* Promote Modal */}
            {activeModal === 'promote' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Promote Employee</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Designation</label>
                    <select
                      value={promoteDesignation}
                      onChange={e => setPromoteDesignation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Designation</option>
                      {allDesignations?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Grade Level</label>
                    <select
                      value={promoteGrade}
                      onChange={e => setPromoteGrade(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Grade</option>
                      {allGrades?.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitPromotion} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Apply Promotion</button>
                </div>
              </div>
            )}

            {/* Change Manager Modal */}
            {activeModal === 'manager' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Re-assign Reporting Manager</h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Manager UUID</label>
                  <input
                    type="text"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={newManagerId}
                    onChange={e => setNewManagerId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none font-mono"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitChangeManager} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Reassign Manager</button>
                </div>
              </div>
            )}

            {/* Terminate Modal */}
            {activeModal === 'terminate' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white text-rose-500">Terminate Digital Twin</h3>
                <div className="space-y-3">
                  <div>
                    <DatePicker
                      label="Exit Effective Date"
                      value={terminateDate}
                      onChange={setTerminateDate}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reason for Termination</label>
                    <textarea
                      placeholder="Voluntary Resignation, Relocation, End of Contract..."
                      value={terminateReason}
                      onChange={e => setTerminateReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitTermination} className="bg-rose-650 hover:bg-rose-700 text-white px-4 py-2 rounded-lg">Submit Termination</button>
                </div>
              </div>
            )}

            {/* Archive Modal */}
            {activeModal === 'archive' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white text-amber-500">Archive Digital Twin</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reason for Archiving</label>
                    <textarea
                      placeholder="Redundancy, Voluntary Exit, Long Term Sabbatical..."
                      value={archiveReason}
                      onChange={e => setArchiveReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitArchive} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg">Submit Archive</button>
                </div>
              </div>
            )}

            {/* Bulk Archive Modal */}
            {activeModal === 'bulkArchive' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white text-amber-500">Bulk Archive Digital Twins</h3>
                <p className="text-xs text-slate-500">You are about to archive {selectedIds.length} employee twin profiles.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reason for Archiving</label>
                    <textarea
                      placeholder="Redundancy, End of Season Contract, Merger..."
                      value={bulkArchiveReason}
                      onChange={e => setBulkArchiveReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitBulkArchive} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg">Submit Bulk Archive</button>
                </div>
              </div>
            )}

            {/* Bulk Reassign Manager Modal */}
            {activeModal === 'bulkReassignManager' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Bulk Reassign Reporting Manager</h3>
                <p className="text-xs text-slate-500">You are about to reassign the manager for {selectedIds.length} employee twin profiles.</p>

                {bulkManagerError && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg p-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{bulkManagerError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Reporting Manager</label>
                    <select
                      value={bulkManagerId}
                      onChange={e => setBulkManagerId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Manager</option>
                      {employees
                        .filter(emp => emp.id && !selectedIds.includes(emp.id) && emp.employmentStatus !== 'TERMINATED')
                        .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.displayName} ({emp.employeeCode})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <DatePicker
                      label="Effective Date"
                      value={bulkManagerEffectiveDate}
                      onChange={setBulkManagerEffectiveDate}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reason for Reassignment</label>
                    <textarea
                      placeholder="Organization restructuring, Manager transfer..."
                      value={bulkManagerReason}
                      onChange={e => setBulkManagerReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal('none')}
                    disabled={isReassigning}
                    className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitBulkReassignManager}
                    disabled={isReassigning}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    {isReassigning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Reassigning...
                      </>
                    ) : (
                      'Apply Reassignment'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Terminate Modal */}
            {activeModal === 'bulkTerminate' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white text-rose-500">Bulk Terminate Digital Twins</h3>
                <p className="text-xs text-slate-500">You are about to terminate {selectedIds.length} employee twin profiles.</p>

                {bulkTerminateError && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg p-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{bulkTerminateError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <DatePicker
                      label="Termination Date"
                      value={bulkTerminateDate}
                      onChange={setBulkTerminateDate}
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="Final Working Day"
                      value={bulkFinalWorkingDay}
                      onChange={setBulkFinalWorkingDay}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reason for Termination</label>
                    <textarea
                      placeholder="Redundancy, Voluntary Resignation, End of Contract..."
                      value={bulkTerminateReason}
                      onChange={e => setBulkTerminateReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal('none')}
                    disabled={isTerminating}
                    className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitBulkTerminate}
                    disabled={isTerminating}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    {isTerminating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Terminating...
                      </>
                    ) : (
                      'Apply Terminations'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Identity Modal */}
            {activeModal === 'editIdentity' && (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Edit Personal & Identity Details</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">First Name</label>
                      <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Last Name</label>
                      <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <DatePicker value={editDOB} onChange={setEditDOB} label="Date of Birth" />
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Gender</label>
                      <select value={editGender} onChange={e => setEditGender(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none text-xs font-medium">
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Personal Email</label>
                      <input type="email" value={editPersonalEmail} onChange={e => setEditPersonalEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none font-mono text-xs" />
                    </div>
                    <PhoneInput
                      label="Work Phone"
                      value={editWorkPhone}
                      onChange={setEditWorkPhone}
                      error={editWorkPhoneError || undefined}
                      setError={setEditWorkPhoneError}
                    />
                    <div className="col-span-2">
                      <PhoneInput
                        label="Personal Phone"
                        value={editPersonalPhone}
                        onChange={setEditPersonalPhone}
                        error={editPersonalPhoneError || undefined}
                        setError={setEditPersonalPhoneError}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Emergency Contact</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block mb-1">Contact Name</label>
                        <input type="text" value={editEmergencyName} onChange={e => setEditEmergencyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block mb-1">Relation</label>
                        <input type="text" value={editEmergencyRelation} onChange={e => setEditEmergencyRelation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none text-xs" />
                      </div>
                      <div className="col-span-2">
                        <PhoneInput
                          label="Contact Phone"
                          value={editEmergencyPhone}
                          onChange={setEditEmergencyPhone}
                          error={editEmergencyPhoneError || undefined}
                          setError={setEditEmergencyPhoneError}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Address History</p>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Current Address</label>
                      <textarea value={editCurrentAddress} onChange={e => setEditCurrentAddress(e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitEditIdentity} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Save Profile</button>
                </div>
              </div>
            )}

            {/* Add Skill Modal */}
            {activeModal === 'addSkill' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Add Skill to Cloud</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Skill Name</label>
                    <input type="text" placeholder="Docker, Python, Kubernetes" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Category</label>
                    <select value={newSkillCategory} onChange={e => setNewSkillCategory(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="TECHNICAL">Technical</option>
                      <option value="FUNCTIONAL">Functional</option>
                      <option value="SOFT">Soft Skills</option>
                      <option value="LANGUAGE">Languages</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Proficiency Level</label>
                    <select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddSkill} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Add Skill</button>
                </div>
              </div>
            )}

            {/* Add Certification Modal */}
            {activeModal === 'addCert' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#000] dark:text-[#fff]">Register Certification</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Certification Name</label>
                    <input type="text" placeholder="AWS Certified Solutions Architect" value={newCertName} onChange={e => setNewCertName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Issuing Authority</label>
                    <input type="text" placeholder="Amazon Web Services" value={newCertAuthority} onChange={e => setNewCertAuthority(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <DatePicker
                      label="Expiry Date"
                      value={newCertExpiryDate}
                      onChange={setNewCertExpiryDate}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddCert} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Register</button>
                </div>
              </div>
            )}

            {/* Add Document Modal */}
            {activeModal === 'addDoc' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Upload Compliance Document</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Document Filename</label>
                    <input type="text" placeholder="pan_card.pdf" value={newDocName} onChange={e => setNewDocName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Document Category</label>
                    <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="IDENTITY">Identity Verification</option>
                      <option value="EDUCATION">Education Degree</option>
                      <option value="PREVIOUS_EMPLOYMENT">Previous Employment Certificate</option>
                      <option value="COMPLIANCE">Compliance Signature</option>
                      <option value="MEDICAL">Medical Certificate</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddDoc} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Upload Vault</button>
                </div>
              </div>
            )}

            {/* Add Relationship Modal */}
            {activeModal === 'addRelation' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#000] dark:text-[#fff]">Map Relationship Node</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Relationship Type</label>
                    <select value={newRelType} onChange={e => setNewRelType(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="BUDDY">Buddy</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="HRBP">HRBP</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="DOTTED_LINE_MANAGER">Dotted Line Manager</option>
                      <option value="SKIP_LEVEL_MANAGER">Skip Level Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Related Employee ID (UUID)</label>
                    <input type="text" placeholder="00000000-0000-0000-0000-000000000000" value={newRelEmpId} onChange={e => setNewRelEmpId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Notes</label>
                    <input type="text" placeholder="Onboarding Buddy for tech operations" value={newRelNotes} onChange={e => setNewRelNotes(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-255 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddRelation} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Map Edge</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
