'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { generateFraudReflection } from '@/lib/fraud-reflection';

interface FraudReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fraudMessage?: string;
}

export function FraudReflectionModal({
  isOpen,
  onClose,
  fraudMessage = 'Se ha detectado un comportamiento sospechoso',
}: FraudReflectionModalProps) {
  const [reflection, setReflection] = useState({
    title: 'Integridad Académica',
    message: 'Hemos detectado un comportamiento que podría comprometer la integridad de la evaluación.',
    suggestion: 'Por favor, continúa la evaluación sin utilizar recursos externos no autorizados.'
  });
  const [counter, setCounter] = useState(30);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCounter(30);
      setCanClose(false);
      generateFraudReflection()
        .then(result => {
          setReflection(result);
        });
      timer = setInterval(() => {
        setCounter(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && canClose && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-xl font-bold text-red-600 dark:text-red-400">
            {reflection.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-4">
            <div className="space-y-4">
              <p className="text-sm font-medium text-red-500 dark:text-red-400 mb-3">
                {fraudMessage}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-base font-medium text-center italic">
                  <span className="text-3xl text-blue-500 dark:text-blue-400 font-serif">❝</span>
                  <span className="px-2">{reflection.message}</span>
                  <span className="text-3xl text-blue-500 dark:text-blue-400 font-serif">❞</span>
                </p>
              </div>
              <p className="text-sm italic text-center">{reflection.suggestion}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!canClose}
          >
            {canClose ? 'Entendido, continuaré con integridad' : `Por favor, lee la reflexión (${counter})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}