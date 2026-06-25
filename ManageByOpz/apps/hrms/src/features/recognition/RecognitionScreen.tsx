import React, { useState, useEffect } from 'react';
import { 
  Award, Sparkles, Send, Trophy, Plus, MessageSquare, ThumbsUp, Heart, Shield, 
  Users, Search, Filter, History, Trash2, Calendar, Target, ShoppingBag, 
  BarChart3, Settings, ClipboardList, HelpCircle, Gift, Star, Eye, Zap
} from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import {
  useGetValuesQuery,
  useCreateValueMutation,
  useGetTypesQuery,
  useCreateTypeMutation,
  useGetWalletQuery,
  useGiveRecognitionMutation,
  useGetFeedQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useToggleReactionMutation,
  useGetCatalogQuery,
  useCreateCatalogItemMutation,
  useRedeemPointsMutation,
  useGetRedemptionsQuery,
  useUpdateRedemptionStatusMutation,
  useGetAwardProgramsQuery,
  useCreateAwardProgramMutation,
  useNominateEmployeeMutation,
  useGetNominationsByProgramQuery,
  useVoteNominationMutation,
  useApproveNominationMutation,
  useGetLeaderboardQuery,
  useGetAnalyticsQuery,
  useGetAiInsightsQuery,
  useGetHealthReportMutation,
  useProvisionMissingWalletsMutation,
  type RecognitionValue,
  type RecognitionType,
  type Recognition,
  type RewardCatalog,
  type AwardProgram
} from './recognitionApi';

export function RecognitionScreen() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const userRole = useAppSelector((state) => state.auth.role);

  // Tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'give' | 'my' | 'awards' | 'leaderboard' | 'marketplace' | 'analytics' | 'admin' | 'audit' | 'health'>('feed');

  // Queries
  const { data: employees = [] } = useGetEmployeesQuery(undefined);
  const currentEmployee = employees.find(e => e.workEmail?.toLowerCase() === currentUser?.email?.toLowerCase()) || employees[0];
  const employeeId = currentEmployee?.id || '';

  const { data: values = [], refetch: refetchValues, isLoading: isLoadingValues } = useGetValuesQuery();
  const { data: types = [], refetch: refetchTypes, isLoading: isLoadingTypes } = useGetTypesQuery();
  const { data: wallet, refetch: refetchWallet } = useGetWalletQuery(employeeId, { skip: !employeeId });
  const { data: feed = [], refetch: refetchFeed } = useGetFeedQuery();
  const { data: catalog = [], refetch: refetchCatalog } = useGetCatalogQuery();
  const { data: redemptions = [], refetch: refetchRedemptions } = useGetRedemptionsQuery(employeeId, { skip: !employeeId });
  const { data: allRedemptions = [], refetch: refetchAllRedemptions } = useGetRedemptionsQuery(undefined);
  const { data: programs = [], refetch: refetchPrograms } = useGetAwardProgramsQuery();
  const { data: leaderboard = [] } = useGetLeaderboardQuery();
  const { data: analytics } = useGetAnalyticsQuery();
  const { data: aiInsights } = useGetAiInsightsQuery();

  // Mutations
  const [giveRecognition] = useGiveRecognitionMutation();
  const [addComment] = useAddCommentMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [redeemPoints] = useRedeemPointsMutation();
  const [createValue] = useCreateValueMutation();
  const [createType] = useCreateTypeMutation();
  const [createCatalogItem] = useCreateCatalogItemMutation();
  const [createAwardProgram] = useCreateAwardProgramMutation();
  const [nominateEmployee] = useNominateEmployeeMutation();
  const [voteNomination] = useVoteNominationMutation();
  const [approveNomination] = useApproveNominationMutation();
  const [updateRedemptionStatus] = useUpdateRedemptionStatusMutation();

  // Health report & Provisioning hooks
  const [getHealthReport, { isLoading: isHealthLoading }] = useGetHealthReportMutation();
  const [provisionMissingWallets, { isLoading: isProvisioning }] = useProvisionMissingWalletsMutation();

  // Local state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [healthReport, setHealthReport] = useState<any>(null);

  // Configuration check helper
  const isConfigMissing = !isLoadingValues && !isLoadingTypes && (values.length === 0 || types.length === 0);

  const handleFetchHealthReport = async () => {
    try {
      const ids = employees.map(e => e.id).filter((id): id is string => !!id);
      const res = await getHealthReport(ids).unwrap();
      setHealthReport(res);
    } catch (e) {
      console.error("Failed to fetch health report", e);
    }
  };

  const handleProvisionWallets = async () => {
    try {
      const ids = employees.map(e => e.id).filter((id): id is string => !!id);
      await provisionMissingWallets(ids).unwrap();
      setSuccessMessage("Missing wallets provisioned successfully!");
      handleFetchHealthReport();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      console.error("Failed to provision wallets", e);
      setErrorMessage("Failed to provision wallets.");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  useEffect(() => {
    if (activeTab === 'health' && employees.length > 0) {
      handleFetchHealthReport();
    }
  }, [activeTab, employees]);

  useEffect(() => {
    if (isConfigMissing) {
      setErrorMessage("No recognition configuration found. Contact administrator.");
    } else if (errorMessage === "No recognition configuration found. Contact administrator.") {
      setErrorMessage("");
    }
  }, [isConfigMissing]);
  
  // Give Rec State
  const [giveRecForm, setGiveRecForm] = useState({
    receiverEmployeeId: '',
    recognitionValueId: '',
    recognitionTypeId: '',
    title: '',
    message: '',
    points: 50,
    visibility: 'PUBLIC',
    tags: '',
    projectRef: '',
    businessImpact: ''
  });

  // Nominate state
  const [nominateForm, setNominateForm] = useState({
    programId: '',
    nomineeEmployeeId: '',
    reason: '',
    evidenceUrl: ''
  });

  // Admin Setup States
  const [newVal, setNewVal] = useState({ name: '', code: '', description: '', icon: 'Sparkles', color: 'indigo', weight: 1.0 });
  const [newType, setNewType] = useState({ name: '', code: '', description: '', defaultPoints: 50, visibilityRules: 'PUBLIC', approvalRules: 'NONE', badgeMapping: 'Team Player' });
  const [newReward, setNewReward] = useState({ name: '', description: '', cost: 100, inventory: 99, country: 'ALL', category: 'GIFT_CARD', taxApplicable: false });
  const [newProgram, setNewProgram] = useState({ name: '', description: '', category: 'MONTHLY' as const, budgetLimit: 500 });

  // Social commenting state
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Selected program for nominations view
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const { data: programNominations = [] } = useGetNominationsByProgramQuery(selectedProgramId, { skip: !selectedProgramId });

  // Marketplace redemption modal
  const [selectedReward, setSelectedReward] = useState<RewardCatalog | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState('');

  // AI assistant suggestion usage
  const handleApplyAiSuggestion = () => {
    if (aiInsights) {
      const recEmp = employees.find(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes('sarah'));
      const val = values[0];
      const typ = types[0];
      setGiveRecForm({
        ...giveRecForm,
        receiverEmployeeId: recEmp?.id || '',
        recognitionValueId: val?.id || '',
        recognitionTypeId: typ?.id || '',
        title: 'Outstanding Technical Contribution',
        message: aiInsights.suggestedMessage || '',
        points: 100
      });
      setSuccessMessage('AI recommendation applied successfully! Feel free to customize.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleGiveRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giveRecForm.receiverEmployeeId) {
      setErrorMessage('Please select a colleague to recognize.');
      return;
    }
    try {
      await giveRecognition({
        giverEmployeeId: employeeId,
        receiverEmployeeId: giveRecForm.receiverEmployeeId,
        recognitionValueId: giveRecForm.recognitionValueId || undefined,
        recognitionTypeId: giveRecForm.recognitionTypeId || undefined,
        title: giveRecForm.title,
        message: giveRecForm.message,
        points: Number(giveRecForm.points),
        visibility: giveRecForm.visibility as any,
        tags: giveRecForm.tags,
        projectRef: giveRecForm.projectRef,
        businessImpact: giveRecForm.businessImpact
      }).unwrap();

      setSuccessMessage('Recognition successfully granted!');
      refetchWallet();
      refetchFeed();
      setActiveTab('feed');
      setGiveRecForm({
        receiverEmployeeId: '',
        recognitionValueId: '',
        recognitionTypeId: '',
        title: '',
        message: '',
        points: 50,
        visibility: 'PUBLIC',
        tags: '',
        projectRef: '',
        businessImpact: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Failed to gift recognition.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward) return;
    try {
      await redeemPoints({
        employeeId,
        rewardId: selectedReward.id || '',
        deliveryDetails
      }).unwrap();

      setSuccessMessage(`Successfully redeemed ${selectedReward.name}! Check your transactions/email.`);
      refetchWallet();
      refetchRedemptions();
      setSelectedReward(null);
      setDeliveryDetails('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Redemption failed.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleNominationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await nominateEmployee({
        programId: nominateForm.programId,
        nomineeEmployeeId: nominateForm.nomineeEmployeeId,
        nominatorEmployeeId: employeeId,
        reason: nominateForm.reason,
        evidenceUrl: nominateForm.evidenceUrl
      }).unwrap();

      setSuccessMessage('Employee successfully nominated!');
      setNominateForm({ programId: '', nomineeEmployeeId: '', reason: '', evidenceUrl: '' });
      refetchPrograms();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Nomination failed.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Helper resolvers
  const getEmpName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Colleague';
  };

  const getValName = (id: string) => {
    return values.find(v => v.id === id)?.name || 'General Contribution';
  };

  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN' || userRole === 'ROLE_ULTRA_SUPER_ADMIN';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-15 translate-x-1/4 -translate-y-1/4">
          <Trophy className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-pink-100">
              <Sparkles className="w-3.5 h-3.5" /> Experience & Appreciation Engine
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Accolades & Peer Recognition</h1>
            <p className="text-sm text-indigo-100 max-w-2xl">
              Grounded in organization core values. Appreciate achievements, earn culture badges, and redeem marketplace rewards.
            </p>
          </div>
          
          {/* Wallet Mini Widget */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/25 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-indigo-900 flex items-center justify-center font-black text-lg shadow-md">
              <Gift className="w-6 h-6 text-indigo-950" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">Wallet Balance</p>
              <p className="text-2xl font-black text-amber-300">{wallet?.currentBalance ?? 0} <span className="text-xs text-white">pts</span></p>
              <p className="text-[9px] text-indigo-100 mt-0.5">Budget remaining: {wallet?.remaining ?? 0} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}
      {isConfigMissing ? (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-400 rounded-2xl border border-amber-250/30 dark:border-amber-900/30 flex items-start gap-4 shadow-sm animate-pulse-slow">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold uppercase tracking-wide">System Configuration Gaps</h3>
            <p className="text-xs leading-relaxed text-amber-800/80 dark:text-amber-450">
              No recognition configuration found. Contact administrator.
            </p>
          </div>
        </div>
      ) : (
        errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
            <Shield className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
        )
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-surface-200 dark:border-surface-800 gap-1 scrollbar-none">
        {[
          { id: 'feed', label: 'Recognition Feed', icon: MessageSquare },
          { id: 'give', label: 'Give Recognition', icon: Send },
          { id: 'my', label: 'My Accolades', icon: History },
          { id: 'awards', label: 'Awards & Nominations', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboards', icon: Target },
          { id: 'marketplace', label: 'Rewards Marketplace', icon: ShoppingBag },
          { id: 'analytics', label: 'Culture Analytics', icon: BarChart3 },
          { id: 'health', label: 'Health Report', icon: Shield, adminOnly: true },
          { id: 'admin', label: 'Settings & Budgets', icon: Settings, adminOnly: true },
          { id: 'audit', label: 'Compliance Audit', icon: ClipboardList, adminOnly: true }
        ].map(tab => {
          if (tab.adminOnly && !isAdmin) return null;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'border-transparent text-surface-500 hover:text-surface-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. SOCIAL RECOGNITION FEED */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            
            {/* Quick AI Assist suggestion banner */}
            {aiInsights && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-surface-900 dark:text-white">AI Recognition Copilot</h4>
                    <p className="text-[10px] text-surface-450 mt-0.5">We suggest recognizing Sarah Johnson for modular architecture.</p>
                  </div>
                </div>
                <button
                  onClick={handleApplyAiSuggestion}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all shadow-sm"
                >
                  Write Suggestion
                </button>
              </div>
            )}

            {/* List of Recognitions */}
            {feed.length === 0 ? (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-12 text-center border border-surface-200 dark:border-surface-800">
                <Heart className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <h3 className="font-bold text-surface-700 dark:text-white">No appreciation posts yet</h3>
                <p className="text-xs text-surface-400 mt-1 max-w-sm mx-auto">Be the culture starter! Recognize a colleague using the 'Give Recognition' tab.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feed.map((rec) => (
                  <div key={rec.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
                    
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                          {getEmpName(rec.giverEmployeeId)[0]}
                        </div>
                        <div>
                          <p className="text-xs text-surface-900 dark:text-white">
                            <span className="font-extrabold">{getEmpName(rec.giverEmployeeId)}</span>
                            <span className="text-surface-450 mx-1">appreciated</span>
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{getEmpName(rec.receiverEmployeeId)}</span>
                          </p>
                          <p className="text-[10px] text-surface-400 font-semibold mt-0.5">
                            {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Just now'} • {rec.visibility}
                          </p>
                        </div>
                      </div>
                      <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> +{rec.points} pts
                      </span>
                    </div>

                    {/* Content Card */}
                    <div className="bg-surface-50 dark:bg-surface-900/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <h4 className="font-extrabold text-sm text-surface-900 dark:text-white">{rec.title}</h4>
                      </div>
                      <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed italic">
                        "{rec.message}"
                      </p>
                      
                      {/* Metadata row */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[9px] uppercase font-extrabold tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                          💎 {getValName(rec.recognitionValueId || '')}
                        </span>
                        {rec.tags && rec.tags.split(',').map((tag, idx) => (
                          <span key={idx} className="text-[9px] uppercase font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                            #{tag.trim()}
                          </span>
                        ))}
                        {rec.projectRef && (
                          <span className="text-[9px] font-bold text-surface-450 px-2 py-0.5 border border-surface-200 dark:border-surface-700 rounded-full">
                            Proj: {rec.projectRef}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Social engagement buttons */}
                    <div className="flex items-center justify-between border-t border-surface-100 dark:border-surface-700/50 pt-3">
                      <div className="flex gap-4 text-xs font-bold text-surface-500">
                        <button 
                          onClick={() => toggleReaction({ id: rec.id || '', body: { employeeId, reactionType: 'LIKE' } })}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" /> Like
                        </button>
                        <button 
                          onClick={() => toggleReaction({ id: rec.id || '', body: { employeeId, reactionType: 'APPLAUD' } })}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <Award className="w-4 h-4 text-amber-500" /> Applaud
                        </button>
                        <button 
                          onClick={() => {
                            setActiveCommentId(activeCommentId === rec.id ? null : (rec.id || null));
                          }}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" /> Comment
                        </button>
                      </div>
                    </div>

                    {/* Comment Box */}
                    {activeCommentId === rec.id && (
                      <div className="space-y-4 pt-3 border-t border-surface-100 dark:border-surface-750/30">
                        {/* Send comments form */}
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!commentText.trim()) return;
                            await addComment({ id: rec.id || '', body: { employeeId, commentText } });
                            setCommentText('');
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            required
                            placeholder="Add a congratulatory comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-800 dark:text-surface-200"
                          />
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            Post
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar widgets */}
          <div className="space-y-6">
            
            {/* Value spotlight */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 space-y-4">
              <h3 className="text-sm font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Organization Values
              </h3>
              <div className="space-y-3">
                {values.map(val => (
                  <div key={val.id} className="p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-750/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">{val.name}</p>
                      <p className="text-[9px] text-surface-400 mt-0.5">{val.description}</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                      x{val.weight} weight
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. GIVE RECOGNITION */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'give' && (
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 max-w-2xl mx-auto shadow-sm">
          <h2 className="text-lg font-extrabold text-surface-900 dark:text-white mb-2">Appreciate Your Peers</h2>
          <p className="text-xs text-surface-450 mb-6">Gift points and reward excellence to celebrate teamwork across departments.</p>

          <form onSubmit={handleGiveRecSubmit} className="space-y-4">
            
            {/* Colleague selection */}
            <div>
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Select Colleague</label>
              <select
                value={giveRecForm.receiverEmployeeId}
                onChange={e => setGiveRecForm({ ...giveRecForm, receiverEmployeeId: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-850 dark:text-surface-150 font-bold"
              >
                <option value="">-- Choose Colleague --</option>
                {employees.map(emp => {
                  if (emp.id === employeeId) return null;
                  return <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.workEmail})</option>;
                })}
              </select>
            </div>

            {/* Core Values mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Core Value Mapping</label>
                <select
                  value={giveRecForm.recognitionValueId}
                  onChange={e => setGiveRecForm({ ...giveRecForm, recognitionValueId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-800 dark:text-surface-200"
                >
                  <option value="">-- Select Company Value --</option>
                  {values.map(val => (
                    <option key={val.id} value={val.id}>{val.name}</option>
                  ))}
                </select>
              </div>

              {/* Recognition Type */}
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Recognition Type</label>
                <select
                  value={giveRecForm.recognitionTypeId}
                  onChange={e => {
                    const selected = types.find(t => t.id === e.target.value);
                    setGiveRecForm({
                      ...giveRecForm,
                      recognitionTypeId: e.target.value,
                      points: selected?.defaultPoints || 50
                    });
                  }}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-800 dark:text-surface-200"
                >
                  <option value="">-- Select Type --</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (default: {t.defaultPoints} pts)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Points to Gift */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Points To Gift</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={500}
                  value={giveRecForm.points}
                  onChange={e => setGiveRecForm({ ...giveRecForm, points: Number(e.target.value) })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-850 dark:text-surface-150 font-bold"
                />
              </div>

              {/* Visibility Options */}
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Visibility Setting</label>
                <select
                  value={giveRecForm.visibility}
                  onChange={e => setGiveRecForm({ ...giveRecForm, visibility: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-800 dark:text-surface-200"
                >
                  <option value="PUBLIC">Public Feed</option>
                  <option value="TEAM">Department Only</option>
                  <option value="PRIVATE">Private (Recipient Only)</option>
                </select>
              </div>
            </div>

            {/* Title & message */}
            <div>
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Appreciation Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Above and beyond support on DB outage"
                value={giveRecForm.title}
                onChange={e => setGiveRecForm({ ...giveRecForm, title: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-800 dark:text-surface-200 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Description Message</label>
              <textarea
                required
                rows={4}
                placeholder="Detail what they accomplished and why it helped..."
                value={giveRecForm.message}
                onChange={e => setGiveRecForm({ ...giveRecForm, message: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-surface-800 dark:text-surface-200"
              />
            </div>

            {/* Metadata references */}
            <div className="border-t border-surface-100 dark:border-surface-700/50 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-surface-700 dark:text-white uppercase tracking-wider">Extended Context (Optional)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-surface-450 uppercase">Project Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. ERP Migrate Phase 2"
                    value={giveRecForm.projectRef}
                    onChange={e => setGiveRecForm({ ...giveRecForm, projectRef: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-450 uppercase">Hash Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. teamwork, excellence"
                    value={giveRecForm.tags}
                    onChange={e => setGiveRecForm({ ...giveRecForm, tags: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-surface-450 uppercase">Business Impact Statement</label>
                <textarea
                  rows={2}
                  placeholder="How did this action affect clients or business delivery?"
                  value={giveRecForm.businessImpact}
                  onChange={e => setGiveRecForm({ ...giveRecForm, businessImpact: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-surface-100 dark:border-surface-700/50">
              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className="flex-1 py-2.5 border border-surface-200 dark:border-surface-700 text-sm font-bold text-surface-650 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-900 transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Grant Accolade
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. MY RECOGNITIONS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sent column */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 space-y-4">
              <h3 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" /> Appreciation Given
              </h3>
              <div className="space-y-4">
                {feed.filter(r => r.giverEmployeeId === employeeId).length === 0 ? (
                  <p className="text-xs text-surface-400 text-center py-6">You haven't appreciated anyone yet this month.</p>
                ) : (
                  feed.filter(r => r.giverEmployeeId === employeeId).map(rec => (
                    <div key={rec.id} className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-750/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-surface-900 dark:text-white">To: {getEmpName(rec.receiverEmployeeId)}</p>
                        <span className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                          +{rec.points} pts
                        </span>
                      </div>
                      <p className="text-xs text-surface-650 dark:text-surface-300 font-semibold">{rec.title}</p>
                      <p className="text-[11px] text-surface-500">"{rec.message}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Received column */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 space-y-4">
              <h3 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-650" /> Appreciation Received
              </h3>
              <div className="space-y-4">
                {feed.filter(r => r.receiverEmployeeId === employeeId).length === 0 ? (
                  <p className="text-xs text-surface-400 text-center py-6">No peer accolades received yet. Keep up the good work!</p>
                ) : (
                  feed.filter(r => r.receiverEmployeeId === employeeId).map(rec => (
                    <div key={rec.id} className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-750/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-surface-900 dark:text-white">From: {getEmpName(rec.giverEmployeeId)}</p>
                        <span className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                          +{rec.points} pts
                        </span>
                      </div>
                      <p className="text-xs text-surface-650 dark:text-surface-300 font-semibold">{rec.title}</p>
                      <p className="text-[11px] text-surface-500">"{rec.message}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 4. AWARDS & NOMINATIONS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'awards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Nominations Form */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Nominate Colleague
            </h3>
            <p className="text-xs text-surface-450">Submit candidate profiles for the next Employee of the Month/Quarter program review.</p>

            <form onSubmit={handleNominationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase">Award Program</label>
                <select
                  value={nominateForm.programId}
                  onChange={e => {
                    setNominateForm({ ...nominateForm, programId: e.target.value });
                    setSelectedProgramId(e.target.value);
                  }}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Choose Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-surface-500 uppercase">Nominee Colleague</label>
                <select
                  value={nominateForm.nomineeEmployeeId}
                  onChange={e => setNominateForm({ ...nominateForm, nomineeEmployeeId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Choose Nominee --</option>
                  {employees.map(emp => {
                    if (emp.id === employeeId) return null;
                    return <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-surface-500 uppercase">Justification & Evidence</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline key metrics, projects, and client testimonials supporting this nomination..."
                  value={nominateForm.reason}
                  onChange={e => setNominateForm({ ...nominateForm, reason: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-surface-500 uppercase font-semibold">Evidence Link (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Jira dashboard, report link"
                  value={nominateForm.evidenceUrl}
                  onChange={e => setNominateForm({ ...nominateForm, evidenceUrl: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-xs"
              >
                Submit Nomination
              </button>
            </form>
          </div>

          {/* Active Nominations List */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-700 pb-3">
              <h3 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Active Nominee Ballot
              </h3>
              <select
                value={selectedProgramId}
                onChange={e => setSelectedProgramId(e.target.value)}
                className="px-2.5 py-1 bg-surface-50 dark:bg-surface-900 border border-surface-250 dark:border-surface-700 rounded-lg text-xs font-bold"
              >
                <option value="">-- Choose Program View --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedProgramId === '' ? (
              <p className="text-xs text-surface-450 py-12 text-center">Select an award program to view candidates and cast votes.</p>
            ) : programNominations.length === 0 ? (
              <p className="text-xs text-surface-450 py-12 text-center">No nominees registered in this program yet.</p>
            ) : (
              <div className="space-y-4">
                {programNominations.map(nom => (
                  <div key={nom.id} className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-150 dark:border-surface-800 flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <p className="text-xs font-extrabold text-surface-900 dark:text-white">Nominee: {getEmpName(nom.nomineeEmployeeId)}</p>
                      </div>
                      <p className="text-[10px] text-surface-450">Nominator: {getEmpName(nom.nominatorEmployeeId)} • Status: <span className="uppercase font-bold text-indigo-650">{nom.status}</span></p>
                      <p className="text-xs text-surface-650 dark:text-surface-300 italic pt-1">"{nom.reason}"</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          await voteNomination(nom.id || '');
                          refetchPrograms();
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all flex items-center gap-1 shrink-0"
                      >
                        👍 Vote ({nom.voteCount ?? 0})
                      </button>
                      {isAdmin && nom.status === 'PENDING' && (
                        <button
                          onClick={async () => {
                            await approveNomination(nom.id || '');
                            refetchPrograms();
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-xl text-[9px] font-bold"
                        >
                          Approve Winner
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 5. LEADERBOARD */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-extrabold text-surface-900 dark:text-white flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Culture Champions
            </h2>
            <p className="text-xs text-surface-450">Top recognized employees based on points received from peer appreciations.</p>
          </div>

          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-surface-450 py-12 text-center">No points calculated for current leaderboard period.</p>
            ) : (
              leaderboard.map((champ, index) => (
                <div key={champ.employeeId} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors border border-transparent hover:border-surface-200 dark:hover:border-surface-850">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-350 text-slate-800' : 'bg-amber-700 text-amber-50'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">{getEmpName(champ.employeeId)}</p>
                      <p className="text-[9px] text-surface-400 font-semibold uppercase">Performance Champion</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-indigo-650 dark:text-indigo-400">
                    {champ.points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 6. REWARDS MARKETPLACE */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map(item => (
              <div key={item.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-5 space-y-3">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-surface-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-surface-550 dark:text-surface-400 leading-relaxed">{item.description}</p>
                </div>
                <div className="p-5 border-t border-surface-100 dark:border-surface-750/30 flex items-center justify-between gap-4">
                  <span className="text-sm font-extrabold text-amber-550">{item.cost} pts</span>
                  <button
                    onClick={() => setSelectedReward(item)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Redemption Modal */}
          {selectedReward && (
            <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-md p-6 shadow-2xl animate-fade-in space-y-4">
                <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750/30 pb-3">
                  <h3 className="text-sm font-extrabold text-surface-900 dark:text-white">Redeem Culture Reward</h3>
                  <button onClick={() => setSelectedReward(null)} className="text-lg text-surface-450">&times;</button>
                </div>

                <div className="p-4 bg-surface-50 dark:bg-surface-900 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-surface-900 dark:text-white">{selectedReward.name}</p>
                  <p className="text-[11px] text-surface-500">{selectedReward.description}</p>
                  <p className="text-xs font-bold text-amber-600 pt-1">Cost: {selectedReward.cost} pts</p>
                </div>

                <form onSubmit={handleRedeemSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-surface-500 uppercase">Delivery & Fulfillment Details</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please specify delivery address, email, or contact number for fulfillment..."
                      value={deliveryDetails}
                      onChange={e => setDeliveryDetails(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedReward(null)}
                      className="flex-1 py-2 border border-surface-200 dark:border-surface-750/30 text-xs font-bold text-surface-500 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                    >
                      Confirm Redemption
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 7. CULTURE ANALYTICS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 text-center">
              <p className="text-[10px] uppercase font-bold text-surface-450">Total Recognitions Given</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{analytics?.totalRecognitions ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 text-center">
              <p className="text-[10px] uppercase font-bold text-surface-450">Total Points Awarded</p>
              <p className="text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-2">{analytics?.totalPointsGranted ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 text-center">
              <p className="text-[10px] uppercase font-bold text-surface-450">Total Redemptions</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{analytics?.totalRedemptions ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 text-center">
              <p className="text-[10px] uppercase font-bold text-surface-450">Points Redeemed</p>
              <p className="text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-2">{analytics?.totalPointsRedeemed ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 8. ADMINISTRATION PANEL */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Create Company Core Value */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-surface-900 dark:text-white uppercase tracking-wider">Configure company core value</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await createValue(newVal);
                  setNewVal({ name: '', code: '', description: '', icon: 'Sparkles', color: 'indigo', weight: 1.0 });
                  refetchValues();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-surface-450 uppercase">Value Name</label>
                    <input
                      type="text" required placeholder="e.g. Respect"
                      value={newVal.name}
                      onChange={e => setNewVal({ ...newVal, name: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-450 uppercase">Code key</label>
                    <input
                      type="text" required placeholder="e.g. RESPECT"
                      value={newVal.code}
                      onChange={e => setNewVal({ ...newVal, code: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-450 uppercase">Description</label>
                  <input
                    type="text" required placeholder="Describe corporate philosophy..."
                    value={newVal.description}
                    onChange={e => setNewVal({ ...newVal, description: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold">
                  Create Value
                </button>
              </form>
            </div>

            {/* Create Reward Catalog item */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-surface-900 dark:text-white uppercase tracking-wider">Add Marketplace Reward Item</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await createCatalogItem(newReward);
                  setNewReward({ name: '', description: '', cost: 100, inventory: 99, country: 'ALL', category: 'GIFT_CARD', taxApplicable: false });
                  refetchCatalog();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-surface-450 uppercase">Reward Name</label>
                    <input
                      type="text" required placeholder="Amazon Gift Voucher"
                      value={newReward.name}
                      onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-450 uppercase">Points Cost</label>
                    <input
                      type="number" required
                      value={newReward.cost}
                      onChange={e => setNewReward({ ...newReward, cost: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-450 uppercase">Fulfillment / Description</label>
                  <input
                    type="text" required placeholder="Details on coupon delivery..."
                    value={newReward.description}
                    onChange={e => setNewReward({ ...newReward, description: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold">
                  Publish Reward Item
                </button>
              </form>
            </div>

            {/* Create Award Program */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-surface-900 dark:text-white uppercase tracking-wider">Initialize Award Program</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await createAwardProgram(newProgram);
                  setNewProgram({ name: '', description: '', category: 'MONTHLY', budgetLimit: 500 });
                  refetchPrograms();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-surface-450 uppercase">Program Name</label>
                    <input
                      type="text" required placeholder="Employee of the Year"
                      value={newProgram.name}
                      onChange={e => setNewProgram({ ...newProgram, name: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-450 uppercase">Category</label>
                    <select
                      value={newProgram.category}
                      onChange={e => setNewProgram({ ...newProgram, category: e.target.value as any })}
                      className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="SPECIAL">Special</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-450 uppercase">Description</label>
                  <input
                    type="text" required placeholder="Guidelines and nominee rules..."
                    value={newProgram.description}
                    onChange={e => setNewProgram({ ...newProgram, description: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold">
                  Start Program
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 9. COMPLIANCE AUDIT */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && isAdmin && (
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" /> Redemption & points audit log
          </h3>
          <p className="text-xs text-surface-450">Comprehensive audit trail of employee item redemptions and points transactions.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 font-bold text-surface-500">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Employee</th>
                  <th className="py-2.5">Reward Cost</th>
                  <th className="py-2.5">Fulfillment Details</th>
                  <th className="py-2.5">Redemption Status</th>
                  <th className="py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allRedemptions.map(r => (
                  <tr key={r.id} className="border-b border-surface-100 dark:border-surface-750/30">
                    <td className="py-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Just now'}</td>
                    <td className="py-3 font-bold">{getEmpName(r.employeeId)}</td>
                    <td className="py-3">{r.pointsUsed} pts</td>
                    <td className="py-3 max-w-xs truncate">{r.deliveryDetails}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'FULFILLED' || r.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {r.status === 'PENDING' && (
                        <button
                          onClick={async () => {
                            await updateRedemptionStatus({ id: r.id || '', status: 'FULFILLED', trackingNumber: 'TRK-' + Date.now() });
                            refetchAllRedemptions();
                          }}
                          className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────── */}
      {/* 10. HEALTH REPORT DIAGNOSTICS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'health' && isAdmin && (
        <div className="space-y-6">
          {/* Main Diagnostic Header card */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-650 animate-pulse" /> Recognition Health & Alignment Diagnostics
                </h3>
                <p className="text-xs text-surface-450">
                  Real-time status check of tenant configuration, API routing, and point wallet provisioning coverage.
                </p>
              </div>
              <button
                onClick={handleFetchHealthReport}
                disabled={isHealthLoading}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isHealthLoading ? 'Scanning...' : 'Run Diagnostics'}
              </button>
            </div>

            {/* Health status summary stats */}
            {healthReport && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    healthReport.dbConnectivity === 'Healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-450 uppercase font-extrabold tracking-wide">DB Status</p>
                    <p className="text-xs font-extrabold text-surface-900 dark:text-white">{healthReport.dbConnectivity}</p>
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    healthReport.configurationGaps.length === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-450 uppercase font-extrabold tracking-wide">Config Alignments</p>
                    <p className="text-xs font-extrabold text-surface-900 dark:text-white">
                      {healthReport.configurationGaps.length === 0 ? '100% Configured' : `${healthReport.configurationGaps.length} Gaps Detected`}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    healthReport.employeesWithoutWallet.length === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-450 uppercase font-extrabold tracking-wide">Wallet Coverage</p>
                    <p className="text-xs font-extrabold text-surface-900 dark:text-white">
                      {healthReport.employeesWithoutWallet.length === 0 
                        ? '105% Provisioned' 
                        : `${healthReport.totalEmployeesChecked - healthReport.employeesWithoutWallet.length}/${healthReport.totalEmployeesChecked} Active`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {healthReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration alignment checks */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" /> Platform Configuration Alignment
                </h4>
                
                <div className="space-y-3">
                  {/* Values check */}
                  <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-750/30 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">Core Values engine</p>
                      <p className="text-[10px] text-surface-450 mt-0.5">{healthReport.coreValuesCount} loaded values</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      healthReport.coreValuesCount >= 8 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {healthReport.coreValuesCount >= 8 ? 'Aligned' : 'Missing Seeding'}
                    </span>
                  </div>

                  {/* Types check */}
                  <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-750/30 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">Recognition Types engine</p>
                      <p className="text-[10px] text-surface-450 mt-0.5">{healthReport.recognitionTypesCount} loaded types</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      healthReport.recognitionTypesCount >= 6 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {healthReport.recognitionTypesCount >= 6 ? 'Aligned' : 'Missing Seeding'}
                    </span>
                  </div>

                  {/* Rewards Catalog check */}
                  <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-750/30 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">Marketplace Catalog</p>
                      <p className="text-[10px] text-surface-450 mt-0.5">{healthReport.rewardsCatalogCount} active items</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      healthReport.rewardsCatalogCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {healthReport.rewardsCatalogCount > 0 ? 'Healthy' : 'Empty Catalog'}
                    </span>
                  </div>
                </div>

                {healthReport.configurationGaps.length > 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide">Action Items</p>
                    <ul className="text-xs list-disc pl-4 space-y-1 leading-relaxed">
                      {healthReport.configurationGaps.map((gap: string, i: number) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold">All core setups are fully aligned with HR policies.</span>
                  </div>
                )}
              </div>

              {/* Data Integrity & Wallet Coverage */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Wallet Coverage & Integrity
                </h4>

                <div className="space-y-3">
                  <div className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-750/30 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">Active Twin Employees</p>
                      <p className="text-[10px] text-surface-450 mt-0.5">Total checked profiles</p>
                    </div>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{healthReport.totalEmployeesChecked}</span>
                  </div>

                  <div className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-750/30 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-surface-800 dark:text-white">Missing Wallet Allocation</p>
                      <p className="text-[10px] text-surface-450 mt-0.5">Employees without point wallets</p>
                    </div>
                    <span className={`text-base font-black ${
                      healthReport.employeesWithoutWallet.length > 0 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>{healthReport.employeesWithoutWallet.length}</span>
                  </div>
                </div>

                {healthReport.employeesWithoutWallet.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250/30 rounded-xl space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700">Affected Employees</p>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-none">
                        {healthReport.employeesWithoutWallet.map((empId: string) => {
                          const emp = employees.find(e => e.id === empId);
                          return (
                            <div key={empId} className="text-xs font-semibold flex items-center justify-between text-surface-700 dark:text-surface-300">
                              <span>{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee'}</span>
                              <span className="text-[10px] text-surface-400 font-normal font-mono">{empId.substring(0, 8)}...</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={handleProvisionWallets}
                      disabled={isProvisioning}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isProvisioning ? 'Provisioning...' : 'Provision Missing Wallets'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold">100% wallet coverage achieved. All twins have active wallets!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
