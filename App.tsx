
import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { OtpVerificationScreen } from './components/OtpVerificationScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DutyScreen } from './components/DutyScreen';
import { MapScreen } from './components/MapScreen';
import { CheckInConfirmationScreen } from './components/CheckInConfirmationScreen';
import { SosScreen } from './components/SosScreen';
import { ChatScreen } from './components/ChatScreen';
import { NotificationCenter } from './components/NotificationCenter';
import { SettingsScreen } from './components/SettingsScreen';
import { WeeklyScheduleScreen } from './components/WeeklyScheduleScreen';
import { DutyPointDetailScreen } from './components/DutyPointDetailScreen';
import { TeamContactsScreen } from './components/TeamContactsScreen';
import { LeaveRequestScreen } from './components/LeaveRequestScreen';
import { ShiftSwapScreen } from './components/ShiftSwapScreen';
import { ReliefHandoverScreen } from './components/ReliefHandoverScreen';
import { PointBriefingScreen } from './components/PointBriefingScreen';
import { AttendanceStatsScreen } from './components/AttendanceStatsScreen';
import { AdminConvoyScreen } from './components/AdminConvoyScreen';
import { AdminMapScreen } from './components/AdminMapScreen';
import { OfflineBanner } from './components/OfflineBanner';
import { SyncStatusChip } from './components/SyncStatusChip';
import { SyncToast } from './components/SyncToast';

type ScreenStep = 'SPLASH' | 'LOGIN' | 'VERIFY' | 'ONBOARDING' | 'DUTY' | 'MAP' | 'CHECKIN_CONFIRM' | 'SOS' | 'CHAT' | 'NOTIFICATIONS' | 'SETTINGS' | 'SCHEDULE' | 'POINT_DETAIL' | 'TEAM_CONTACTS' | 'LEAVE_REQUEST' | 'SHIFT_SWAP' | 'RELIEF_HANDOVER' | 'POINT_BRIEFING' | 'ATTENDANCE_STATS' | 'ADMIN_CONVOY' | 'ADMIN_MAP';

const App: React.FC = () => {
  const [step, setStep] = useState<ScreenStep>('SPLASH');
  const [mobileNumber, setMobileNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [userRank, setUserRank] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeConvoyMission, setActiveConvoyMission] = useState<any>(null);
  
  // Persistent GPS interval state
  const [gpsInterval, setGpsInterval] = useState<number>(() => {
    const saved = localStorage.getItem('gp_ebandobast_gps_interval');
    return saved ? parseInt(saved, 10) : 30000;
  });

  useEffect(() => {
    localStorage.setItem('gp_ebandobast_gps_interval', gpsInterval.toString());
  }, [gpsInterval]);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [showSyncToast, setShowSyncToast] = useState(false);

  // Native Android Back Button Integration
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (step !== 'LOGIN' && step !== 'DUTY' && step !== 'SPLASH' && step !== 'ONBOARDING') {
        event.preventDefault();
        setStep('DUTY');
        window.history.pushState({ step: 'DUTY' }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [step]);

  useEffect(() => {
    if (step === 'SPLASH') {
      const timer = setTimeout(() => {
        setStep('LOGIN');
        window.history.pushState({ step: 'LOGIN' }, '');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (pendingActions > 0) triggerSync();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions]);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setPendingActions(0);
      setLastSyncTime(new Date());
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 2000);
  };

  const incrementPendingActions = () => {
    if (isOffline) setPendingActions(prev => prev + 1);
  };

  const handleOtpSent = (number: string) => {
    setMobileNumber(number);
    setStep('VERIFY');
    window.history.pushState({ step: 'VERIFY' }, '');
  };

  const handleBackToLogin = () => {
    setStep('LOGIN');
    window.history.back();
  };

  const handleLoginSuccess = (adminMode: boolean) => {
    setIsAdmin(adminMode);
    
    // Check if it's the specific test admin number
    if (mobileNumber === '123456789') {
      setUserName('રાકેશ જાડેજા');
      setUserRank('PI');
      setStep('DUTY');
      window.history.pushState({ step: 'DUTY' }, '');
    } else {
      // For any other number, if we don't have a name yet, go to Onboarding
      if (!userName) {
        setStep('ONBOARDING');
        window.history.pushState({ step: 'ONBOARDING' }, '');
      } else {
        setStep('DUTY');
        window.history.pushState({ step: 'DUTY' }, '');
      }
    }
  };

  const handleOnboardingComplete = (name: string, rank: string) => {
    setUserName(name);
    setUserRank(rank);
    setStep('DUTY');
    window.history.pushState({ step: 'DUTY' }, '');
  };

  const handleGoToMap = () => {
    setStep('MAP');
    window.history.pushState({ step: 'MAP' }, '');
  };

  const handleBackToDuty = () => {
    if (window.history.length > 1) {
       window.history.back();
    } else {
       setStep('DUTY');
    }
  };

  const handleCheckIn = () => {
    incrementPendingActions();
    setIsOnDuty(true);
    setStep('CHECKIN_CONFIRM');
    window.history.pushState({ step: 'CHECKIN_CONFIRM' }, '');
  };

  const handleLogout = () => {
    setStep('LOGIN');
    setIsAdmin(false);
    setIsOnDuty(false);
    setMobileNumber('');
    setUserName('');
    setUserRank('');
    setActiveConvoyMission(null);
    window.history.pushState({ step: 'LOGIN' }, '');
  };

  const handleReportSubmitted = (data: any) => {
    incrementPendingActions();
    // Detect convoy mission by checking for 'legs' array or specific type
    if (data && (data.legs || (data.origin && data.destination))) {
      setActiveConvoyMission(data);
    }
    if (!isOffline) {
        setShowSyncToast(true);
        setTimeout(() => setShowSyncToast(false), 3000);
    }
    setStep('DUTY');
  };

  const navigateTo = (newStep: ScreenStep) => {
    setStep(newStep);
    window.history.pushState({ step: newStep }, '');
  };

  return (
    <div className={`w-full h-full flex flex-col transition-colors duration-500 overflow-hidden bg-black pt-safe pb-safe`}>
      <div className={`relative flex-1 w-full h-full overflow-hidden flex flex-col transition-colors duration-500 ${
        step === 'SPLASH' ? 'bg-[#0033A0]' :
        step === 'LOGIN' ? 'bg-gradient-to-b from-[#001f3f] via-[#000d1a] to-black' : 
        step === 'SOS' ? 'bg-[#D50000]' : 
        isDarkMode ? 'bg-[#121212]' : 'bg-gray-100'
      }`}>
        
        {isOffline && step !== 'SPLASH' && <OfflineBanner />}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {step === 'SPLASH' && <SplashScreen />}
          {step === 'LOGIN' && <LoginScreen onOtpSent={handleOtpSent} />}
          {step === 'VERIFY' && (
            <OtpVerificationScreen 
              mobileNumber={mobileNumber} 
              onBack={handleBackToLogin}
              onSuccess={handleLoginSuccess}
              isDarkMode={isDarkMode}
            />
          )}
          {step === 'ONBOARDING' && (
            <OnboardingScreen 
              onComplete={handleOnboardingComplete} 
              isDarkMode={isDarkMode} 
            />
          )}
          {step === 'DUTY' && (
            <DutyScreen 
              isAdmin={isAdmin}
              isOnDuty={isOnDuty}
              userName={userName}
              userRank={userRank}
              onOpenMap={handleGoToMap} 
              onCheckIn={handleCheckIn}
              onCheckOut={() => navigateTo('RELIEF_HANDOVER')}
              onSos={() => navigateTo('SOS')} 
              onOpenChat={() => navigateTo('CHAT')}
              onOpenNotifications={() => navigateTo('NOTIFICATIONS')}
              onOpenSettings={() => navigateTo('SETTINGS')}
              onOpenSchedule={() => navigateTo('SCHEDULE')}
              onOpenPointDetail={() => navigateTo('POINT_DETAIL')}
              onOpenTeamContacts={() => navigateTo('TEAM_CONTACTS')}
              onOpenLeaveRequest={() => navigateTo('LEAVE_REQUEST')}
              onOpenShiftSwap={() => navigateTo('SHIFT_SWAP')}
              onOpenReliefHandover={() => navigateTo('RELIEF_HANDOVER')}
              onOpenBriefing={() => navigateTo('POINT_BRIEFING')}
              onOpenAttendanceStats={() => navigateTo('ATTENDANCE_STATS')}
              onOpenAdminConvoy={() => navigateTo('ADMIN_CONVOY')}
              onOpenAdminMap={() => navigateTo('ADMIN_MAP')}
              isDarkMode={isDarkMode}
              mobileNumber={mobileNumber}
              gpsInterval={gpsInterval}
            />
          )}
          {step === 'MAP' && <MapScreen onBack={handleBackToDuty} isDarkMode={isDarkMode} gpsInterval={gpsInterval} />}
          {step === 'CHECKIN_CONFIRM' && <CheckInConfirmationScreen onConfirm={handleBackToDuty} isDarkMode={isDarkMode} />}
          {step === 'SOS' && <SosScreen onCancel={handleBackToDuty} />}
          {step === 'CHAT' && (
            <ChatScreen 
              onBack={handleBackToDuty} 
              onSendMessageHook={incrementPendingActions}
              isDarkMode={isDarkMode}
            />
          )}
          {step === 'NOTIFICATIONS' && <NotificationCenter onBack={handleBackToDuty} isDarkMode={isDarkMode} />}
          {step === 'SETTINGS' && (
            <SettingsScreen 
              onBack={handleBackToDuty} 
              onLogout={handleLogout} 
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              mobileNumber={mobileNumber}
              userName={userName}
              setUserName={setUserName}
              userRank={userRank}
              setUserRank={setUserRank}
              gpsInterval={gpsInterval}
              setGpsInterval={setGpsInterval}
            />
          )}
          {step === 'SCHEDULE' && <WeeklyScheduleScreen onBack={handleBackToDuty} isDarkMode={isDarkMode} />}
          {step === 'POINT_DETAIL' && <DutyPointDetailScreen onBack={handleBackToDuty} onSubmit={handleReportSubmitted} isDarkMode={isDarkMode} />}
          {step === 'TEAM_CONTACTS' && <TeamContactsScreen onBack={handleBackToDuty} isDarkMode={isDarkMode} />}
          {step === 'LEAVE_REQUEST' && <LeaveRequestScreen onBack={handleBackToDuty} onSubmit={handleReportSubmitted} isDarkMode={isDarkMode} />}
          {step === 'SHIFT_SWAP' && <ShiftSwapScreen onBack={handleBackToDuty} onSubmit={handleReportSubmitted} isDarkMode={isDarkMode} />}
          {step === 'RELIEF_HANDOVER' && <ReliefHandoverScreen onBack={handleBackToDuty} onSubmit={handleReportSubmitted} isDarkMode={isDarkMode} />}
          {step === 'POINT_BRIEFING' && <PointBriefingScreen onBack={handleBackToDuty} isDarkMode={isDarkMode} />}
          {step === 'ATTENDANCE_STATS' && <AttendanceStatsScreen onBack={handleBackToDuty} isDarkMode={isDarkMode} />}
          {step === 'ADMIN_CONVOY' && <AdminConvoyScreen onBack={handleBackToDuty} onSubmit={handleReportSubmitted} isDarkMode={isDarkMode} />}
          {step === 'ADMIN_MAP' && (
            <AdminMapScreen 
              onBack={handleBackToDuty} 
              onOpenChat={() => navigateTo('CHAT')}
              isDarkMode={isDarkMode} 
              activeConvoyMission={activeConvoyMission}
            />
          )}

          {step !== 'SPLASH' && step !== 'LOGIN' && step !== 'VERIFY' && step !== 'SOS' && step !== 'ONBOARDING' && (
            <>
              <SyncStatusChip 
                isSyncing={isSyncing} 
                pendingActions={pendingActions} 
                lastSyncTime={lastSyncTime} 
                isDarkMode={isDarkMode}
              />
              <SyncToast show={showSyncToast} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
