import { useState, useRef, useEffect, useCallback } from 'react';
import { toUTC } from '@/lib/date-utils';

interface UseFraudDetectionProps {
  submissionId: number | null;
  onFraudDetected: (type: string, message: string) => void;
  onTimeOutsideUpdated: (time: number) => void;
}

// Clave para localStorage
const FRAUD_STORAGE_KEY = 'fraud_detection_data';

interface FraudStorageData {
  fraudAttempts: number;
  timeOutsideEval: number;
}

export function useFraudDetection({ submissionId, onFraudDetected, onTimeOutsideUpdated }: UseFraudDetectionProps) {
  // Cargar datos iniciales desde localStorage
  const loadInitialData = (): FraudStorageData => {
    if (typeof window === 'undefined') return { fraudAttempts: 0, timeOutsideEval: 0 };
    
    const storedData = localStorage.getItem(FRAUD_STORAGE_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error('Error al cargar datos de fraude:', e);
        return { fraudAttempts: 0, timeOutsideEval: 0 };
      }
    }
    return { fraudAttempts: 0, timeOutsideEval: 0 };
  };

  const initialData = loadInitialData();
  const [fraudAttempts, setFraudAttempts] = useState<number>(initialData.fraudAttempts);
  const [timeOutsideEval, setTimeOutsideEval] = useState<number>(initialData.timeOutsideEval);
  const [leaveTime, setLeaveTime] = useState<number | null>(null);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [currentFraudType, setCurrentFraudType] = useState('');
  const [currentFraudMessage, setCurrentFraudMessage] = useState('');
  const [isDevToolsModalOpen, setIsDevToolsModalOpen] = useState(false);

  // Refs para mantener los valores actualizados en los event listeners
  const fraudAttemptsRef = useRef(fraudAttempts);
  const timeOutsideEvalRef = useRef(timeOutsideEval);
  const leaveTimeRef = useRef(leaveTime);
  const isHelpModalOpenRef = useRef(false);
  // Ref para detectar interacción con el iframe de ayuda
  const isInteractingWithHelpIframeRef = useRef(false);

  // Actualizar refs cuando cambian los estados
  useEffect(() => {
    fraudAttemptsRef.current = fraudAttempts;
    timeOutsideEvalRef.current = timeOutsideEval;
    leaveTimeRef.current = leaveTime;
  }, [fraudAttempts, timeOutsideEval, leaveTime]);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const dataToStore: FraudStorageData = {
      fraudAttempts,
      timeOutsideEval
    };
    
    localStorage.setItem(FRAUD_STORAGE_KEY, JSON.stringify(dataToStore));
  }, [fraudAttempts, timeOutsideEval]);

  // Función para registrar un intento de fraude
  const registerFraudAttempt = useCallback(async (reason: string) => {
    // Si la ayuda está abierta y el blur/focus es causado por interacción con el iframe, ignorar
    if (isHelpModalOpenRef.current && isInteractingWithHelpIframeRef.current) {
      // Resetear el flag después de ignorar el evento
      isInteractingWithHelpIframeRef.current = false;
      return;
    }

    // Si la ayuda está abierta, solo ignorar eventos si el usuario NO ha salido de la pestaña
    if (isHelpModalOpenRef.current) {
      // Detectar si el evento es por cambio de pestaña o pérdida de foco real
      if (reason === 'cambio de pestaña' || reason === 'pérdida de foco de ventana') {
        // Si se sale de la pestaña o ventana, SÍ contar tiempo fuera
        const newLeaveTime = toUTC(new Date()).getTime();
        setLeaveTime(newLeaveTime);
        return;
      }
      // Si es cualquier otro evento (teclas, copiar, etc), ignorar
      return;
    }

    const newLeaveTime = toUTC(new Date()).getTime();
    setLeaveTime(newLeaveTime);

    const fraudMessage = `Intento de fraude detectado: ${reason}`;
    console.log(fraudMessage);

    setCurrentFraudType(reason);
    setCurrentFraudMessage(fraudMessage);
    setIsFraudModalOpen(true);

    setFraudAttempts(prev => prev + 1);
    onFraudDetected(reason, fraudMessage);
  }, [onFraudDetected]);

  // Función para registrar el regreso del usuario
  const registerUserReturn = useCallback(async () => {
    if (leaveTimeRef.current !== null) {
      const timeAway = Math.floor((Date.now() - leaveTimeRef.current) / 1000);
      setLeaveTime(null);

      setTimeOutsideEval(prev => {
        const nextTimeOutsideEval = prev + timeAway;
        onTimeOutsideUpdated(nextTimeOutsideEval);
        return nextTimeOutsideEval;
      });
    }
  }, [onTimeOutsideUpdated]);

  // Configurar event listeners para detección de fraude
  useEffect(() => {
    if (!submissionId) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        registerFraudAttempt('cambio de pestaña');
      } else {
        registerUserReturn();
      }
    };

    const handleWindowBlur = async () => {
      // Esperar un tick para que document.activeElement se actualice
      setTimeout(() => {
        // Si la ayuda está abierta y el foco fue al iframe de ayuda, ignorar el blur
        if (isHelpModalOpenRef.current) {
          const iframe = document.querySelector('iframe');
          if (iframe && document.activeElement === iframe) {
            // No contar tiempo fuera ni fraude
            return;
          }
        }
        // Si no, registrar intento de fraude normalmente
        registerFraudAttempt('pérdida de foco de ventana');
      }, 0);
    };

    const handleWindowFocus = async () => {
      registerUserReturn();
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.altKey && e.key === 'Tab') ||
        e.key === 'Meta' ||
        (e.ctrlKey && e.key === 'Escape') ||
        (e.ctrlKey && e.key === 'n')) {
        registerFraudAttempt(`uso de tecla sospechosa: ${e.key}`);
        e.preventDefault();
        return false;
      }
    };

    const handleResize = async () => {
      if (window.outerHeight < window.innerHeight ||
        window.outerWidth < window.innerWidth) {
        registerFraudAttempt('cambio de tamaño de ventana');
      }
    };

    const handleCopy = async (e: ClipboardEvent) => {
      registerFraudAttempt('intento de copiar contenido');
      e.preventDefault();
      return false;
    };

    const handlePaste = async (e: ClipboardEvent) => {
      registerFraudAttempt('intento de pegar contenido');
      e.preventDefault();
      return false;
    };

    const handleDragStart = async (e: DragEvent) => {
      registerFraudAttempt('intento de arrastrar contenido');
      e.preventDefault();
      return false;
    };

    const handleBeforePrint = async () => {
      registerFraudAttempt('intento de imprimir');
    };

    const handleShare = async () => {
      registerFraudAttempt('intento de compartir contenido');
    };

    // Registrar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('beforeprint', handleBeforePrint);

    // Interceptar la API de compartir si está disponible
    const originalShare = navigator.share;
    if (navigator.share) {
      navigator.share = async () => {
        handleShare();
        return Promise.reject(new Error('Compartir no está permitido durante la evaluación'));
      };
    }

    // Si existe el iframe de ayuda, agregar listeners para detectar interacción
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('mousedown', () => {
        isInteractingWithHelpIframeRef.current = true;
      });
      iframe.addEventListener('focus', () => {
        isInteractingWithHelpIframeRef.current = true;
      });
    }

    // Detector de DevTools
    let devtoolsOpen = false;
    const threshold = 160;
    const devtoolsInterval = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          setIsDevToolsModalOpen(true);
        }
      } else {
        devtoolsOpen = false;
      }
    }, 500);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('beforeprint', handleBeforePrint);

      if (navigator.share && originalShare) {
        navigator.share = originalShare;
      }

      if (iframe) {
        iframe.removeEventListener('mousedown', () => {
          isInteractingWithHelpIframeRef.current = true;
        });
        iframe.removeEventListener('focus', () => {
          isInteractingWithHelpIframeRef.current = true;
        });
      }

      clearInterval(devtoolsInterval);
    };
  }, [submissionId, registerFraudAttempt, registerUserReturn]);

  return {
    fraudAttempts,
    timeOutsideEval,
    isFraudModalOpen,
    currentFraudType,
    currentFraudMessage,
    setIsFraudModalOpen,
    setHelpModalOpen: (isOpen: boolean) => {
      isHelpModalOpenRef.current = isOpen;
    },
    isDevToolsModalOpen,
    setIsDevToolsModalOpen
  };
}